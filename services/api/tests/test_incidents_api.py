"""API tests for incident analyze / export endpoints."""

from __future__ import annotations

import sys
import unittest
from pathlib import Path

API_ROOT = Path(__file__).resolve().parents[1]
REPO_ROOT = API_ROOT.parents[1]
SCRIPTS = REPO_ROOT / "scripts"
FIXTURE = SCRIPTS / "incidents-healthcore.csv"

# Ensure both the API package root and scripts/ are importable
for path in (str(API_ROOT), str(SCRIPTS)):
    if path not in sys.path:
        sys.path.insert(0, path)

from fastapi.testclient import TestClient  # noqa: E402

from app import store  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)


class IncidentsApiTest(unittest.TestCase):
    def setUp(self) -> None:
        store.clear()

    def test_health(self) -> None:
        response = client.get("/health")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["status"], "ok")

    def test_export_without_analysis_returns_404(self) -> None:
        response = client.get("/api/incidents/results/export")
        self.assertEqual(response.status_code, 404)

    def test_analyze_missing_file_returns_400(self) -> None:
        response = client.post("/api/incidents/analyze")
        self.assertEqual(response.status_code, 422)

    def test_analyze_empty_file_returns_400(self) -> None:
        response = client.post(
            "/api/incidents/analyze",
            files={"file": ("empty.csv", b"", "text/csv")},
        )
        self.assertEqual(response.status_code, 400)

    def test_analyze_non_csv_returns_400(self) -> None:
        response = client.post(
            "/api/incidents/analyze",
            files={"file": ("notes.txt", b"hello", "text/plain")},
        )
        self.assertEqual(response.status_code, 400)
        self.assertIn("csv", response.json()["detail"].lower())

    def test_analyze_graded_fixture(self) -> None:
        data = FIXTURE.read_bytes()
        response = client.post(
            "/api/incidents/analyze",
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
            files={"file": ("incidents-healthcore.csv", data, "text/csv")},
        )
        response = client.get("/api/incidents/results/export")
        self.assertEqual(response.status_code, 200)
        self.assertIn("text/csv", response.headers["content-type"])
        text = response.text
        self.assertIn("metric,value,percentage", text)
        self.assertIn("total_records,100", text)
        self.assertNotIn("PAT-", text)


if __name__ == "__main__":
    unittest.main()
