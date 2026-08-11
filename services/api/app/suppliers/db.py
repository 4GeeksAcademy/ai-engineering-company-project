"""Supplier domain constants and TinyDB helpers."""

from __future__ import annotations

from pathlib import Path

from tinydb import TinyDB, Query

VALID_CATEGORIES = [
    "medical_supplies",
    "laboratory_services",
    "pharmaceutical",
    "clinical_software",
    "it_infrastructure",
    "hr_and_payroll_software",
    "cleaning_and_facilities",
    "patient_communication",
    "billing_and_coding_software",
    "training_platforms",
]

VALID_STATUSES = ["active", "suspended"]
VALID_COUNTRIES = ["USA", "UK"]
VALID_CURRENCIES = ["USD", "GBP"]
VALID_COMPLIANCE = ["BAA", "DPA", "both"]

_DB_PATH = Path(__file__).resolve().parents[2] / "data" / "suppliers.json"
_db: TinyDB | None = None


def get_db() -> TinyDB:
    global _db
    if _db is None:
        _DB_PATH.parent.mkdir(parents=True, exist_ok=True)
        _db = TinyDB(_DB_PATH)
    return _db


def suppliers_table():
    return get_db().table("suppliers")


def supplier_query() -> Query:
    return Query()


def close_db() -> None:
    global _db
    if _db is not None:
        _db.close()
        _db = None
