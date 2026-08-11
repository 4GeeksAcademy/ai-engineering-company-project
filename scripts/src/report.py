"""Console report formatting — never includes patient_id or PHI."""

from __future__ import annotations

from .constants import (
    CATEGORIES,
    COUNTRIES,
    INVALID_RULE_LABELS,
    INVALID_RULE_ORDER,
    SATISFACTION_LABELS,
    STATUSES,
)
from .summarize import AnalysisSummary, pad_dots


def format_report(summary: AnalysisSummary) -> str:
    lines: list[str] = []
    sep = "=" * 60

    lines.append(sep)
    lines.append("  HEALTHCORE — PATIENT INCIDENT REPORT ANALYSIS")
    lines.append(f"  Source file: {summary.source_file}")
    lines.append(sep)
    lines.append("")
    lines.append(f"{pad_dots('TOTAL RECORDS IN FILE')} {summary.total_records}")
    lines.append(f"  ├─ Valid records ................ {summary.valid_count}")
    lines.append(f"  └─ Invalid / incomplete .......... {summary.invalid_count}")
    lines.append("")
    lines.append("INVALID RECORDS BREAKDOWN")

    # Always show the six graded rules even when zero; also show out-of-range if > 0
    graded = [
        "invalid_clinic_id",
        "country_clinic_mismatch",
        "invalid_category",
        "empty_description",
        "missing_patient_id",
        "closed_no_score",
    ]
    extra = [
        r
        for r in INVALID_RULE_ORDER
        if r not in graded and summary.invalid_counts.get(r, 0) > 0
    ]
    rules_to_show = graded + extra

    for index, rule in enumerate(rules_to_show):
        count = summary.invalid_counts.get(rule, 0)
        label = INVALID_RULE_LABELS[rule]
        connector = "└─" if index == len(rules_to_show) - 1 else "├─"
        lines.append(f"  {connector} {pad_dots(label, 32)} {count}")

    lines.append("")
    lines.append("BREAKDOWN BY CATEGORY (valid records)")
    for index, category in enumerate(CATEGORIES):
        count = summary.category_counts.get(category, 0)
        pct = summary.percent_of_valid(count)
        connector = "└─" if index == len(CATEGORIES) - 1 else "├─"
        lines.append(
            f"  {connector} {pad_dots(category, 28)} {count}  ({pct}%)"
        )

    lines.append("")
    lines.append("BREAKDOWN BY STATUS (valid records)")
    for index, status in enumerate(STATUSES):
        count = summary.status_counts.get(status, 0)
        pct = summary.percent_of_valid(count)
        connector = "└─" if index == len(STATUSES) - 1 else "├─"
        lines.append(f"  {connector} {pad_dots(status, 28)} {count}  ({pct}%)")

    lines.append("")
    lines.append("BREAKDOWN BY COUNTRY (valid records) — recommended, not required")
    for index, country in enumerate(COUNTRIES):
        count = summary.country_counts.get(country, 0)
        pct = summary.percent_of_valid(count)
        connector = "└─" if index == len(COUNTRIES) - 1 else "├─"
        lines.append(f"  {connector} {pad_dots(country, 28)} {count}  ({pct}%)")

    lines.append("")
    lines.append("SATISFACTION INDEX (closed cases)")
    lines.append(f"  Scored cases: {summary.scored_cases} of {summary.closed_valid}")
    lines.append(f"  Average score: {summary.average_score:.2f} / 5.00")
    for score in range(1, 6):
        count = summary.satisfaction_histogram.get(score, 0)
        label = SATISFACTION_LABELS[score]
        connector = "└─" if score == 5 else "├─"
        # Match sample spacing style for score labels
        score_label = f"Score {score} ({label})"
        lines.append(f"  {connector} {pad_dots(score_label, 32)} {count}")

    lines.append("")
    lines.append(sep)
    return "\n".join(lines)
