"""POST /auth/forgot-password."""

from __future__ import annotations

from unittest.mock import patch

from tests.helpers import client, register


def test_forgot_password_sends_for_known_user() -> None:
    register(email="reset@healthcore.example")
    with patch("app.routers.auth.send_reset_email") as mocked:
        known = client.post(
            "/auth/forgot-password", json={"email": "reset@healthcore.example"}
        )
        assert known.status_code == 200
        mocked.assert_called_once()
        assert "If that address is registered" in known.json()["detail"]


def test_forgot_password_unknown_email_does_not_enumerate() -> None:
    with patch("app.routers.auth.send_reset_email") as mocked:
        unknown = client.post(
            "/auth/forgot-password", json={"email": "nobody@healthcore.example"}
        )
        assert unknown.status_code == 200
        mocked.assert_not_called()
        assert "If that address is registered" in unknown.json()["detail"]


def test_forgot_password_still_200_when_email_send_fails() -> None:
    register(email="reset-fail@healthcore.example")
    with patch(
        "app.routers.auth.send_reset_email",
        side_effect=OSError("network down"),
    ):
        response = client.post(
            "/auth/forgot-password",
            json={"email": "reset-fail@healthcore.example"},
        )
    assert response.status_code == 200
    assert "network down" not in response.text


def test_forgot_password_invalid_email_returns_422() -> None:
    response = client.post("/auth/forgot-password", json={"email": "not-an-email"})
    assert response.status_code == 422
