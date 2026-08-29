"""Supplier directory HTTP routes (TinyDB-backed)."""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.auth.security import get_current_user

from app.suppliers.db import suppliers_table
from app.suppliers.models import (
    Supplier,
    SupplierCreate,
    SupplierRateUpdate,
    SupplierStatusUpdate,
    SupplierUpdate,
)

router = APIRouter(tags=["suppliers"], dependencies=[Depends(get_current_user)])
logger = logging.getLogger(__name__)


def _doc_to_supplier(doc_id: int, doc: dict) -> Supplier:
    data = dict(doc)
    data["id"] = doc_id
    if isinstance(data.get("updated_at"), str):
        data["updated_at"] = datetime.fromisoformat(data["updated_at"])
    return Supplier.model_validate(data)


def _safe_doc_to_supplier(doc_id: int, doc: dict) -> Supplier | None:
    try:
        return _doc_to_supplier(doc_id, doc)
    except (ValidationError, ValueError, TypeError):
        logger.warning("Skipping unreadable supplier document id=%s", doc_id)
        return None


@router.post("/suppliers", response_model=Supplier, status_code=201)
def create_supplier(payload: SupplierCreate) -> Supplier:
    table = suppliers_table()
    now = datetime.now(timezone.utc)
    doc = payload.model_dump(mode="json")
    doc["updated_at"] = now.isoformat()
    doc_id = table.insert(doc)
    return _doc_to_supplier(doc_id, table.get(doc_id=doc_id))


@router.get("/suppliers", response_model=list[Supplier])
def list_suppliers(
    country: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    status: Optional[str] = Query(default=None),
) -> list[Supplier]:
    table = suppliers_table()
    results: list[Supplier] = []
    for doc in table:
        if country and doc.get("country") != country:
            continue
        if status and doc.get("status") != status:
            continue
        if category and category not in (doc.get("categories") or []):
            continue
        parsed = _safe_doc_to_supplier(doc.doc_id, dict(doc))
        if parsed is None:
            continue
        results.append(parsed)
    results.sort(key=lambda s: s.name.lower())
    return results


@router.get("/suppliers/{supplier_id}", response_model=Supplier)
def get_supplier(supplier_id: int) -> Supplier:
    table = suppliers_table()
    doc = table.get(doc_id=supplier_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Supplier not found")
    parsed = _safe_doc_to_supplier(supplier_id, doc)
    if parsed is None:
        raise HTTPException(
            status_code=500, detail="This supplier record could not be read."
        )
    return parsed


@router.patch("/suppliers/{supplier_id}", response_model=Supplier)
def update_supplier(supplier_id: int, payload: SupplierUpdate) -> Supplier:
    table = suppliers_table()
    doc = table.get(doc_id=supplier_id)
    if doc is None:
        raise HTTPException(status_code=404, detail="Supplier not found")

    updates = payload.model_dump(exclude_unset=True, mode="json")
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    merged = {**doc, **updates}
    try:
        validated = SupplierCreate.model_validate(
            {
                "name": merged["name"],
                "country": merged["country"],
                "categories": merged["categories"],
                "monthly_rate": merged["monthly_rate"],
                "currency": merged["currency"],
                "status": merged["status"],
                "compliance_agreement": merged.get("compliance_agreement"),
                "contract_renewal_date": merged.get("contract_renewal_date"),
                "contact_email": merged.get("contact_email"),
                "notes": merged.get("notes"),
            }
        )
    except ValidationError as exc:
        errors = [
            {
                "field": ".".join(str(p) for p in err.get("loc", ())),
                "message": err.get("msg", "Invalid value"),
            }
            for err in exc.errors()
        ]
        return JSONResponse(
            status_code=422,
            content={"detail": "Validation failed", "errors": errors},
        )

    stored = validated.model_dump(mode="json")
    if "monthly_rate" in updates:
        stored["updated_at"] = datetime.now(timezone.utc).isoformat()
    else:
        stored["updated_at"] = doc.get("updated_at") or datetime.now(
            timezone.utc
        ).isoformat()

    table.update(stored, doc_ids=[supplier_id])
    refreshed = table.get(doc_id=supplier_id)
    parsed = _safe_doc_to_supplier(supplier_id, refreshed)
    if parsed is None:
        raise HTTPException(
            status_code=500, detail="This supplier record could not be read."
        )
    return parsed


@router.patch("/suppliers/{supplier_id}/rate", response_model=Supplier)
def update_supplier_rate(supplier_id: int, payload: SupplierRateUpdate) -> Supplier:
    return update_supplier(
        supplier_id, SupplierUpdate(monthly_rate=payload.monthly_rate)
    )


@router.patch("/suppliers/{supplier_id}/status", response_model=Supplier)
def update_supplier_status(supplier_id: int, payload: SupplierStatusUpdate) -> Supplier:
    return update_supplier(supplier_id, SupplierUpdate(status=payload.status))
