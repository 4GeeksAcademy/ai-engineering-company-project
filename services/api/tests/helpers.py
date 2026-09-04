"""Shared test helpers: env + TinyDB isolation + register/login."""

from __future__ import annotations

import os
import sys
import tempfile
from pathlib import Path

API_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = API_ROOT.parents[1]
SCRIPTS = REPO_ROOT / "scripts"

_fd, AUTH_DB = tempfile.mkstemp(suffix="-auth.json")
os.close(_fd)
os.environ["SECRET_KEY"] = "test-secret-key-for-unittest"
os.environ["AUTH_DB_PATH"] = AUTH_DB
os.environ.setdefault("ACCESS_TOKEN_EXPIRE_MINUTES", "60")

for path in (str(API_ROOT), str(SCRIPTS)):
    if path not in sys.path:
        sys.path.insert(0, path)

from fastapi.testclient import TestClient  # noqa: E402

from app.auth.db import close_db  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)


def reset_auth_db() -> None:
    close_db()
    path = Path(os.environ["AUTH_DB_PATH"])
    if path.exists():
        path.unlink()


def register(
    email: str = "alice@healthcore.example",
    password: str = "secret123",
    **extra,
) -> dict:
    body = {"email": email, "password": password, **extra}
    response = client.post("/users", json=body)
    return response


def login(email: str = "alice@healthcore.example", password: str = "secret123"):
    return client.post(
        "/auth/login",
        data={"username": email, "password": password},
    )


def auth_header(email: str = "alice@healthcore.example", password: str = "secret123") -> dict[str, str]:
    register(email=email, password=password)
    token = login(email=email, password=password).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def admin_header(
    email: str = "admin@healthcore.example",
    password: str = "adminpass",
) -> dict[str, str]:
    from app.auth.models import Role
    from app.auth.security import hash_password
    from app.auth.service import create_user

    create_user(
        email=email,
        hashed_password=hash_password(password),
        role=Role.admin,
        name="Local Admin",
    )
    token = login(email=email, password=password).json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
