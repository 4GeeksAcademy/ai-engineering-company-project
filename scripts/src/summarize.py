"""Aggregate metrics from validated incident records."""

from __future__ import annotations

from dataclasses import dataclass, field

from .constants import CATEGORIES, COUNTRIES, STATUSES
from .models import IncidentRecord
from .validate import ValidationResult


@dataclass
class AnalysisSummary:
    source_file: str
    total_records: int
    valid_count: int
    invalid_count: int
    invalid_counts: dict[str, int]
    category_counts: dict[str, int] = field(default_factory=dict)
    status_counts: dict[str, int] = field(default_factory=dict)
    country_counts: dict[str, int] = field(default_factory=dict)
    satisfaction_histogram: dict[int, int] = field(default_factory=dict)
    scored_cases: int = 0
    closed_valid: int = 0
    average_score: float = 0.0

    def percent_of_valid(self, count: int) -> float:
        if self.valid_count == 0:
            return 0.0
        return round((count / self.valid_count) * 100, 1)


def summarize(result: ValidationResult, source_file: str) -> AnalysisSummary:
    category_counts = {c: 0 for c in CATEGORIES}
    status_counts = {s: 0 for s in STATUSES}
    country_counts = {c: 0 for c in COUNTRIES}
    satisfaction_histogram = {i: 0 for i in range(1, 6)}
    score_sum = 0
    scored = 0
    closed_valid = 0

    for record in result.valid:
        category_counts[record.category] = category_counts.get(record.category, 0) + 1
        status_counts[record.status] = status_counts.get(record.status, 0) + 1
        country_counts[record.country] = country_counts.get(record.country, 0) + 1

        if record.status == "CLOSED":
            closed_valid += 1
            score = record.satisfaction_score
            if score is not None:
                scored += 1
                score_sum += score
                satisfaction_histogram[score] = satisfaction_histogram.get(score, 0) + 1

    average = round(score_sum / scored, 2) if scored else 0.0

    return AnalysisSummary(
        source_file=source_file,
        total_records=result.total,
        valid_count=len(result.valid),
        invalid_count=result.invalid_total,
        invalid_counts=dict(result.invalid_counts),
        category_counts=category_counts,
        status_counts=status_counts,
        country_counts=country_counts,
        satisfaction_histogram=satisfaction_histogram,
        scored_cases=scored,
        closed_valid=closed_valid,
        average_score=average,
    )


def pad_dots(label: str, width: int = 34) -> str:
    """Pad label with dots for aligned console columns."""
    if len(label) >= width:
        return label
    return label + " " + "." * (width - len(label) - 1)
