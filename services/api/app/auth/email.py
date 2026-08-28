"""Resend password-reset email. Failures are logged; callers still return 200."""

from __future__ import annotations

import logging

from app.auth import config

logger = logging.getLogger(__name__)


def send_reset_email(*, to_email: str, reset_url: str) -> None:
    api_key = config.resend_api_key()
    if not api_key:
        logger.warning("RESEND_API_KEY is not set; skip sending reset email.")
        return
    try:
        import resend

        resend.api_key = api_key
        resend.Emails.send(
            {
                "from": config.resend_from_email(),
                "to": [to_email],
                "subject": "Reset your HealthCore Digital password",
                "text": (
                    "You requested a password reset for HealthCore Digital.\n\n"
                    f"Open this link to choose a new password (it expires soon):\n{reset_url}\n\n"
                    "If you did not request this, you can ignore this email."
                ),
            }
        )
    except Exception:
        logger.exception("Failed to send password-reset email.")
