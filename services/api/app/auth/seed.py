"""Seed a local admin (POST /users cannot create admin)."""

from __future__ import annotations

import os

from app.auth.db import close_db
from app.auth.models import Role
from app.auth.security import hash_password
from app.auth.service import create_user, get_user_by_email


def seed_admin() -> str:
    email = os.getenv("AUTH_SEED_ADMIN_EMAIL", "admin@healthcore.example")
    password = os.getenv("AUTH_SEED_ADMIN_PASSWORD", "HealthCore!dev-admin")
    existing = get_user_by_email(email)
    if existing is not None:
        return f"Admin already exists: {email}"
    create_user(
        email=email,
        hashed_password=hash_password(password),
        role=Role.admin,
        name="Local Admin",
    )
    return f"Seeded admin {email}"


def main() -> None:
    try:
        print(seed_admin())
    finally:
        close_db()


if __name__ == "__main__":
    main()
