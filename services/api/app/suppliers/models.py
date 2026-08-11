"""Pydantic models for the HealthCore supplier directory."""

from __future__ import annotations

from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator, model_validator

from app.suppliers.db import VALID_CATEGORIES, VALID_STATUSES

Country = Literal["USA", "UK"]
Currency = Literal["USD", "GBP"]
Status = Literal["active", "suspended"]
Compliance = Literal["BAA", "DPA", "both"]


class SupplierBase(BaseModel):
    name: str = Field(min_length=1)
    country: Country
    categories: list[str] = Field(min_length=1)
    monthly_rate: float = Field(gt=0)
    currency: Currency
    status: Status
    compliance_agreement: Optional[Compliance] = None
    contract_renewal_date: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    notes: Optional[str] = None

    @field_validator("categories")
    @classmethod
    def categories_must_be_valid(cls, value: list[str]) -> list[str]:
        if not value:
            raise ValueError("At least one category is required")
        invalid = [c for c in value if c not in VALID_CATEGORIES]
        if invalid:
            raise ValueError(f"Invalid categories: {', '.join(invalid)}")
        return value

    @field_validator("contract_renewal_date")
    @classmethod
    def renewal_date_format(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError as exc:
            raise ValueError("contract_renewal_date must be YYYY-MM-DD") from exc
        return value

    @model_validator(mode="after")
    def currency_must_match_country(self) -> SupplierBase:
        if self.country == "USA" and self.currency != "USD":
            raise ValueError('USA suppliers must use currency "USD"')
        if self.country == "UK" and self.currency != "GBP":
            raise ValueError('UK suppliers must use currency "GBP"')
        return self


class SupplierCreate(SupplierBase):
    """Payload for POST /suppliers and seeder rows."""


class SupplierRateUpdate(BaseModel):
    monthly_rate: float = Field(gt=0)


class SupplierStatusUpdate(BaseModel):
    status: Status

    @field_validator("status")
    @classmethod
    def status_allowed(cls, value: str) -> str:
        if value not in VALID_STATUSES:
            raise ValueError(f"status must be one of {VALID_STATUSES}")
        return value


class SupplierUpdate(BaseModel):
    """Partial update — rate and/or status (and optional other fields)."""

    model_config = ConfigDict(extra="forbid")

    name: Optional[str] = Field(default=None, min_length=1)
    country: Optional[Country] = None
    categories: Optional[list[str]] = Field(default=None, min_length=1)
    monthly_rate: Optional[float] = Field(default=None, gt=0)
    currency: Optional[Currency] = None
    status: Optional[Status] = None
    compliance_agreement: Optional[Compliance] = None
    contract_renewal_date: Optional[str] = None
    contact_email: Optional[EmailStr] = None
    notes: Optional[str] = None

    @field_validator("categories")
    @classmethod
    def categories_must_be_valid(cls, value: Optional[list[str]]) -> Optional[list[str]]:
        if value is None:
            return value
        invalid = [c for c in value if c not in VALID_CATEGORIES]
        if invalid:
            raise ValueError(f"Invalid categories: {', '.join(invalid)}")
        return value

    @field_validator("contract_renewal_date")
    @classmethod
    def renewal_date_format(cls, value: Optional[str]) -> Optional[str]:
        if value is None or value == "":
            return None
        try:
            datetime.strptime(value, "%Y-%m-%d")
        except ValueError as exc:
            raise ValueError("contract_renewal_date must be YYYY-MM-DD") from exc
        return value


class Supplier(SupplierBase):
    id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
