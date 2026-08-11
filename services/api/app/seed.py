"""Seed TinyDB with HealthCore supplier directory data.

Run from services/api:
  uv run seed
"""

from __future__ import annotations

from datetime import datetime, timezone

from app.suppliers.db import close_db, suppliers_table
from app.suppliers.models import SupplierCreate
from app.suppliers.seed_data import SUPPLIERS_SEED


def seed_suppliers(*, reset: bool = True) -> int:
    table = suppliers_table()
    if reset:
        table.truncate()

    now = datetime.now(timezone.utc)
    count = 0
    for raw in SUPPLIERS_SEED:
        payload = SupplierCreate.model_validate(raw)
        doc = payload.model_dump(mode="json")
        doc["updated_at"] = now.isoformat()
        table.insert(doc)
        count += 1
    return count


def main() -> None:
    try:
        count = seed_suppliers(reset=True)
        print(f"Seeded {count} suppliers into TinyDB.")
    finally:
        close_db()


if __name__ == "__main__":
    main()
