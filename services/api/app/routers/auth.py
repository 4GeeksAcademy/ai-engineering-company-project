"""Auth routes: login, me, password reset and change."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from jose import JWTError, jwt

from app.auth import config
from app.auth.email import send_reset_email
from app.auth.models import (
    ChangePasswordRequest,
    ForgotPasswordRequest,
    MeResponse,
    MessageResponse,
    ProfilePublic,
    ResetPasswordRequest,
    Role,
    TokenResponse,
)
from app.auth.security import (
    ALGORITHM,
    create_access_token,
    create_reset_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.auth.service import (
    get_password_reset,
    get_profile_by_user_id,
    get_user_by_email,
    invalidate_resets_for_user,
    create_password_reset,
    update_user,
)

router = APIRouter(prefix="/auth", tags=["auth"])

GENERIC_FORGOT = "If that address is registered, you'll receive a link shortly."


def _profile_public(user_id: int) -> ProfilePublic:
    profile = get_profile_by_user_id(user_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfilePublic.model_validate(profile)


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends()) -> TokenResponse:
    user = get_user_by_email(form.username)
    if (
        user is None
        or not user.get("is_active", True)
        or not verify_password(form.password, user["hashed_password"])
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = create_access_token(user_id=user["id"])
    return TokenResponse(access_token=token)


@router.get("/me", response_model=MeResponse)
def read_me(current: dict[str, Any] = Depends(get_current_user)) -> MeResponse:
    return MeResponse(
        email=user_email(current),
        role=Role(current["role"]),
        profile=_profile_public(current["id"]),
    )


def user_email(current: dict[str, Any]) -> str:
    return current["email"]


@router.post("/forgot-password", response_model=MessageResponse)
def forgot_password(payload: ForgotPasswordRequest) -> MessageResponse:
    user = get_user_by_email(payload.email)
    if user is not None and user.get("is_active", True):
        expires = datetime.now(timezone.utc) + timedelta(
            minutes=config.reset_token_expire_minutes()
        )
        jti = create_password_reset(user["id"], expires)
        token = create_reset_token(user_id=user["id"], jti=jti)
        reset_url = (
            f"{config.frontend_base_url()}/reset-password?token={quote(token, safe='')}"
        )
        send_reset_email(to_email=user["email"], reset_url=reset_url)
    return MessageResponse(detail=GENERIC_FORGOT)


@router.post("/reset-password", response_model=MessageResponse)
def reset_password(payload: ResetPasswordRequest) -> MessageResponse:
    try:
        claims = jwt.decode(
            payload.token, config.secret_key(), algorithms=[ALGORITHM]
        )
    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        ) from exc

    if claims.get("typ") != "reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    jti = claims.get("jti")
    record = get_password_reset(jti) if jti else None
    if record is None or record.get("used_at"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )
    expires_at = datetime.fromisoformat(record["expires_at"])
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    update_user(record["user_id"], {"hashed_password": hash_password(payload.new_password)})
    invalidate_resets_for_user(record["user_id"])
    return MessageResponse(detail="Password updated. You can sign in.")


@router.post("/change-password", response_model=MessageResponse)
def change_password(
    payload: ChangePasswordRequest,
    current: dict[str, Any] = Depends(get_current_user),
) -> MessageResponse:
    if not verify_password(payload.current_password, current["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect",
        )
    update_user(
        current["id"], {"hashed_password": hash_password(payload.new_password)}
    )
    invalidate_resets_for_user(current["id"])
    return MessageResponse(detail="Password updated.")
