"""POST /users — registration."""

from __future__ import annotations

from tests.helpers import client, login, register
from app.auth.service import get_user_by_email


def test_register_creates_user_and_profile_without_password_hash() -> None:
    response = register(name="Alice", phone="555", address="1 Clinic Rd")
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "alice@healthcore.example"
    assert body["role"] == "user"
    assert "hashed_password" not in body
    assert "password" not in body
    user = get_user_by_email("alice@healthcore.example")
    assert user is not None
    assert str(user["hashed_password"]).startswith("$2")
    assert user["hashed_password"] != "secret123"

    headers = {"Authorization": f"Bearer {login().json()['access_token']}"}
    me = client.get("/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["profile"]["name"] == "Alice"
    assert me.json()["profile"]["phone"] == "555"


def test_register_duplicate_email_returns_409() -> None:
    assert register().status_code == 201
    again = register()
    assert again.status_code == 409


def test_register_rejects_invalid_or_empty_required_fields() -> None:
    missing = client.post("/users", json={"email": "bad@healthcore.example"})
    assert missing.status_code == 422
    empty_password = register(password="")
    assert empty_password.status_code == 422
    invalid_email = register(email="not-an-email")
    assert invalid_email.status_code == 422
