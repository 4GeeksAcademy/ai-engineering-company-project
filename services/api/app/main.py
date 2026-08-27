"""FastAPI application for HealthCore Digital."""

from __future__ import annotations

import sys
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Make scripts/ package importable as `src.*` (Phase 1 shared library)
_REPO_ROOT = Path(__file__).resolve().parents[3]
_SCRIPTS = _REPO_ROOT / "scripts"
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))

from app.routers import incidents, suppliers  # noqa: E402

app = FastAPI(
    title="HealthCore API",
    description="Incident analysis and supplier directory (TinyDB) endpoints.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(incidents.router)
app.include_router(suppliers.router)


@app.exception_handler(RequestValidationError)
async def pydantic_validation_handler(
    _request: Request, exc: RequestValidationError
) -> JSONResponse:
    """Surface Pydantic validation errors clearly for the backoffice form."""
    errors = []
    for err in exc.errors():
        loc_parts = [str(p) for p in err.get("loc", ()) if p != "body"]
        errors.append(
            {
                "field": ".".join(loc_parts) or "body",
                "message": err.get("msg", "Invalid value"),
            }
        )
    return JSONResponse(
        status_code=422,
        content={"detail": "Validation failed", "errors": errors},
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
