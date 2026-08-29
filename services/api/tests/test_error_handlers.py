"""Sanitized global error responses."""

from __future__ import annotations

import unittest

from fastapi.testclient import TestClient

from app.main import app
from tests.helpers import client, reset_auth_db


class ErrorHandlerTest(unittest.TestCase):
    def setUp(self) -> None:
        reset_auth_db()

    def test_unhandled_exception_returns_safe_500(self) -> None:
        @app.get("/__test-unhandled")
        def boom() -> None:
            raise RuntimeError("SECRET_KEY=/etc/passwd leaked")

        try:
            local = TestClient(app, raise_server_exceptions=False)
            response = local.get("/__test-unhandled")
            self.assertEqual(response.status_code, 500)
            body = response.json()
            self.assertEqual(
                body["detail"], "Something went wrong. Please try again."
            )
            self.assertNotIn("SECRET_KEY", response.text)
            self.assertNotIn("/etc/passwd", response.text)
            self.assertNotIn("RuntimeError", response.text)
        finally:
            app.router.routes = [
                route
                for route in app.router.routes
                if getattr(route, "path", None) != "/__test-unhandled"
            ]

    def test_http_exception_still_returns_status(self) -> None:
        response = client.get("/suppliers")
        self.assertEqual(response.status_code, 401)
        self.assertIn("detail", response.json())


if __name__ == "__main__":
    unittest.main()
