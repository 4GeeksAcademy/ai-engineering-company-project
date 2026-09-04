"""POST /auth/change-password."""

from __future__ import annotations

from tests.helpers import auth_header, client, login


def test_change_password_then_login() -> None:
    headers = auth_header(email="chg@healthcore.example")
    ok = client.post(
        "/auth/change-password",
        headers=headers,
        json={"current_password": "secret123", "new_password": "next123"},
    )
    assert ok.status_code == 200
    assert login(email="chg@healthcore.example", password="next123").status_code == 200


def test_change_password_empty_body_returns_422() -> None:
    headers = auth_header(email="chg-empty@healthcore.example")
    response = client.post("/auth/change-password", headers=headers, json={})
    assert response.status_code == 422


def test_change_password_requires_current() -> None:
    headers = auth_header(email="chg2@healthcore.example")
    assert client.post("/auth/change-password").status_code == 401
    wrong = client.post(
        "/auth/change-password",
        headers=headers,
        json={"current_password": "wrong", "new_password": "next123"},
    )
    assert wrong.status_code == 400


def test_change_password_unauthenticated() -> None:
    response = client.post(
        "/auth/change-password",
        json={"current_password": "secret123", "new_password": "next123"},
    )
    assert response.status_code == 401
