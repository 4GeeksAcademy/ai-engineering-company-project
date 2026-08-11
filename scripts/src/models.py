"""Lightweight record types for incident analysis."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional


@dataclass(frozen=True)
class IncidentRecord:
    """One CSV row after load. Never include patient_id in reports/exports."""

    incident_id: str
    date: str
    clinic_id: str
    country: str
    category: str
    description: str
    status: str
    patient_id: str
    satisfaction_score_raw: str
    row_number: int

    @property
    def satisfaction_score(self) -> Optional[int]:
        raw = self.satisfaction_score_raw.strip()
        if raw == "":
            return None
        try:
            return int(raw)
        except ValueError:
            return None
