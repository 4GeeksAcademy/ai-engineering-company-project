"""FastAPI application for HealthCore Digital."""

from __future__ import annotations

import sys
from pathlib import Path

import logging

from fastapi import FastAPI, Request
from fastapi.exception_handlers import http_exception_handler
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)

# Make scripts/ package importable as `src.*` (Phase 1 shared library)
_REPO_ROOT = Path(__file__).resolve().parents[3]
_SCRIPTS = _REPO_ROOT / "scripts"
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))

from app.routers import auth, incidents, profiles, suppliers, users  # noqa: E402

app = FastAPI(
    title="HealthCore API",
    description="Incident analysis, supplier directory, and staff authentication.",
    version="0.3.0",
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

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(profiles.router)
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


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, StarletteHTTPException):
        return await http_exception_handler(request, exc)
    if isinstance(exc, RequestValidationError):
        return await pydantic_validation_handler(request, exc)
    logger.exception("Unhandled server error")
    return JSONResponse(
        status_code=500,
        content={"detail": "Something went wrong. Please try again."},
    )


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
