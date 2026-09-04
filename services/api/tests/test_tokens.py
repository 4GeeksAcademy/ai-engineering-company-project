"""Access and reset token validation (expired, malformed, wrong type)."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from tests.helpers import auth_header, client, register
from app.auth.security import create_access_token, create_reset_token
from app.auth.service import create_password_reset, get_user_by_email


def test_valid_token_unlocks_protected_route() -> None:
    headers = auth_header()
    response = client.get("/suppliers", headers=headers)
    assert response.status_code == 200


def test_malformed_and_expired_token_401() -> None:
    assert (
        client.get("/suppliers", headers={"Authorization": "Bearer not-a-jwt"}).status_code
        == 401
    )
    register(email="exp@healthcore.example")
    user = get_user_by_email("exp@healthcore.example")
    expired = create_access_token(user_id=user["id"], expires_minutes=-1)
    assert (
        client.get("/suppliers", headers={"Authorization": f"Bearer {expired}"}).status_code
        == 401
    )


def test_reset_token_rejected_as_bearer() -> None:
    register(email="reset-bearer@healthcore.example")
    user = get_user_by_email("reset-bearer@healthcore.example")
    jti = create_password_reset(
        user["id"], datetime.now(timezone.utc) + timedelta(minutes=30)
    )
    reset_jwt = create_reset_token(user_id=user["id"], jti=jti)
    assert (
        client.get("/auth/me", headers={"Authorization": f"Bearer {reset_jwt}"}).status_code
        == 401
    )
