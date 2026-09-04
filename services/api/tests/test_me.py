"""GET /auth/me."""

from __future__ import annotations

from tests.helpers import auth_header, client, login, register
from app.auth.service import get_user_by_email, update_user


def test_me_returns_email_role_and_profile() -> None:
    register()
    token = login().json()["access_token"]
    me = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me.status_code == 200
    body = me.json()
    assert body["email"] == "alice@healthcore.example"
    assert body["role"] == "user"
    assert "profile" in body


def test_me_rejects_token_after_user_deactivated() -> None:
    headers = auth_header(email="deact@healthcore.example")
    assert client.get("/auth/me", headers=headers).status_code == 200
    user = get_user_by_email("deact@healthcore.example")
    update_user(user["id"], {"is_active": False})
    assert client.get("/auth/me", headers=headers).status_code == 401


def test_me_requires_token() -> None:
    assert client.get("/auth/me").status_code == 401
