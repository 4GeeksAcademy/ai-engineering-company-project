#!/usr/bin/env python3
"""HealthCore patient incident CSV analyzer (CLI).

Usage:
  python analyze.py incidents-healthcore.csv
  python analyze.py incidents-healthcore.csv --export metrics.csv
  python analyze.py incidents-healthcore.csv --no-export
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from src.export import export_metrics_csv
from src.load import LoadError, load_incidents
from src.report import format_report
from src.summarize import summarize
from src.validate import validate_records


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        description="Analyze HealthCore patient incident CSV files (local only; no PHI in output)."
    )
    parser.add_argument(
        "csv_path",
        help="Path to incidents CSV (UTF-8, comma-separated)",
    )
    parser.add_argument(
        "--export",
        metavar="PATH",
        help="Write metrics CSV to PATH (skips interactive prompt)",
    )
    parser.add_argument(
        "--no-export",
        action="store_true",
        help="Skip export prompt and do not write a metrics CSV",
    )
    return parser


def prompt_export() -> bool:
    try:
        answer = input("Export results to CSV? [y / n]: ").strip().lower()
    except EOFError:
        return False
    return answer in {"y", "yes"}


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    args = parser.parse_args(argv)
    csv_path = Path(args.csv_path)

    try:
        records = load_incidents(csv_path)
    except LoadError as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1

    result = validate_records(records)
    summary = summarize(result, source_file=csv_path.name)
    print(format_report(summary))
    print()

    export_path: Path | None = None
    if args.export:
        export_path = Path(args.export)
    elif args.no_export:
        export_path = None
    elif prompt_export():
        export_path = Path("incident_metrics_export.csv")

    if export_path is not None:
        try:
            written = export_metrics_csv(summary, export_path)
        except OSError as exc:
            print(f"Error: unable to write export file: {exc}", file=sys.stderr)
            return 1
        print(f"Metrics exported to: {written}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
