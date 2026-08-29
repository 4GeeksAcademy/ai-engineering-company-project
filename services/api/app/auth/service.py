"""User, profile, and password-reset persistence (TinyDB)."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Optional
from uuid import uuid4

from app.auth.db import password_resets_table, profiles_table, query, users_table
from app.auth.models import Role


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_user_by_id(user_id: int) -> Optional[dict[str, Any]]:
    table = users_table()
    doc = table.get(doc_id=user_id)
    if doc is None:
        return None
    data = dict(doc)
    data["id"] = user_id
    return data


def get_user_by_email(email: str) -> Optional[dict[str, Any]]:
    table = users_table()
    doc = table.get(query().email == email.lower())
    if doc is None:
        return None
    data = dict(doc)
    data["id"] = doc.doc_id
    return data


def list_users() -> list[dict[str, Any]]:
    results = []
    for doc in users_table():
        data = dict(doc)
        data["id"] = doc.doc_id
        results.append(data)
    return results


def create_user(
    *,
    email: str,
    hashed_password: str,
    role: Role = Role.user,
    is_active: bool = True,
    name: Optional[str] = None,
    phone: Optional[str] = None,
    address: Optional[str] = None,
) -> dict[str, Any]:
    table = users_table()
    user_id = table.insert(
        {
            "email": email.lower(),
            "hashed_password": hashed_password,
            "is_active": is_active,
            "role": role.value if isinstance(role, Role) else role,
            "created_at": _now(),
        }
    )
    profiles_table().insert(
        {
            "user_id": user_id,
            "name": name,
            "phone": phone,
            "address": address,
        }
    )
    return get_user_by_id(user_id)


def update_user(user_id: int, updates: dict[str, Any]) -> Optional[dict[str, Any]]:
    if not updates:
        return get_user_by_id(user_id)
    stored = {k: (v.value if isinstance(v, Role) else v) for k, v in updates.items()}
    if "email" in stored and isinstance(stored["email"], str):
        stored["email"] = stored["email"].lower()
    users_table().update(stored, doc_ids=[user_id])
    return get_user_by_id(user_id)


def delete_user(user_id: int) -> bool:
    user = get_user_by_id(user_id)
    if user is None:
        return False
    profile = get_profile_by_user_id(user_id)
    if profile is not None:
        profiles_table().remove(doc_ids=[profile["id"]])
    users_table().remove(doc_ids=[user_id])
    return True


def get_profile_by_user_id(user_id: int) -> Optional[dict[str, Any]]:
    doc = profiles_table().get(query().user_id == user_id)
    if doc is None:
        return None
    data = dict(doc)
    data["id"] = doc.doc_id
    return data


def update_profile(user_id: int, updates: dict[str, Any]) -> Optional[dict[str, Any]]:
    profile = get_profile_by_user_id(user_id)
    if profile is None:
        return None
    payload = {k: v for k, v in updates.items() if v is not None or k in updates}
    profiles_table().update(payload, doc_ids=[profile["id"]])
    return get_profile_by_user_id(user_id)


def create_password_reset(user_id: int, expires_at: datetime) -> str:
    """Store a new unused reset jti; mark prior unused tokens for this user as used."""
    table = password_resets_table()
    q = query()
    for doc in table.search((q.user_id == user_id) & (q.used_at == None)):  # noqa: E711
        table.update({"used_at": _now()}, doc_ids=[doc.doc_id])
    jti = str(uuid4())
    table.insert(
        {
            "jti": jti,
            "user_id": user_id,
            "expires_at": expires_at.isoformat(),
            "used_at": None,
        }
    )
    return jti


def get_password_reset(jti: str) -> Optional[dict[str, Any]]:
    doc = password_resets_table().get(query().jti == jti)
    if doc is None:
        return None
    data = dict(doc)
    data["id"] = doc.doc_id
    return data


def mark_reset_used(jti: str) -> None:
    table = password_resets_table()
    doc = table.get(query().jti == jti)
    if doc is not None:
        table.update({"used_at": _now()}, doc_ids=[doc.doc_id])


def invalidate_resets_for_user(user_id: int) -> None:
    table = password_resets_table()
    q = query()
    for doc in table.search((q.user_id == user_id) & (q.used_at == None)):  # noqa: E711
        table.update({"used_at": _now()}, doc_ids=[doc.doc_id])
