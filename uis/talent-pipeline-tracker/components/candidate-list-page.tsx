"use client";

import Link from "next/link";
import {
  startTransition,
  useCallback,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CandidateForm } from "@/components/candidate-form";
import { StatusBadge } from "@/components/status-badge";
import {
  createCandidate,
  listCandidates,
  trackerApiBaseUrl,
} from "@/lib/talent-tracker-service";
import {
  LOCATION_OPTIONS,
  STAGE_OPTIONS,
  STATUS_OPTIONS,
  STAGE_LABELS,
  STATUS_LABELS,
  type AsyncState,
  type CandidateFormValues,
  type CandidateListResult,
  type ClinicLocation,
  type RecordStage,
  type RecordStatus,
} from "@/types/tracker";

const DEFAULT_RECORDS_LIMIT = 20;
const MAX_RECORD_PAGES = 10;

const emptyCandidateForm: CandidateFormValues = {
  full_name: "",
  email: "",
  phone: "",
  position: "",
  location_requested: "Downtown Miami",
  linkedin_url: "",
  cv_url: "",
  experience_years: 0,
};

type LoadableListState = {
  status: AsyncState;
  error: string | null;
  data: CandidateListResult;
};

const emptyListResult: CandidateListResult = {
  data: [],
  total: 0,
  page: 1,
  limit: DEFAULT_RECORDS_LIMIT,
  totalPages: 1,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function CandidateListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") ?? "";
  const [listState, setListState] = useState<LoadableListState>({
    status: "loading",
    error: null,
    data: emptyListResult,
  });
  const [searchInput, setSearchInput] = useState(searchQuery);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createState, setCreateState] = useState<AsyncState>("idle");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState<string | null>(null);

  const deferredSearch = useDeferredValue(searchInput);
  const selectedStatus = (searchParams.get("status") as RecordStatus | null) ?? null;
  const selectedStage = (searchParams.get("stage") as RecordStage | null) ?? null;
  const selectedLocation =
    (searchParams.get("location") as ClinicLocation | null) ?? null;
  const selectedPage = Math.max(
    1,
    Math.min(Number(searchParams.get("page") ?? "1") || 1, MAX_RECORD_PAGES),
  );

  const replaceQueryParams = useCallback(
    (updates: Record<string, string | undefined>, resetPage = false) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all") {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      }

      if (resetPage) {
        nextParams.set("page", "1");
      }

      const current = searchParams.toString();
      const next = nextParams.toString();

      if (current === next) {
        return;
      }

      startTransition(() => {
        router.replace(next ? `/?${next}` : "/", { scroll: false });
      });
    },
    [router, searchParams],
  );

  useEffect(() => {
    replaceQueryParams(
      {
        search: deferredSearch.trim() || undefined,
      },
      true,
    );
  }, [deferredSearch, replaceQueryParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadCandidates() {
      setListState((current) => ({
        ...current,
        status: "loading",
        error: null,
      }));

      try {
        const data = await listCandidates({
          status: selectedStatus ?? undefined,
          stage: selectedStage ?? undefined,
          location: selectedLocation ?? undefined,
          search: searchParams.get("search") ?? undefined,
          page: selectedPage,
          limit: DEFAULT_RECORDS_LIMIT,
        });

        if (!cancelled) {
          setListState({
            status: "success",
            error: null,
            data,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setListState({
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Something went wrong while loading candidates.",
            data: emptyListResult,
          });
        }
      }
    }

    void loadCandidates();

    return () => {
      cancelled = true;
    };
  }, [searchParams, selectedLocation, selectedPage, selectedStage, selectedStatus]);

  async function handleCreate(values: CandidateFormValues) {
    setCreateState("loading");
    setCreateError(null);
    setCreateSuccess(null);

    try {
      const created = await createCandidate(values);
      const refreshed = await listCandidates({
        status: selectedStatus ?? undefined,
        stage: selectedStage ?? undefined,
        location: selectedLocation ?? undefined,
        search: searchParams.get("search") ?? undefined,
        page: selectedPage,
        limit: DEFAULT_RECORDS_LIMIT,
      });

      setListState({
        status: "success",
        error: null,
        data: refreshed,
      });
      setCreateState("success");
      setCreateSuccess(`${created.full_name} was added to the pipeline.`);
      setIsCreateOpen(false);
    } catch (error) {
      setCreateState("error");
      setCreateError(
        error instanceof Error
          ? error.message
          : "The candidate could not be created.",
      );
    }
  }

  const selectedCount = listState.data.data.filter(
    (candidate) => candidate.status === "selected",
  ).length;
  const activeReviewCount = listState.data.data.filter(
    (candidate) => candidate.status === "in_progress",
  ).length;
  const noteVolume = listState.data.data.reduce(
    (total, candidate) => total + candidate.notes_count,
    0,
  );

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <section className="glass-panel soft-shadow overflow-hidden rounded-[2rem] border border-white/70">
        <div className="grid gap-8 bg-[linear-gradient(120deg,rgba(16,32,51,0.95),rgba(20,83,75,0.9))] px-6 py-8 text-white lg:grid-cols-[1.6fr_1fr] lg:px-10 lg:py-10">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.32em] text-teal-100">
              HealthCore People Ops
            </div>
            <div className="space-y-3">
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Talent pipeline visibility for every HealthCore clinic.
              </h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-200 sm:text-base">
                Review applicants, route them through interviews, capture internal notes,
                and correct candidate data without leaving the workflow.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-slate-200">
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                API configured: {trackerApiBaseUrl}
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                Live candidate data from the Talent Tracker API
              </span>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[1.75rem] bg-white/10 p-5 ring-1 ring-white/10">
              <div className="text-xs uppercase tracking-[0.28em] text-teal-100">
                Filtered candidates
              </div>
              <div className="mt-3 text-4xl font-semibold">{listState.data.data.length}</div>
            </div>
            <div className="rounded-[1.75rem] bg-white/10 p-5 ring-1 ring-white/10">
              <div className="text-xs uppercase tracking-[0.28em] text-teal-100">
                In progress
              </div>
              <div className="mt-3 text-4xl font-semibold">{activeReviewCount}</div>
            </div>
            <div className="rounded-[1.75rem] bg-white/10 p-5 ring-1 ring-white/10">
              <div className="text-xs uppercase tracking-[0.28em] text-teal-100">
                Selected / notes
              </div>
              <div className="mt-3 text-4xl font-semibold">
                {selectedCount}
                <span className="ml-2 text-lg font-medium text-slate-200">/ {noteVolume}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1.5fr_0.9fr]">
        <div className="space-y-6">
          <div className="glass-panel soft-shadow rounded-[2rem] p-6 lg:p-8">
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-slate-950">
                    Candidate pipeline
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Filter by status, stage, or clinic location, then search by name or email
                    without a page reload.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateOpen((current) => !current);
                    setCreateError(null);
                    setCreateSuccess(null);
                  }}
                  className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                >
                  {isCreateOpen ? "Close intake form" : "Register new candidate"}
                </button>
              </div>

              {createSuccess ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  {createSuccess}
                </div>
              ) : null}

              <div className="grid gap-4 xl:grid-cols-[1.6fr_repeat(3,minmax(0,0.8fr))]">
                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Search by name or email
                  <input
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    placeholder="Search candidate or email"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
                  />
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Status
                  <select
                    value={selectedStatus ?? "all"}
                    onChange={(event) =>
                      replaceQueryParams({ status: event.target.value }, true)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
                  >
                    <option value="all">All statuses</option>
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Stage
                  <select
                    value={selectedStage ?? "all"}
                    onChange={(event) =>
                      replaceQueryParams({ stage: event.target.value }, true)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
                  >
                    <option value="all">All stages</option>
                    {STAGE_OPTIONS.map((stage) => (
                      <option key={stage} value={stage}>
                        {STAGE_LABELS[stage]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="space-y-2 text-sm font-medium text-slate-700">
                  Location
                  <select
                    value={selectedLocation ?? "all"}
                    onChange={(event) =>
                      replaceQueryParams({ location: event.target.value }, true)
                    }
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
                  >
                    <option value="all">All clinics</option>
                    {LOCATION_OPTIONS.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="glass-panel soft-shadow rounded-[2rem] p-4 sm:p-6">
            {listState.status === "loading" ? (
              <div className="grid gap-4">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="animate-pulse rounded-[1.5rem] border border-slate-200/70 bg-white/70 p-5"
                  >
                    <div className="h-4 w-32 rounded bg-slate-200" />
                    <div className="mt-3 h-3 w-48 rounded bg-slate-200" />
                    <div className="mt-5 h-14 rounded-2xl bg-slate-100" />
                  </div>
                ))}
              </div>
            ) : null}

            {listState.status === "error" ? (
              <div className="rounded-[1.5rem] border border-rose-200 bg-rose-50 p-6 text-rose-800">
                <h3 className="text-lg font-semibold">Unable to load candidates</h3>
                <p className="mt-2 text-sm leading-6">{listState.error}</p>
              </div>
            ) : null}

            {listState.status === "success" && listState.data.data.length === 0 ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center">
                <h3 className="text-lg font-semibold text-slate-950">
                  No candidates match these filters.
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Adjust the stage, status, location, or search input to widen the pipeline.
                </p>
              </div>
            ) : null}

            {listState.status === "success" && listState.data.data.length > 0 ? (
              <div className="grid gap-4">
                {listState.data.data.map((candidate) => (
                  <Link
                    key={candidate.id}
                    href={`/candidates/${candidate.id}`}
                    className="group rounded-[1.75rem] border border-slate-200/80 bg-white/88 p-5 transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-[0_18px_40px_rgba(13,148,136,0.12)]"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-3">
                          <h3 className="text-xl font-semibold text-slate-950">
                            {candidate.full_name}
                          </h3>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                            {candidate.position}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-600">
                          <span>{candidate.email}</span>
                          <span>{candidate.location_requested}</span>
                          <span>Applied {formatDate(candidate.applied_at)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <StatusBadge kind="status" value={candidate.status} />
                        <StatusBadge kind="stage" value={candidate.stage} />
                        <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                          {candidate.notes_count} notes
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : null}

            {listState.status === "success" && listState.data.totalPages > 1 ? (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/70 px-4 py-3">
                <div className="text-sm text-slate-600">
                  Page {listState.data.page} of {listState.data.totalPages} • {listState.data.total} applicants
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    disabled={listState.data.page <= 1}
                    onClick={() =>
                      replaceQueryParams({ page: String(Math.max(1, listState.data.page - 1)) })
                    }
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Prev
                  </button>
                  {Array.from({ length: listState.data.totalPages }, (_, index) => index + 1).map(
                    (pageNumber) => (
                      <button
                        key={pageNumber}
                        type="button"
                        onClick={() => replaceQueryParams({ page: String(pageNumber) })}
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] transition ${
                          pageNumber === listState.data.page
                            ? "bg-slate-950 text-white"
                            : "border border-slate-200 text-slate-700 hover:bg-white"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    disabled={listState.data.page >= listState.data.totalPages}
                    onClick={() =>
                      replaceQueryParams({
                        page: String(
                          Math.min(listState.data.totalPages, listState.data.page + 1),
                        ),
                      })
                    }
                    className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Next
                  </button>

                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      const formData = new FormData(event.currentTarget);
                      const raw = String(formData.get("jumpPage") ?? "");
                      const parsed = Number(raw);

                      if (Number.isNaN(parsed)) {
                        return;
                      }

                      const targetPage = Math.max(
                        1,
                        Math.min(listState.data.totalPages, Math.trunc(parsed)),
                      );

                      replaceQueryParams({ page: String(targetPage) });
                    }}
                    className="flex items-center gap-2"
                  >
                    <label htmlFor="jump-page" className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                      Jump
                    </label>
                    <input
                      id="jump-page"
                      name="jumpPage"
                      type="number"
                      min={1}
                      max={listState.data.totalPages}
                      defaultValue={listState.data.page}
                      className="w-16 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-center text-xs font-semibold text-slate-700 outline-none focus:border-teal-500"
                    />
                    <button
                      type="submit"
                      className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-slate-700 transition hover:bg-white"
                    >
                      Go
                    </button>
                  </form>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <aside className="space-y-6">
          {isCreateOpen ? (
            <div className="glass-panel soft-shadow rounded-[2rem] p-6 lg:p-7">
              <CandidateForm
                title="New candidate intake"
                description="Register candidates directly from this interface. Required fields are validated before the entry is added to the pipeline."
                submitLabel="Create candidate"
                initialValues={emptyCandidateForm}
                busy={createState === "loading"}
                successMessage={createSuccess}
                errorMessage={createError}
                onSubmit={handleCreate}
                onCancel={() => setIsCreateOpen(false)}
              />
            </div>
          ) : (
            <div className="glass-panel soft-shadow rounded-[2rem] p-6 lg:p-7">
              <h3 className="text-xl font-semibold text-slate-950">
                Open the intake form when a new applicant arrives.
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                The intake workflow validates required fields, seeds the new record into
                the pipeline instantly, and keeps the page state intact.
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsCreateOpen(true);
                  setCreateError(null);
                  setCreateSuccess(null);
                }}
                className="mt-5 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
              >
                Open intake form
              </button>
            </div>
          )}

          <div className="glass-panel rounded-[2rem] p-6">
            <h3 className="text-lg font-semibold text-slate-950">Workflow notes</h3>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
              <li>Open any record to update status or stage with a single change action.</li>
              <li>Detail pages support editing candidate data and managing internal notes.</li>
              <li>All mock operations run through async service helpers so loading and error states are exercised.</li>
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}