"""User credential CRUD. Profile/contact fields are not stored on User."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status

from app.auth.models import Role, UserCreate, UserPublic, UserUpdate
from app.auth.security import get_current_user, hash_password
from app.auth.service import (
    create_user,
    delete_user,
    get_user_by_email,
    get_user_by_id,
    list_users,
    update_user,
)

router = APIRouter(prefix="/users", tags=["users"])


def _public(user: dict[str, Any]) -> UserPublic:
    return UserPublic.model_validate(
        {
            "id": user["id"],
            "email": user["email"],
            "is_active": user["is_active"],
            "role": user["role"],
            "created_at": user["created_at"],
        }
    )


def _can_manage(current: dict[str, Any], user_id: int) -> bool:
    return current["id"] == user_id or current.get("role") == Role.admin.value


@router.post("", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate) -> UserPublic:
    if get_user_by_email(payload.email) is not None:
        raise HTTPException(status_code=409, detail="Email already registered")
    user = create_user(
        email=payload.email,
        hashed_password=hash_password(payload.password),
        role=Role.user,
        name=payload.name,
        phone=payload.phone,
        address=payload.address,
    )
    return _public(user)


@router.get("", response_model=list[UserPublic])
def read_users(_current: dict[str, Any] = Depends(get_current_user)) -> list[UserPublic]:
    return [_public(user) for user in list_users()]


@router.get("/{user_id}", response_model=UserPublic)
def read_user(
    user_id: int, current: dict[str, Any] = Depends(get_current_user)
) -> UserPublic:
    user = get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if not _can_manage(current, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    return _public(user)


@router.put("/{user_id}", response_model=UserPublic)
def update_credentials(
    user_id: int,
    payload: UserUpdate,
    current: dict[str, Any] = Depends(get_current_user),
) -> UserPublic:
    user = get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if not _can_manage(current, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")

    updates: dict[str, Any] = {}
    data = payload.model_dump(exclude_unset=True)
    if "role" in data:
        if current.get("role") != Role.admin.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only an admin may update role",
            )
        updates["role"] = data["role"]
    if "email" in data:
        other = get_user_by_email(data["email"])
        if other is not None and other["id"] != user_id:
            raise HTTPException(status_code=409, detail="Email already registered")
        updates["email"] = data["email"]
    if "password" in data and data["password"]:
        updates["hashed_password"] = hash_password(data["password"])
    if "is_active" in data:
        if current.get("role") != Role.admin.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not allowed",
            )
        updates["is_active"] = data["is_active"]

    updated = update_user(user_id, updates)
    return _public(updated)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user(
    user_id: int, current: dict[str, Any] = Depends(get_current_user)
) -> None:
    if not _can_manage(current, user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not allowed")
    if not delete_user(user_id):
        raise HTTPException(status_code=404, detail="User not found")
