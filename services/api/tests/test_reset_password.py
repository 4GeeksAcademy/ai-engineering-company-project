"""POST /auth/reset-password."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from jose import jwt as jose_jwt

from tests.helpers import client, login, register
from app.auth import config
from app.auth.security import ALGORITHM, create_access_token, create_reset_token
from app.auth.service import create_password_reset, get_user_by_email


def test_reset_password_then_login() -> None:
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
    assert first.status_code == 200
    assert (
        login(email="reset2@healthcore.example", password="newpass1").status_code == 200
    )


def test_reset_token_single_use() -> None:
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
    assert first.status_code == 200
    second = client.post(
        "/auth/reset-password",
        json={"token": token, "new_password": "newpass2"},
    )
    assert second.status_code == 400
    assert (
        login(email="reset2@healthcore.example", password="newpass1").status_code == 200
    )


def test_expired_reset_token_400() -> None:
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
    assert response.status_code == 400


def test_malformed_reset_token_400() -> None:
    response = client.post(
        "/auth/reset-password",
        json={"token": "not-a-jwt", "new_password": "newpass1"},
    )
    assert response.status_code == 400


def test_access_token_rejected_as_reset_token() -> None:
    register(email="access-as-reset@healthcore.example")
    user = get_user_by_email("access-as-reset@healthcore.example")
    access = create_access_token(user_id=user["id"])
    response = client.post(
        "/auth/reset-password",
        json={"token": access, "new_password": "newpass1"},
    )
    assert response.status_code == 400
    assert login(email="access-as-reset@healthcore.example").status_code == 200
