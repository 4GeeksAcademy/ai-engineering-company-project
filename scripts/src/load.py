"""Load incident CSV files (UTF-8, comma-separated)."""

from __future__ import annotations

import csv
import io
from pathlib import Path

from .constants import REQUIRED_HEADERS
from .models import IncidentRecord


class LoadError(ValueError):
    """Raised when the CSV cannot be loaded for analysis."""


def _records_from_reader(reader: csv.DictReader) -> list[IncidentRecord]:
    if reader.fieldnames is None:
        raise LoadError("CSV has no header row")

    headers = tuple(h.strip() for h in reader.fieldnames)
    missing = [h for h in REQUIRED_HEADERS if h not in headers]
    if missing:
        raise LoadError(f"Missing required columns: {', '.join(missing)}")

    records: list[IncidentRecord] = []
    for index, row in enumerate(reader, start=2):
        records.append(
            IncidentRecord(
                incident_id=(row.get("incident_id") or "").strip(),
                date=(row.get("date") or "").strip(),
                clinic_id=(row.get("clinic_id") or "").strip(),
                country=(row.get("country") or "").strip(),
                category=(row.get("category") or "").strip(),
                description=(row.get("description") or "").strip(),
                status=(row.get("status") or "").strip(),
                patient_id=(row.get("patient_id") or "").strip(),
                satisfaction_score_raw=(row.get("satisfaction_score") or ""),
                row_number=index,
            )
        )
    return records


def load_incidents_from_text(text: str) -> list[IncidentRecord]:
    """Parse incident rows from an in-memory UTF-8 CSV string (API uploads)."""
    if text.strip() == "":
        raise LoadError("Uploaded file is empty")
    reader = csv.DictReader(io.StringIO(text))
    return _records_from_reader(reader)


def load_incidents_from_bytes(data: bytes) -> list[IncidentRecord]:
    """Decode upload bytes as UTF-8 and parse incident rows."""
    if not data:
        raise LoadError("Uploaded file is empty")
    try:
        text = data.decode("utf-8")
    except UnicodeDecodeError as exc:
        raise LoadError("File is not valid UTF-8") from exc
    return load_incidents_from_text(text)


def load_incidents(path: str | Path) -> list[IncidentRecord]:
    file_path = Path(path)
    if not file_path.is_file():
        raise LoadError(f"File not found: {file_path}")

    try:
        with file_path.open(newline="", encoding="utf-8") as handle:
            return _records_from_reader(csv.DictReader(handle))
    except UnicodeDecodeError as exc:
        raise LoadError(f"File is not valid UTF-8: {file_path}") from exc
    except OSError as exc:
        raise LoadError(f"Unable to read file: {file_path}") from exc
