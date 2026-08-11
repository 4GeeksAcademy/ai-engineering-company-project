"""In-memory store for the most recent incident analysis (Phase 2 demo)."""

from __future__ import annotations

from dataclasses import dataclass
from threading import Lock
from typing import Optional

from src.summarize import AnalysisSummary


@dataclass
class StoredAnalysis:
    summary: AnalysisSummary


_lock = Lock()
_latest: Optional[StoredAnalysis] = None


def save_analysis(summary: AnalysisSummary) -> None:
    global _latest
    with _lock:
        _latest = StoredAnalysis(summary=summary)


def get_latest() -> Optional[StoredAnalysis]:
    with _lock:
        return _latest


def clear() -> None:
    """Test helper to reset stored results."""
    global _latest
    with _lock:
        _latest = None
