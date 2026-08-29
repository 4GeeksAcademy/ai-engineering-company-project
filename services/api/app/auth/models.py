"""Pydantic models for User and Profile. Contact data lives only on Profile."""

from __future__ import annotations

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class Role(str, Enum):
    admin = "admin"
    manager = "manager"
    user = "user"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(default=None, min_length=1)
    role: Optional[Role] = None
    is_active: Optional[bool] = None


class UserPublic(BaseModel):
    id: int
    email: EmailStr
    is_active: bool
    role: Role
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ProfilePublic(BaseModel):
    id: int
    user_id: int
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class MeResponse(BaseModel):
    email: EmailStr
    role: Role
    profile: ProfilePublic


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=1)


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1)
    new_password: str = Field(min_length=1)


class MessageResponse(BaseModel):
    detail: str
