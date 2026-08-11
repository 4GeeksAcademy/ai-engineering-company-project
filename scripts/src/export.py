"""Export analysis metrics to a simple CSV (no PHI)."""

from __future__ import annotations

import csv
import io
from pathlib import Path

from .constants import (
    CATEGORIES,
    COUNTRIES,
    INVALID_RULE_LABELS,
    INVALID_RULE_ORDER,
    STATUSES,
)
from .summarize import AnalysisSummary


def metric_rows(summary: AnalysisSummary) -> list[dict[str, str]]:
    rows: list[dict[str, str]] = [
        {"metric": "total_records", "value": str(summary.total_records), "percentage": ""},
        {"metric": "valid_records", "value": str(summary.valid_count), "percentage": ""},
        {
            "metric": "invalid_records",
            "value": str(summary.invalid_count),
            "percentage": "",
        },
    ]

    for rule in INVALID_RULE_ORDER:
        count = summary.invalid_counts.get(rule, 0)
        if count == 0 and rule == "score_out_of_range":
            continue
        rows.append(
            {
                "metric": f"invalid.{rule}",
                "value": str(count),
                "percentage": "",
            }
        )

    for category in CATEGORIES:
        count = summary.category_counts.get(category, 0)
        rows.append(
            {
                "metric": f"category.{category}",
                "value": str(count),
                "percentage": f"{summary.percent_of_valid(count)}",
            }
        )

    for status in STATUSES:
        count = summary.status_counts.get(status, 0)
        rows.append(
            {
                "metric": f"status.{status}",
                "value": str(count),
                "percentage": f"{summary.percent_of_valid(count)}",
            }
        )

    for country in COUNTRIES:
        count = summary.country_counts.get(country, 0)
        rows.append(
            {
                "metric": f"country.{country}",
                "value": str(count),
                "percentage": f"{summary.percent_of_valid(count)}",
            }
        )

    rows.append(
        {
            "metric": "satisfaction.scored_cases",
            "value": str(summary.scored_cases),
            "percentage": "",
        }
    )
    rows.append(
        {
            "metric": "satisfaction.average",
            "value": f"{summary.average_score:.2f}",
            "percentage": "",
        }
    )
    for score in range(1, 6):
        rows.append(
            {
                "metric": f"satisfaction.score_{score}",
                "value": str(summary.satisfaction_histogram.get(score, 0)),
                "percentage": "",
            }
        )

    return rows


def export_metrics_csv(summary: AnalysisSummary, path: str | Path) -> Path:
    out = Path(path)
    with out.open("w", newline="", encoding="utf-8") as handle:
        handle.write(metrics_csv_text(summary))
    return out


def metrics_csv_text(summary: AnalysisSummary) -> str:
    """Return metrics CSV as a string (for HTTP download responses)."""
    buffer = io.StringIO(newline="")
    writer = csv.DictWriter(buffer, fieldnames=["metric", "value", "percentage"])
    writer.writeheader()
    writer.writerows(metric_rows(summary))
    return buffer.getvalue()
