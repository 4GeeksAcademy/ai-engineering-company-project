"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { CandidateForm } from "@/components/candidate-form";
import { StatusBadge } from "@/components/status-badge";
import {
  addCandidateNote,
  deleteCandidateNote,
  getCandidate,
  patchCandidate,
  updateCandidate,
} from "@/lib/talent-tracker-service";
import {
  STAGE_OPTIONS,
  STATUS_OPTIONS,
  STAGE_LABELS,
  STATUS_LABELS,
  type AsyncState,
  type CandidateFormValues,
  type CandidateRecord,
  type RecordStage,
  type RecordStatus,
} from "@/types/tracker";

type CandidateDetailPageProps = {
  candidateId: string;
};

type CandidateState = {
  status: AsyncState;
  error: string | null;
  data: CandidateRecord | null;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export function CandidateDetailPage({ candidateId }: CandidateDetailPageProps) {
  const [candidateState, setCandidateState] = useState<CandidateState>({
    status: "loading",
    error: null,
    data: null,
  });
  const [updateState, setUpdateState] = useState<AsyncState>("idle");
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState("");
  const [noteState, setNoteState] = useState<AsyncState>("idle");
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteMessage, setNoteMessage] = useState<string | null>(null);
  const [formState, setFormState] = useState<AsyncState>("idle");
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadCandidate() {
      setCandidateState({
        status: "loading",
        error: null,
        data: null,
      });

      try {
        const data = await getCandidate(candidateId);

        if (!cancelled) {
          setCandidateState({
            status: "success",
            error: null,
            data,
          });
        }
      } catch (error) {
        if (!cancelled) {
          setCandidateState({
            status: "error",
            error:
              error instanceof Error
                ? error.message
                : "Unable to load the candidate record.",
            data: null,
          });
        }
      }
    }

    void loadCandidate();

    return () => {
      cancelled = true;
    };
  }, [candidateId]);

  async function handleStatusUpdate(status: RecordStatus) {
    setUpdateState("loading");
    setUpdateMessage(null);
    setUpdateError(null);

    try {
      const updated = await patchCandidate(candidateId, { status });
      setCandidateState({ status: "success", error: null, data: updated });
      setUpdateState("success");
      setUpdateMessage(`Status updated to ${STATUS_LABELS[status]}.`);
    } catch (error) {
      setUpdateState("error");
      setUpdateError(
        error instanceof Error
          ? error.message
          : "The status update could not be saved.",
      );
    }
  }

  async function handleStageUpdate(stage: RecordStage) {
    setUpdateState("loading");
    setUpdateMessage(null);
    setUpdateError(null);

    try {
      const updated = await patchCandidate(candidateId, { stage });
      setCandidateState({ status: "success", error: null, data: updated });
      setUpdateState("success");
      setUpdateMessage(`Stage updated to ${STAGE_LABELS[stage]}.`);
    } catch (error) {
      setUpdateState("error");
      setUpdateError(
        error instanceof Error
          ? error.message
          : "The stage update could not be saved.",
      );
    }
  }

  async function handleAddNote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!noteInput.trim()) {
      setNoteError("Add note content before saving.");
      return;
    }

    setNoteState("loading");
    setNoteError(null);
    setNoteMessage(null);

    try {
      const updated = await addCandidateNote(candidateId, {
        content: noteInput.trim(),
      });
      setCandidateState({ status: "success", error: null, data: updated });
      setNoteInput("");
      setNoteState("success");
      setNoteMessage("Internal note added.");
    } catch (error) {
      setNoteState("error");
      setNoteError(
        error instanceof Error
          ? error.message
          : "The note could not be added.",
      );
    }
  }

  async function handleDeleteNote(noteId: string) {
    setNoteState("loading");
    setNoteError(null);
    setNoteMessage(null);

    try {
      const updated = await deleteCandidateNote(candidateId, noteId);
      setCandidateState({ status: "success", error: null, data: updated });
      setNoteState("success");
      setNoteMessage("Note deleted.");
    } catch (error) {
      setNoteState("error");
      setNoteError(
        error instanceof Error
          ? error.message
          : "The note could not be removed.",
      );
    }
  }

  async function handleFormSubmit(values: CandidateFormValues) {
    setFormState("loading");
    setFormError(null);
    setFormMessage(null);

    try {
      const updated = await updateCandidate(candidateId, values);
      setCandidateState({ status: "success", error: null, data: updated });
      setFormState("success");
      setFormMessage("Candidate profile updated.");
      setIsEditOpen(false);
    } catch (error) {
      setFormState("error");
      setFormError(
        error instanceof Error
          ? error.message
          : "The profile could not be saved.",
      );
    }
  }

  if (candidateState.status === "loading") {
    return (
      <main className="mx-auto flex w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="glass-panel soft-shadow flex w-full flex-col gap-4 rounded-[2rem] p-8 animate-pulse">
          <div className="h-4 w-28 rounded bg-slate-200" />
          <div className="h-10 w-2/3 rounded bg-slate-200" />
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="h-64 rounded-[1.75rem] bg-slate-100" />
            <div className="h-64 rounded-[1.75rem] bg-slate-100" />
          </div>
        </div>
      </main>
    );
  }

  if (candidateState.status === "error" || !candidateState.data) {
    return (
      <main className="mx-auto flex w-full max-w-4xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <div className="glass-panel soft-shadow w-full rounded-[2rem] border border-rose-200 p-8 text-rose-800">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold"
          >
            Back to pipeline
          </Link>
          <h1 className="mt-6 text-2xl font-semibold">Candidate detail unavailable</h1>
          <p className="mt-3 text-sm leading-6">{candidateState.error}</p>
        </div>
      </main>
    );
  }

  const candidate = candidateState.data;
  const formValues: CandidateFormValues = {
    full_name: candidate.full_name,
    email: candidate.email,
    phone: candidate.phone,
    position: candidate.position,
    location_requested: candidate.location_requested,
    linkedin_url: candidate.linkedin_url,
    cv_url: candidate.cv_url,
    experience_years: candidate.experience_years,
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-white"
          >
            Back to pipeline
          </Link>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950">
            {candidate.full_name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {candidate.position} candidate for {candidate.location_requested}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge kind="status" value={candidate.status} />
          <StatusBadge kind="stage" value={candidate.stage} />
        </div>
      </div>

      <section className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="glass-panel soft-shadow rounded-[2rem] p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">
                  Candidate detail
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Review the complete candidate record, then update status or stage with a
                  single interaction.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setIsEditOpen((current) => !current);
                  setFormError(null);
                  setFormMessage(null);
                }}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {isEditOpen ? "Close editor" : "Edit candidate data"}
              </button>
            </div>

            {updateMessage ? (
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {updateMessage}
              </div>
            ) : null}

            {updateError ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {updateError}
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700">
                Status
                <select
                  value={candidate.status}
                  disabled={updateState === "loading"}
                  onChange={(event) =>
                    handleStatusUpdate(event.target.value as RecordStatus)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 disabled:opacity-60"
                >
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
                  value={candidate.stage}
                  disabled={updateState === "loading"}
                  onChange={(event) =>
                    handleStageUpdate(event.target.value as RecordStage)
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500 disabled:opacity-60"
                >
                  {STAGE_OPTIONS.map((stage) => (
                    <option key={stage} value={stage}>
                      {STAGE_LABELS[stage]}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Contact
                </div>
                <dl className="mt-4 space-y-3 text-sm text-slate-700">
                  <div>
                    <dt className="font-semibold text-slate-950">Email</dt>
                    <dd>{candidate.email}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-950">Phone</dt>
                    <dd>{candidate.phone}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-950">Requested location</dt>
                    <dd>{candidate.location_requested}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Experience snapshot
                </div>
                <dl className="mt-4 space-y-3 text-sm text-slate-700">
                  <div>
                    <dt className="font-semibold text-slate-950">Years of experience</dt>
                    <dd>{candidate.experience_years}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-950">Applied at</dt>
                    <dd>{formatDateTime(candidate.applied_at)}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-slate-950">Last updated</dt>
                    <dd>{formatDateTime(candidate.updated_at)}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-5 md:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  External profile links
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {candidate.linkedin_url ? (
                    <a
                      href={candidate.linkedin_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                    >
                      Open LinkedIn
                    </a>
                  ) : null}
                  {candidate.cv_url ? (
                    <a
                      href={candidate.cv_url}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-teal-300 hover:text-teal-700"
                    >
                      Open CV
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {isEditOpen ? (
            <div className="glass-panel soft-shadow rounded-[2rem] p-6 lg:p-8">
              <CandidateForm
                key={`${candidate.id}-${candidate.updated_at}`}
                title="Edit candidate record"
                description="Correct candidate profile details, then save the updated record without leaving this page."
                submitLabel="Save changes"
                initialValues={formValues}
                busy={formState === "loading"}
                successMessage={formMessage}
                errorMessage={formError}
                onSubmit={handleFormSubmit}
                onCancel={() => setIsEditOpen(false)}
              />
            </div>
          ) : null}
        </div>

        <aside className="space-y-6">
          <div className="glass-panel soft-shadow rounded-[2rem] p-6 lg:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-950">Internal notes</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Capture interview feedback, scheduling notes, and clinic-specific context.
                </p>
              </div>
              <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                {candidate.notes_count} notes
              </span>
            </div>

            <form onSubmit={handleAddNote} className="mt-6 space-y-3">
              <textarea
                value={noteInput}
                onChange={(event) => setNoteInput(event.target.value)}
                rows={4}
                placeholder="Add internal context for recruiters or clinic managers"
                className="w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
              />
              <button
                type="submit"
                disabled={noteState === "loading"}
                className="rounded-full bg-teal-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {noteState === "loading" ? "Saving note..." : "Add note"}
              </button>
            </form>

            {noteMessage ? (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                {noteMessage}
              </div>
            ) : null}

            {noteError ? (
              <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {noteError}
              </div>
            ) : null}

            <div className="mt-6 space-y-4">
              {candidate.notes.map((note) => (
                <article
                  key={note.id}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-white/90 p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-slate-950">
                        {note.author}
                      </div>
                      <div className="text-xs uppercase tracking-[0.22em] text-slate-500">
                        {formatDateTime(note.created_at)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => void handleDeleteNote(note.id)}
                      className="rounded-full border border-rose-200 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-rose-700 transition hover:bg-rose-50"
                    >
                      Delete
                    </button>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-700">{note.content}</p>
                </article>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}