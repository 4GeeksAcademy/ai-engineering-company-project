"""Auth environment configuration. Secrets are never hardcoded."""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv

_API_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(_API_ROOT / ".env")


def secret_key() -> str:
    key = os.getenv("SECRET_KEY")
    if not key:
        raise RuntimeError("SECRET_KEY is not set. Copy .env.example to .env.")
    return key


def access_token_expire_minutes() -> int:
    return int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))


def reset_token_expire_minutes() -> int:
    return int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "30"))


def auth_db_path() -> Path:
    override = os.getenv("AUTH_DB_PATH")
    if override:
        return Path(override)
    return _API_ROOT / "data" / "auth.json"


def frontend_base_url() -> str:
    return os.getenv("FRONTEND_BASE_URL", "http://localhost:3001").rstrip("/")


def resend_api_key() -> str | None:
    return os.getenv("RESEND_API_KEY") or None


def resend_from_email() -> str:
    return os.getenv("RESEND_FROM_EMAIL", "HealthCore Digital <noreply@healthcore.example>")
