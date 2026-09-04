"""app.auth.email — skip send when no key; do not raise on transport errors."""

from __future__ import annotations

from unittest.mock import patch

from app.auth.email import send_reset_email


def test_send_reset_email_skips_without_api_key(monkeypatch) -> None:
    monkeypatch.setenv("RESEND_API_KEY", "")
    send_reset_email(
        to_email="staff@healthcore.example",
        reset_url="http://localhost:3001/reset-password?token=abc",
    )


def test_send_reset_email_calls_resend_when_configured(monkeypatch) -> None:
    monkeypatch.setenv("RESEND_API_KEY", "re_test_key")
    with patch("resend.Emails.send") as mocked:
        send_reset_email(
            to_email="staff@healthcore.example",
            reset_url="http://localhost:3001/reset-password?token=abc",
        )
        mocked.assert_called_once()


def test_send_reset_email_swallows_network_error(monkeypatch) -> None:
    monkeypatch.setenv("RESEND_API_KEY", "re_test_key")
    with patch("resend.Emails.send", side_effect=OSError("down")):
        send_reset_email(
            to_email="staff@healthcore.example",
            reset_url="http://localhost:3001/reset-password?token=abc",
        )
