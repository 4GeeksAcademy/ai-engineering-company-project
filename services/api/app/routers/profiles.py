"""Profile routes for the authenticated user."""

from __future__ import annotations

from typing import Any

from fastapi import APIRouter, Depends, HTTPException

from app.auth.models import ProfilePublic, ProfileUpdate
from app.auth.security import get_current_user
from app.auth.service import get_profile_by_user_id, update_profile

router = APIRouter(prefix="/profiles", tags=["profiles"])


@router.get("/me", response_model=ProfilePublic)
def read_my_profile(
    current: dict[str, Any] = Depends(get_current_user),
) -> ProfilePublic:
    profile = get_profile_by_user_id(current["id"])
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfilePublic.model_validate(profile)


@router.put("/me", response_model=ProfilePublic)
def update_my_profile(
    payload: ProfileUpdate,
    current: dict[str, Any] = Depends(get_current_user),
) -> ProfilePublic:
    updated = update_profile(current["id"], payload.model_dump(exclude_unset=True))
    if updated is None:
        raise HTTPException(status_code=404, detail="Profile not found")
    return ProfilePublic.model_validate(updated)
