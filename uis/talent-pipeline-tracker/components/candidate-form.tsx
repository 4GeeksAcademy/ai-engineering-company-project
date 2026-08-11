"use client";

import { useState } from "react";

import {
  LOCATION_OPTIONS,
  type CandidateFormValues,
  type ClinicLocation,
} from "@/types/tracker";

type CandidateFormProps = {
  title: string;
  description: string;
  submitLabel: string;
  initialValues: CandidateFormValues;
  busy?: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
  onSubmit: (values: CandidateFormValues) => Promise<void>;
  onCancel?: () => void;
};

type CandidateFormErrors = Partial<Record<keyof CandidateFormValues, string>>;

function buildEmptyErrors(): CandidateFormErrors {
  return {};
}

export function CandidateForm({
  title,
  description,
  submitLabel,
  initialValues,
  busy = false,
  successMessage,
  errorMessage,
  onSubmit,
  onCancel,
}: CandidateFormProps) {
  const [values, setValues] = useState<CandidateFormValues>(initialValues);
  const [errors, setErrors] = useState<CandidateFormErrors>(buildEmptyErrors());

  function setField<K extends keyof CandidateFormValues>(
    field: K,
    value: CandidateFormValues[K],
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: undefined,
    }));
  }

  function validate() {
    const nextErrors: CandidateFormErrors = {};

    if (!values.full_name.trim()) {
      nextErrors.full_name = "Full name is required.";
    }

    if (!values.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!values.phone.trim()) {
      nextErrors.phone = "Phone is required.";
    }

    if (!values.position.trim()) {
      nextErrors.position = "Position is required.";
    }

    if (!values.location_requested) {
      nextErrors.location_requested = "Location is required.";
    }

    if (Number.isNaN(values.experience_years) || values.experience_years < 0) {
      nextErrors.experience_years = "Experience must be zero or greater.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    await onSubmit({
      ...values,
      full_name: values.full_name.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      position: values.position.trim(),
      linkedin_url: values.linkedin_url?.trim() || null,
      cv_url: values.cv_url?.trim() || null,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
        <p className="text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm font-medium text-slate-700">
          Full name
          <input
            value={values.full_name}
            onChange={(event) => setField("full_name", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
            placeholder="Candidate full name"
          />
          {errors.full_name ? (
            <span className="text-xs text-rose-600">{errors.full_name}</span>
          ) : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={values.email}
            onChange={(event) => setField("email", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
            placeholder="candidate@healthcore.example"
          />
          {errors.email ? (
            <span className="text-xs text-rose-600">{errors.email}</span>
          ) : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Phone
          <input
            value={values.phone}
            onChange={(event) => setField("phone", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
            placeholder="(305) 555-0100"
          />
          {errors.phone ? (
            <span className="text-xs text-rose-600">{errors.phone}</span>
          ) : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Position
          <input
            value={values.position}
            onChange={(event) => setField("position", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
            placeholder="Role title"
          />
          {errors.position ? (
            <span className="text-xs text-rose-600">{errors.position}</span>
          ) : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Location requested
          <select
            value={values.location_requested}
            onChange={(event) =>
              setField(
                "location_requested",
                event.target.value as ClinicLocation,
              )
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
          >
            {LOCATION_OPTIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
          {errors.location_requested ? (
            <span className="text-xs text-rose-600">
              {errors.location_requested}
            </span>
          ) : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          Years of experience
          <input
            type="number"
            min={0}
            value={values.experience_years}
            onChange={(event) =>
              setField("experience_years", Number(event.target.value))
            }
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
          />
          {errors.experience_years ? (
            <span className="text-xs text-rose-600">
              {errors.experience_years}
            </span>
          ) : null}
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          LinkedIn URL
          <input
            value={values.linkedin_url ?? ""}
            onChange={(event) => setField("linkedin_url", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
            placeholder="https://linkedin.com/in/..."
          />
        </label>

        <label className="space-y-2 text-sm font-medium text-slate-700">
          CV URL
          <input
            value={values.cv_url ?? ""}
            onChange={(event) => setField("cv_url", event.target.value)}
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-teal-500"
            placeholder="https://example.com/resume.pdf"
          />
        </label>
      </div>

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={busy}
          className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? "Saving..." : submitLabel}
        </button>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
}