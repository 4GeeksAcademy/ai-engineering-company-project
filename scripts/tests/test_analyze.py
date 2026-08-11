"""Unit and fixture tests for the HealthCore incident analyzer."""

from __future__ import annotations

import csv
import tempfile
import unittest
from pathlib import Path

from src.constants import (
    RULE_CLOSED_NO_SCORE,
    RULE_COUNTRY_MISMATCH,
    RULE_EMPTY_DESCRIPTION,
    RULE_INVALID_CATEGORY,
    RULE_INVALID_CLINIC,
    RULE_MISSING_PATIENT_ID,
    RULE_SCORE_OUT_OF_RANGE,
)
from src.export import export_metrics_csv, metric_rows
from src.load import load_incidents
from src.models import IncidentRecord
from src.report import format_report
from src.summarize import summarize
from src.validate import first_invalid_rule, validate_records

ROOT = Path(__file__).resolve().parents[1]
FIXTURE = ROOT / "incidents-healthcore.csv"


def _record(**overrides) -> IncidentRecord:
    base = {
        "incident_id": "HC-000001",
        "date": "2026-01-15",
        "clinic_id": "US-TX-01",
        "country": "US",
        "category": "APPOINTMENT",
        "description": "Long enough description",
        "status": "OPEN",
        "patient_id": "PAT-000001",
        "satisfaction_score_raw": "",
        "row_number": 2,
    }
    base.update(overrides)
    return IncidentRecord(**base)


class ValidateRulesTest(unittest.TestCase):
    def test_valid_row(self) -> None:
        self.assertIsNone(first_invalid_rule(_record()))

    def test_invalid_clinic(self) -> None:
        self.assertEqual(
            first_invalid_rule(_record(clinic_id="NOPE")),
            RULE_INVALID_CLINIC,
        )

    def test_country_mismatch(self) -> None:
        self.assertEqual(
            first_invalid_rule(_record(country="UK")),
            RULE_COUNTRY_MISMATCH,
        )

    def test_invalid_category(self) -> None:
        self.assertEqual(
            first_invalid_rule(_record(category="OTHER")),
            RULE_INVALID_CATEGORY,
        )

    def test_short_description(self) -> None:
        self.assertEqual(
            first_invalid_rule(_record(description="ab")),
            RULE_EMPTY_DESCRIPTION,
        )

    def test_missing_patient_id(self) -> None:
        self.assertEqual(
            first_invalid_rule(_record(patient_id="")),
            RULE_MISSING_PATIENT_ID,
        )
        self.assertEqual(
            first_invalid_rule(_record(patient_id="BAD")),
            RULE_MISSING_PATIENT_ID,
        )

    def test_closed_without_score(self) -> None:
        self.assertEqual(
            first_invalid_rule(_record(status="CLOSED", satisfaction_score_raw="")),
            RULE_CLOSED_NO_SCORE,
        )

    def test_score_out_of_range(self) -> None:
        self.assertEqual(
            first_invalid_rule(_record(satisfaction_score_raw="9")),
            RULE_SCORE_OUT_OF_RANGE,
        )

    def test_never_echoes_patient_id_in_rule_key(self) -> None:
        rule = first_invalid_rule(_record(patient_id="PAT-999999"))
        self.assertIsNone(rule)
        # Invalid path still returns rule name only
        rule = first_invalid_rule(_record(patient_id="SECRET-VALUE"))
        self.assertEqual(rule, RULE_MISSING_PATIENT_ID)
        self.assertNotIn("SECRET", rule)


class GradedFixtureTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        if not FIXTURE.is_file():
            raise unittest.SkipTest(f"Missing fixture: {FIXTURE}")
        cls.records = load_incidents(FIXTURE)
        cls.result = validate_records(cls.records)
        cls.summary = summarize(cls.result, source_file=FIXTURE.name)

    def test_totals(self) -> None:
        self.assertEqual(self.summary.total_records, 100)
        self.assertEqual(self.summary.valid_count, 94)
        self.assertEqual(self.summary.invalid_count, 6)

    def test_invalid_breakdown(self) -> None:
        expected = {
            RULE_INVALID_CLINIC: 1,
            RULE_COUNTRY_MISMATCH: 1,
            RULE_INVALID_CATEGORY: 1,
            RULE_EMPTY_DESCRIPTION: 1,
            RULE_MISSING_PATIENT_ID: 1,
            RULE_CLOSED_NO_SCORE: 1,
        }
        self.assertEqual(self.summary.invalid_counts, expected)

    def test_categories(self) -> None:
        self.assertEqual(
            self.summary.category_counts,
            {
                "APPOINTMENT": 30,
                "BILLING": 20,
                "CLINICAL_CARE": 14,
                "ACCESSIBILITY": 17,
                "ADMINISTRATIVE": 13,
            },
        )

    def test_statuses(self) -> None:
        self.assertEqual(
            self.summary.status_counts,
            {"OPEN": 28, "CLOSED": 52, "DISCARDED": 14},
        )

    def test_countries(self) -> None:
        self.assertEqual(self.summary.country_counts, {"US": 61, "UK": 33})

    def test_satisfaction(self) -> None:
        self.assertEqual(self.summary.scored_cases, 52)
        self.assertEqual(self.summary.closed_valid, 52)
        self.assertEqual(self.summary.average_score, 3.58)
        self.assertEqual(
            self.summary.satisfaction_histogram,
            {1: 3, 2: 5, 3: 12, 4: 23, 5: 9},
        )

    def test_report_contains_required_numbers_not_phi(self) -> None:
        text = format_report(self.summary)
        self.assertIn("TOTAL RECORDS IN FILE", text)
        self.assertIn("100", text)
        self.assertIn("94", text)
        self.assertIn("3.58", text)
        self.assertNotIn("PAT-", text)
        # Ensure no patient_id values leaked from fixture into report
        for record in self.records:
            if record.patient_id:
                self.assertNotIn(record.patient_id, text)

    def test_export_has_no_phi(self) -> None:
        rows = metric_rows(self.summary)
        blob = "\n".join(f"{r['metric']},{r['value']},{r['percentage']}" for r in rows)
        self.assertNotIn("PAT-", blob)
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "metrics.csv"
            export_metrics_csv(self.summary, path)
            content = path.read_text(encoding="utf-8")
            self.assertNotIn("PAT-", content)
            with path.open(encoding="utf-8") as handle:
                reader = csv.DictReader(handle)
                self.assertEqual(
                    reader.fieldnames, ["metric", "value", "percentage"]
                )


if __name__ == "__main__":
    unittest.main()
