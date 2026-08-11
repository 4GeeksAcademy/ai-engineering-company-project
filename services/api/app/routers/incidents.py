"""Incident analyze / export HTTP routes."""

from __future__ import annotations

from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import Response

from app import store
from src.constants import INVALID_RULE_LABELS, INVALID_RULE_ORDER
from src.export import metrics_csv_text
from src.load import LoadError, load_incidents_from_bytes
from src.summarize import AnalysisSummary, summarize
from src.validate import validate_records

router = APIRouter(prefix="/api/incidents", tags=["incidents"])


def summary_to_json(summary: AnalysisSummary) -> dict:
    invalid_breakdown = []
    for rule in INVALID_RULE_ORDER:
        count = summary.invalid_counts.get(rule, 0)
        if count == 0 and rule == "score_out_of_range":
            continue
        invalid_breakdown.append(
            {
                "rule": rule,
                "label": INVALID_RULE_LABELS[rule],
                "count": count,
            }
        )

    return {
        "source_file": summary.source_file,
        "total_records": summary.total_records,
        "valid_count": summary.valid_count,
        "invalid_count": summary.invalid_count,
        "invalid_breakdown": invalid_breakdown,
        "category_counts": summary.category_counts,
        "status_counts": summary.status_counts,
        "country_counts": summary.country_counts,
        "satisfaction": {
            "scored_cases": summary.scored_cases,
            "closed_valid": summary.closed_valid,
            "average_score": summary.average_score,
            "histogram": {
                str(k): v for k, v in summary.satisfaction_histogram.items()
            },
        },
    }


@router.post("/analyze")
async def analyze_incidents(file: UploadFile = File(...)) -> dict:
    if file is None:
        raise HTTPException(status_code=400, detail="Missing file upload")

    filename = file.filename or "upload.csv"
    if not filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Incorrect file format: expected a .csv file",
        )

    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    try:
        records = load_incidents_from_bytes(data)
    except LoadError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    result = validate_records(records)
    summary = summarize(result, source_file=filename)
    store.save_analysis(summary)
    return summary_to_json(summary)


@router.get("/results/export")
def export_results() -> Response:
    latest = store.get_latest()
    if latest is None:
        raise HTTPException(
            status_code=404,
            detail="No analysis results available. Upload a CSV first.",
        )

    csv_body = metrics_csv_text(latest.summary)
    download_name = "incident_metrics_export.csv"
    return Response(
        content=csv_body,
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f'attachment; filename="{download_name}"',
        },
    )
