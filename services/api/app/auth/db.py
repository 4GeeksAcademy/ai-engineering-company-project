"""TinyDB helpers for users, profiles, and password resets."""

from __future__ import annotations

from tinydb import Query, TinyDB

from app.auth.config import auth_db_path

_db: TinyDB | None = None


def get_db() -> TinyDB:
    global _db
    if _db is None:
        path = auth_db_path()
        path.parent.mkdir(parents=True, exist_ok=True)
        _db = TinyDB(path)
    return _db


def users_table():
    return get_db().table("users")


def profiles_table():
    return get_db().table("profiles")


def password_resets_table():
    return get_db().table("password_resets")


def query() -> Query:
    return Query()


def close_db() -> None:
    global _db
    if _db is not None:
        _db.close()
        _db = None
