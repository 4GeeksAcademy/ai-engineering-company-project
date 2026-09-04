"""API tests for incident analyze / export endpoints."""

from __future__ import annotations

import unittest
from pathlib import Path

from app import store
from tests.helpers import SCRIPTS, auth_header, client, reset_auth_db

FIXTURE = SCRIPTS / "incidents-healthcore.csv"


class IncidentsApiTest(unittest.TestCase):
    def setUp(self) -> None:
        store.clear()
        reset_auth_db()
        self.headers = auth_header()

    def test_health(self) -> None:
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_export_without_analysis_returns_404(self) -> None:
        response = client.get("/api/incidents/results/export", headers=self.headers)
        self.assertEqual(response.status_code, 404)

    def test_analyze_missing_file_returns_400(self) -> None:
        response = client.post("/api/incidents/analyze", headers=self.headers)
        self.assertEqual(response.status_code, 422)

    def test_analyze_empty_file_returns_400(self) -> None:
        response = client.post(
            "/api/incidents/analyze",
            headers=self.headers,
            files={"file": ("empty.csv", b"", "text/csv")},
        )
        self.assertEqual(response.status_code, 400)

    def test_analyze_non_csv_returns_400(self) -> None:
        response = client.post(
            "/api/incidents/analyze",
            headers=self.headers,
            files={"file": ("notes.txt", b"hello", "text/plain")},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("csv", response.json()["detail"].lower())

    def test_analyze_graded_fixture(self) -> None:
        data = FIXTURE.read_bytes()
        response = client.post(
            "/api/incidents/analyze",
            headers=self.headers,
            files={"file": ("incidents-healthcore.csv", data, "text/csv")},
        )
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["total_records"], 100)
        self.assertEqual(body["valid_count"], 94)
        self.assertEqual(body["invalid_count"], 6)
        self.assertEqual(body["category_counts"]["APPOINTMENT"], 30)
        self.assertEqual(body["status_counts"]["CLOSED"], 52)
        self.assertEqual(body["country_counts"]["US"], 61)
        self.assertEqual(body["satisfaction"]["average_score"], 3.58)
        self.assertEqual(body["satisfaction"]["histogram"]["4"], 23)
        blob = response.text
        self.assertNotIn("PAT-", blob)

    def test_export_after_analyze(self) -> None:
        data = FIXTURE.read_bytes()
        client.post(
            "/api/incidents/analyze",
            headers=self.headers,
            files={"file": ("incidents-healthcore.csv", data, "text/csv")},
        )
        response = client.get("/api/incidents/results/export", headers=self.headers)
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/csv", response.headers["content-type"])
        text = response.text
        self.assertIn("metric,value,percentage", text)
        self.assertIn("total_records,100", text)
        self.assertNotIn("PAT-", text)

    def test_analyze_missing_headers_returns_stable_400(self) -> None:
        response = client.post(
            "/api/incidents/analyze",
            headers=self.headers,
            files={"file": ("bad.csv", b"foo,bar\n1,2\n", "text/csv")},
        )
        self.assertEqual(response.status_code, 400)
        detail = response.json()["detail"]
        self.assertIsInstance(detail, str)
        self.assertNotIn("Missing required columns:", detail)
        self.assertIn("columns", detail.lower())

    def test_analyze_non_utf8_returns_stable_400(self) -> None:
        response = client.post(
            "/api/incidents/analyze",
            headers=self.headers,
            files={"file": ("bad.csv", b"\xff\xfe\x00", "text/csv")},
        )
        self.assertEqual(response.status_code, 400)
        detail = response.json()["detail"]
        self.assertNotIn("File is not valid UTF-8:", detail)
        self.assertIn("utf-8", detail.lower())

    def test_analyze_without_token_401(self) -> None:
        response = client.post("/api/incidents/analyze")
        self.assertEqual(response.status_code, 401)

    def test_export_without_token_401(self) -> None:
        response = client.get("/api/incidents/results/export")
        self.assertEqual(response.status_code, 401)

    def test_analyze_whitespace_only_csv_returns_400(self) -> None:
        """Named .csv with only whitespace is empty after decode, not empty bytes."""
        response = client.post(
            "/api/incidents/analyze",
            headers=self.headers,
            files={"file": ("blank.csv", b" \n  \n", "text/csv")},
        )
        self.assertEqual(response.status_code, 400)
        detail = response.json()["detail"]
        self.assertIn("empty", detail.lower())


if __name__ == "__main__":
    unittest.main()
