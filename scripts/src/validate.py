"""First-match invalid-rule engine for HealthCore incidents."""

from __future__ import annotations

from dataclasses import dataclass, field

from .constants import (
    CLINIC_COUNTRY,
    PATIENT_ID_PATTERN,
    RULE_CLOSED_NO_SCORE,
    RULE_COUNTRY_MISMATCH,
    RULE_EMPTY_DESCRIPTION,
    RULE_INVALID_CATEGORY,
    RULE_INVALID_CLINIC,
    RULE_MISSING_PATIENT_ID,
    RULE_SCORE_OUT_OF_RANGE,
    VALID_CATEGORIES,
    VALID_CLINIC_IDS,
)
from .models import IncidentRecord


@dataclass
class ValidationResult:
    valid: list[IncidentRecord] = field(default_factory=list)
    invalid_counts: dict[str, int] = field(default_factory=dict)

    @property
    def total(self) -> int:
        return len(self.valid) + sum(self.invalid_counts.values())

    @property
    def invalid_total(self) -> int:
        return sum(self.invalid_counts.values())


def first_invalid_rule(record: IncidentRecord) -> str | None:
    """Return the first matching invalid rule key, or None if the row is valid.

    Does not return or log patient_id values — only format/emptiness checks.
    """
    if not record.clinic_id or record.clinic_id not in VALID_CLINIC_IDS:
        return RULE_INVALID_CLINIC

    expected_country = CLINIC_COUNTRY[record.clinic_id]
    if record.country != expected_country:
        return RULE_COUNTRY_MISMATCH

    if not record.category or record.category not in VALID_CATEGORIES:
        return RULE_INVALID_CATEGORY

    if len(record.description) < 5:
        return RULE_EMPTY_DESCRIPTION

    if not record.patient_id or not PATIENT_ID_PATTERN.fullmatch(record.patient_id):
        return RULE_MISSING_PATIENT_ID

    raw_score = record.satisfaction_score_raw.strip()
    if record.status == "CLOSED" and raw_score == "":
        return RULE_CLOSED_NO_SCORE

    if raw_score != "":
        try:
            score = int(raw_score)
        except ValueError:
            return RULE_SCORE_OUT_OF_RANGE
        if score < 1 or score > 5:
            return RULE_SCORE_OUT_OF_RANGE

    return None


def validate_records(records: list[IncidentRecord]) -> ValidationResult:
    result = ValidationResult()
    for record in records:
        rule = first_invalid_rule(record)
        if rule is None:
            result.valid.append(record)
        else:
            result.invalid_counts[rule] = result.invalid_counts.get(rule, 0) + 1
    return result
