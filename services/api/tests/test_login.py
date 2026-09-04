"""POST /auth/login."""

from __future__ import annotations

from jose import jwt as jose_jwt

from tests.helpers import login, register
from app.auth import config
from app.auth.models import Role
from app.auth.security import ALGORITHM, hash_password
from app.auth.service import create_user, get_user_by_email


def test_login_returns_jwt_with_user_sub() -> None:
    register()
    response = login()
    assert response.status_code == 200
    body = response.json()
    token = body["access_token"]
    assert token
    assert body["token_type"] == "bearer"
    user = get_user_by_email("alice@healthcore.example")
    claims = jose_jwt.decode(token, config.secret_key(), algorithms=[ALGORITHM])
    assert claims["sub"] == str(user["id"])
    assert "exp" in claims


def test_login_rejects_empty_credentials() -> None:
    register()
    response = login(email="", password="")
    assert response.status_code in (401, 422)


def test_login_rejects_invalid_credentials() -> None:
    register()
    assert login(password="wrong-password").status_code == 401
    assert login(email="nobody@healthcore.example").status_code == 401


def test_login_rejects_inactive_user() -> None:
    create_user(
        email="inactive@healthcore.example",
        hashed_password=hash_password("secret123"),
        role=Role.user,
        is_active=False,
    )
    assert login(email="inactive@healthcore.example").status_code == 401
