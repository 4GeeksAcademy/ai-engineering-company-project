"""AUTH-01 and AUTH-03 API tests."""

from __future__ import annotations

import unittest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from tests.helpers import auth_header, client, login, register, reset_auth_db
from jose import jwt as jose_jwt
from app.auth import config
from app.auth.models import Role
from app.auth.security import ALGORITHM, create_access_token, create_reset_token, hash_password
from app.auth.service import create_password_reset, create_user, get_user_by_email


class AuthApiTest(unittest.TestCase):
    def setUp(self) -> None:
        reset_auth_db()

    def test_register_creates_user_and_profile_without_password_hash(self) -> None:
        response = register(name="Alice", phone="555", address="1 Clinic Rd")
        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertEqual(body["email"], "alice@healthcore.example")
        self.assertEqual(body["role"], "user")
        self.assertNotIn("hashed_password", body)
        self.assertNotIn("password", body)
        user = get_user_by_email("alice@healthcore.example")
        self.assertIsNotNone(user)
        self.assertTrue(str(user["hashed_password"]).startswith("$2"))
        self.assertNotEqual(user["hashed_password"], "secret123")

        headers = {
            "Authorization": f"Bearer {login().json()['access_token']}"
        }
        me = client.get("/auth/me", headers=headers)
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()["profile"]["name"], "Alice")
        self.assertEqual(me.json()["profile"]["phone"], "555")

    def test_invalid_role_rejected_on_update_without_admin(self) -> None:
        headers = auth_header()
        uid = client.get("/users", headers=headers).json()[0]["id"]
        response = client.put(
            f"/users/{uid}",
            headers=headers,
            json={"role": "superuser"},
        )
        self.assertEqual(response.status_code, 422)
        forbidden = client.put(
            f"/users/{uid}",
            headers=headers,
            json={"role": "admin"},
        )
        self.assertEqual(forbidden.status_code, 403)

    def test_login_returns_jwt_and_me(self) -> None:
        register()
        response = login()
        self.assertEqual(response.status_code, 200)
        token = response.json()["access_token"]
        self.assertTrue(token)
        me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(me.status_code, 200)
        self.assertEqual(me.json()["email"], "alice@healthcore.example")
        self.assertEqual(me.json()["role"], "user")
        self.assertIn("profile", me.json())

    def test_protected_route_requires_token(self) -> None:
        self.assertEqual(client.get("/suppliers").status_code, 401)
        self.assertEqual(client.get("/users").status_code, 401)
        self.assertEqual(client.get("/auth/me").status_code, 401)

    def test_malformed_and_expired_token_401(self) -> None:
        headers = auth_header()
        self.assertEqual(
            client.get("/suppliers", headers={"Authorization": "Bearer not-a-jwt"}).status_code,
            401,
        )
        register(email="exp@healthcore.example")
        user = get_user_by_email("exp@healthcore.example")
        expired = create_access_token(user_id=user["id"], expires_minutes=-1)
        self.assertEqual(
            client.get(
                "/suppliers", headers={"Authorization": f"Bearer {expired}"}
            ).status_code,
            401,
        )
        _ = headers

    def test_cross_user_update_forbidden(self) -> None:
        headers_a = auth_header(email="a@healthcore.example")
        register(email="b@healthcore.example", password="secret123")
        user_b = get_user_by_email("b@healthcore.example")
        response = client.put(
            f"/users/{user_b['id']}",
            headers=headers_a,
            json={"email": "stolen@healthcore.example"},
        )
        self.assertEqual(response.status_code, 403)
        profile = client.put(
            "/profiles/me",
            headers=headers_a,
            json={"name": "Alice A"},
        )
        self.assertEqual(profile.status_code, 200)

    def test_suppliers_work_with_token(self) -> None:
        headers = auth_header()
        response = client.get("/suppliers", headers=headers)
        self.assertIn(response.status_code, (200, 200))
        self.assertEqual(response.status_code, 200)

    def test_forgot_password_always_200(self) -> None:
        with patch("app.routers.auth.send_reset_email") as mocked:
            unknown = client.post(
                "/auth/forgot-password", json={"email": "nobody@healthcore.example"}
            )
            self.assertEqual(unknown.status_code, 200)
            mocked.assert_not_called()
            register(email="reset@healthcore.example")
            known = client.post(
                "/auth/forgot-password", json={"email": "reset@healthcore.example"}
            )
            self.assertEqual(known.status_code, 200)
            mocked.assert_called_once()

    def test_forgot_password_still_200_when_email_send_fails(self) -> None:
        register(email="reset-fail@healthcore.example")
        with patch(
            "app.routers.auth.send_reset_email",
            side_effect=OSError("network down"),
        ):
            response = client.post(
                "/auth/forgot-password",
                json={"email": "reset-fail@healthcore.example"},
            )
        self.assertEqual(response.status_code, 200)
        self.assertNotIn("network down", response.text)

    def test_reset_token_single_use(self) -> None:
        register(email="reset2@healthcore.example")
        user = get_user_by_email("reset2@healthcore.example")
        jti = create_password_reset(
            user["id"], datetime.now(timezone.utc) + timedelta(minutes=30)
        )
        token = create_reset_token(user_id=user["id"], jti=jti)
        first = client.post(
            "/auth/reset-password",
            json={"token": token, "new_password": "newpass1"},
        )
        self.assertEqual(first.status_code, 200)
        second = client.post(
            "/auth/reset-password",
            json={"token": token, "new_password": "newpass2"},
        )
        self.assertEqual(second.status_code, 400)
        self.assertEqual(
            login(email="reset2@healthcore.example", password="newpass1").status_code,
            200,
        )

    def test_expired_reset_token_400(self) -> None:
        register(email="reset3@healthcore.example")
        user = get_user_by_email("reset3@healthcore.example")
        jti = create_password_reset(
            user["id"], datetime.now(timezone.utc) + timedelta(minutes=30)
        )
        expired = jose_jwt.encode(
            {
                "sub": str(user["id"]),
                "jti": jti,
                "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
                "typ": "reset",
            },
            config.secret_key(),
            algorithm=ALGORITHM,
        )
        response = client.post(
            "/auth/reset-password",
            json={"token": expired, "new_password": "newpass1"},
        )
        self.assertEqual(response.status_code, 400)

    def test_admin_can_update_role(self) -> None:
        create_user(
            email="admin@healthcore.example",
            hashed_password=hash_password("adminpass"),
            role=Role.admin,
        )
        register(email="staff@healthcore.example")
        staff = get_user_by_email("staff@healthcore.example")
        token = login(email="admin@healthcore.example", password="adminpass").json()[
            "access_token"
        ]
        response = client.put(
            f"/users/{staff['id']}",
            headers={"Authorization": f"Bearer {token}"},
            json={"role": "manager"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["role"], "manager")

    def test_change_password_requires_current(self) -> None:
        headers = auth_header(email="chg@healthcore.example")
        self.assertEqual(client.post("/auth/change-password").status_code, 401)
        wrong = client.post(
            "/auth/change-password",
            headers=headers,
            json={"current_password": "wrong", "new_password": "next123"},
        )
        self.assertEqual(wrong.status_code, 400)
        ok = client.post(
            "/auth/change-password",
            headers=headers,
            json={"current_password": "secret123", "new_password": "next123"},
        )
        self.assertEqual(ok.status_code, 200)
        self.assertEqual(
            login(email="chg@healthcore.example", password="next123").status_code,
            200,
        )


if __name__ == "__main__":
    unittest.main()
