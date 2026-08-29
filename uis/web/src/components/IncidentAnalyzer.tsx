"use client";

import { useCallback, useRef, useState, type DragEvent } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { apiFetch, parseError, toUserMessage } from "@/lib/apiClient";
import { type IncidentAnalysisResult } from "@/lib/incidentsApi";

const SATISFACTION_LABELS: Record<string, string> = {
  "1": "Very dissatisfied",
  "2": "Dissatisfied",
  "3": "Neutral",
  "4": "Satisfied",
  "5": "Very satisfied",
};

function pct(count: number, valid: number): string {
  if (valid === 0) return "0.0%";
  return `${((count / valid) * 100).toFixed(1)}%`;
}

export function IncidentAnalyzer() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IncidentAnalysisResult | null>(null);

  const acceptFile = useCallback((next: File | null) => {
    setError(null);
    if (!next) {
      setFile(null);
      return;
    }
    if (!next.name.toLowerCase().endsWith(".csv")) {
      setError("Please choose a .csv file.");
      setFile(null);
      return;
    }
    setFile(next);
  }, []);

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    const dropped = event.dataTransfer.files?.[0] ?? null;
    acceptFile(dropped);
  };

  const analyze = async () => {
    if (!file) {
      setError("Select a CSV file to analyze.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const body = new FormData();
      body.append("file", file);
      let response: Response;
      try {
        response = await apiFetch("/api/incidents/analyze", {
          method: "POST",
          body,
        });
      } catch (err) {
        setResult(null);
        setError(toUserMessage(err));
        return;
      }
      if (!response.ok) {
        await parseError(response);
      }
      let payload: IncidentAnalysisResult;
      try {
        payload = (await response.json()) as IncidentAnalysisResult;
      } catch {
        setResult(null);
        setError("We could not read the analysis result. Please try again.");
        return;
      }
      setResult(payload);
    } catch (err) {
      setResult(null);
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = async () => {
    setExporting(true);
    setError(null);
    try {
      let response: Response;
      try {
        response = await apiFetch("/api/incidents/results/export");
      } catch (err) {
        setError(toUserMessage(err));
        return;
      }
      if (!response.ok) {
        await parseError(response);
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "incident_metrics_export.csv";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          Patient Experience
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Incident analysis
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Upload a HealthCore incident export for offline-style validation and summary metrics.
          Patient identifiers are never shown in results or downloads.
        </p>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`rounded-xl border-2 border-dashed bg-white p-8 text-center transition ${
          dragging ? "border-sky-500 bg-sky-50" : "border-slate-300"
        }`}
      >
        <p className="text-base font-medium text-slate-800">
          Drag and drop a CSV here, or choose a file
        </p>
        <p className="mt-1 text-sm text-slate-500">UTF-8 comma-separated · HealthCore incident schema</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Choose file
          </button>
          <button
            type="button"
            onClick={analyze}
            disabled={!file || loading}
            className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Analyzing…" : "Analyze CSV"}
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!result || exporting}
            className="rounded-md border border-sky-700 px-4 py-2 text-sm font-semibold text-sky-800 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {exporting ? "Exporting…" : "Download results CSV"}
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(event) => acceptFile(event.target.files?.[0] ?? null)}
        />
        {file ? (
          <p className="mt-4 text-sm text-slate-600">
            Selected: <span className="font-medium text-slate-900">{file.name}</span>
          </p>
        ) : null}
      </div>

      {error ? (
        <ErrorBanner
          message={error}
          onRetry={() => {
            if (file) void analyze();
            else setError(null);
          }}
          retryLabel={file ? "Try again" : "Dismiss"}
          homeHref="/"
        />
      ) : null}

      {result ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">General metrics</h3>
            <p className="mt-1 text-sm text-slate-500">Source: {result.source_file}</p>
            <dl className="mt-4 grid gap-4 sm:grid-cols-3">
              <Metric label="Total records" value={result.total_records} />
              <Metric label="Valid records" value={result.valid_count} />
              <Metric label="Invalid / incomplete" value={result.invalid_count} />
            </dl>
          </section>

          {result.invalid_count > 0 ? (
            <section
              role="status"
              className="rounded-xl border border-amber-200 bg-amber-50 p-5"
            >
              <h3 className="text-lg font-semibold text-amber-950">
                Invalid records ({result.invalid_count})
              </h3>
              <p className="mt-1 text-sm text-amber-900">
                The upload contains incomplete or rule-violating rows. Counts by rule (no patient
                data shown):
              </p>
              <ul className="mt-3 space-y-1 text-sm text-amber-950">
                {result.invalid_breakdown
                  .filter((item) => item.count > 0)
                  .map((item) => (
                    <li key={item.rule}>
                      {item.label}: <strong>{item.count}</strong>
                    </li>
                  ))}
              </ul>
            </section>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <BreakdownCard
              title="Breakdown by category"
              rows={Object.entries(result.category_counts).map(([key, count]) => ({
                key,
                count,
                pct: pct(count, result.valid_count),
              }))}
            />
            <BreakdownCard
              title="Breakdown by status"
              rows={Object.entries(result.status_counts).map(([key, count]) => ({
                key,
                count,
                pct: pct(count, result.valid_count),
              }))}
            />
            <BreakdownCard
              title="Breakdown by country"
              rows={Object.entries(result.country_counts).map(([key, count]) => ({
                key,
                count,
                pct: pct(count, result.valid_count),
              }))}
            />
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900">Satisfaction index</h3>
              <p className="mt-2 text-sm text-slate-600">
                Scored cases: {result.satisfaction.scored_cases} of{" "}
                {result.satisfaction.closed_valid}
              </p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">
                {result.satisfaction.average_score.toFixed(2)}{" "}
                <span className="text-base font-normal text-slate-500">/ 5.00</span>
              </p>
              <ul className="mt-4 space-y-1 text-sm text-slate-700">
                {["1", "2", "3", "4", "5"].map((score) => (
                  <li key={score} className="flex justify-between gap-4">
                    <span>
                      Score {score} ({SATISFACTION_LABELS[score]})
                    </span>
                    <span className="font-medium">
                      {result.satisfaction.histogram[score] ?? 0}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 px-4 py-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

function BreakdownCard({
  title,
  rows,
}: {
  title: string;
  rows: { key: string; count: number; pct: string }[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <ul className="mt-4 space-y-2 text-sm text-slate-700">
        {rows.map((row) => (
          <li key={row.key} className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
            <span className="font-medium">{row.key}</span>
            <span>
              {row.count}{" "}
              <span className="text-slate-500">({row.pct})</span>
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
