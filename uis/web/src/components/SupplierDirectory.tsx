"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ErrorBanner } from "@/components/ErrorBanner";
import { toUserMessage } from "@/lib/apiClient";
import {
  ApiValidationError,
  VALID_CATEGORIES,
  createSupplier,
  fetchSuppliers,
  updateSupplierRate,
  updateSupplierStatus,
  type FieldError,
  type Supplier,
  type SupplierCountry,
  type SupplierCreateInput,
  type SupplierCurrency,
  type SupplierStatus,
} from "@/lib/suppliersApi";

type FormState = {
  name: string;
  country: SupplierCountry;
  categories: string[];
  monthly_rate: string;
  currency: SupplierCurrency;
  status: SupplierStatus;
  compliance_agreement: "" | "BAA" | "DPA" | "both";
  contract_renewal_date: string;
  contact_email: string;
  notes: string;
};

const emptyForm = (): FormState => ({
  name: "",
  country: "USA",
  categories: [],
  monthly_rate: "",
  currency: "USD",
  status: "active",
  compliance_agreement: "",
  contract_renewal_date: "",
  contact_email: "",
  notes: "",
});

export function SupplierDirectory() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FieldError[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [savingRateId, setSavingRateId] = useState<number | null>(null);
  const [statusBusyId, setStatusBusyId] = useState<number | null>(null);
  const [countryFilter, setCountryFilter] = useState<"ALL" | SupplierCountry>("ALL");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [rateDrafts, setRateDrafts] = useState<Record<number, string>>({});

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSuppliers();
      setSuppliers(data);
      const drafts: Record<number, string> = {};
      for (const s of data) drafts[s.id] = String(s.monthly_rate);
      setRateDrafts(drafts);
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    return suppliers.filter((s) => {
      if (countryFilter !== "ALL" && s.country !== countryFilter) return false;
      if (categoryFilter !== "ALL" && !s.categories.includes(categoryFilter)) return false;
      return true;
    });
  }, [suppliers, countryFilter, categoryFilter]);

  const onCountryChange = (country: SupplierCountry) => {
    setForm((prev) => ({
      ...prev,
      country,
      currency: country === "USA" ? "USD" : "GBP",
    }));
  };

  const toggleCategory = (category: string) => {
    setForm((prev) => {
      const has = prev.categories.includes(category);
      return {
        ...prev,
        categories: has
          ? prev.categories.filter((c) => c !== category)
          : [...prev.categories, category],
      };
    });
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setFormErrors([]);
    setError(null);
    try {
      const payload: SupplierCreateInput = {
        name: form.name.trim(),
        country: form.country,
        categories: form.categories,
        monthly_rate: Number(form.monthly_rate),
        currency: form.currency,
        status: form.status,
        compliance_agreement: form.compliance_agreement || null,
        contract_renewal_date: form.contract_renewal_date || null,
        contact_email: form.contact_email.trim() || null,
        notes: form.notes.trim() || null,
      };
      const created = await createSupplier(payload);
      setSuppliers((prev) =>
        [...prev, created].sort((a, b) => a.name.localeCompare(b.name)),
      );
      setRateDrafts((prev) => ({ ...prev, [created.id]: String(created.monthly_rate) }));
      setForm(emptyForm());
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setFormErrors(err.errors);
        setError(toUserMessage(err));
      } else {
        setError(toUserMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  const saveRate = async (supplier: Supplier) => {
    const raw = rateDrafts[supplier.id];
    const next = Number(raw);
    if (!Number.isFinite(next) || next <= 0) {
      setError("Monthly rate must be a number greater than 0");
      return;
    }
    setError(null);
    setSavingRateId(supplier.id);
    try {
      const updated = await updateSupplierRate(supplier.id, next);
      setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      setRateDrafts((prev) => ({ ...prev, [updated.id]: String(updated.monthly_rate) }));
    } catch (err) {
      if (err instanceof ApiValidationError) {
        setFormErrors(err.errors);
        setError(toUserMessage(err));
      } else {
        setError(toUserMessage(err));
      }
    } finally {
      setSavingRateId(null);
    }
  };

  const toggleStatus = async (supplier: Supplier) => {
    const next: SupplierStatus = supplier.status === "active" ? "suspended" : "active";
    setError(null);
    setStatusBusyId(supplier.id);
    try {
      const updated = await updateSupplierStatus(supplier.id, next);
      setSuppliers((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch (err) {
      setError(toUserMessage(err));
    } finally {
      setStatusBusyId(null);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">
          People & Compliance
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">
          Supplier directory
        </h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          Central registry for Diane Foster and Claire Whitfield — clinical, operational, and
          technology suppliers across USA and UK markets. Suppliers are suspended, not deleted.
        </p>
      </div>

      {error ? (
        <div className="space-y-2">
          <ErrorBanner
            message={error}
            onRetry={() => {
              void load();
            }}
            homeHref="/"
          />
          {formErrors.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-rose-800">
              {formErrors.map((err) => (
                <li key={`${err.field}-${err.message}`}>
                  <span className="font-medium">{err.field || "field"}:</span> {err.message}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Filters</h3>
        <div className="mt-4 flex flex-wrap gap-4">
          <label className="text-sm text-slate-700">
            Country
            <select
              className="ml-2 rounded-md border border-slate-300 px-2 py-1"
              value={countryFilter}
              onChange={(e) => setCountryFilter(e.target.value as "ALL" | SupplierCountry)}
            >
              <option value="ALL">All</option>
              <option value="USA">USA</option>
              <option value="UK">UK</option>
            </select>
          </label>
          <label className="text-sm text-slate-700">
            Category
            <select
              className="ml-2 rounded-md border border-slate-300 px-2 py-1"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="ALL">All</option>
              {VALID_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>
          <p className="self-center text-sm text-slate-500">
            Showing {filtered.length} of {suppliers.length}
          </p>
        </div>
      </section>

      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-600">
            <tr>
              <th className="px-4 py-3 font-semibold">Supplier</th>
              <th className="px-4 py-3 font-semibold">Country</th>
              <th className="px-4 py-3 font-semibold">Categories</th>
              <th className="px-4 py-3 font-semibold">Monthly rate</th>
              <th className="px-4 py-3 font-semibold">Compliance</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Loading suppliers…
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  No suppliers match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map((supplier) => {
                const suspended = supplier.status === "suspended";
                return (
                  <tr
                    key={supplier.id}
                    className={
                      suspended
                        ? "border-b border-amber-100 bg-amber-50/70 text-slate-600"
                        : "border-b border-slate-100 bg-white text-slate-800"
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{supplier.name}</div>
                      {supplier.notes ? (
                        <div className="mt-1 text-xs text-slate-500">{supplier.notes}</div>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{supplier.country}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {supplier.categories.map((c) => (
                          <span
                            key={c}
                            className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="0.01"
                          step="0.01"
                          className="w-28 rounded-md border border-slate-300 px-2 py-1"
                          value={rateDrafts[supplier.id] ?? ""}
                          onChange={(e) =>
                            setRateDrafts((prev) => ({
                              ...prev,
                              [supplier.id]: e.target.value,
                            }))
                          }
                        />
                        <span className="text-xs text-slate-500">{supplier.currency}</span>
                        <button
                          type="button"
                          disabled={savingRateId === supplier.id}
                          onClick={() => void saveRate(supplier)}
                          className="rounded-md bg-sky-700 px-2 py-1 text-xs font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
                        >
                          {savingRateId === supplier.id ? "Saving…" : "Save"}
                        </button>
                      </div>
                      <p className="mt-1 text-xs text-slate-400">
                        Updated {new Date(supplier.updated_at).toLocaleString()}
                      </p>
                    </td>
                    <td className="px-4 py-3">{supplier.compliance_agreement ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          suspended
                            ? "rounded-full bg-amber-200 px-2 py-1 text-xs font-semibold uppercase text-amber-950"
                            : "rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold uppercase text-emerald-800"
                        }
                      >
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        disabled={statusBusyId === supplier.id}
                        onClick={() => void toggleStatus(supplier)}
                        className="rounded-md border border-slate-300 px-3 py-1 text-xs font-semibold hover:bg-slate-50 disabled:opacity-50"
                      >
                        {statusBusyId === supplier.id
                          ? "Updating…"
                          : suspended
                            ? "Activate"
                            : "Suspend"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Register new supplier</h3>
        <form className="mt-4 grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <label className="text-sm">
            Name
            <input
              required
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            Country
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.country}
              onChange={(e) => onCountryChange(e.target.value as SupplierCountry)}
            >
              <option value="USA">USA</option>
              <option value="UK">UK</option>
            </select>
          </label>
          <label className="text-sm">
            Monthly rate
            <input
              required
              type="number"
              min="0.01"
              step="0.01"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.monthly_rate}
              onChange={(e) => setForm((p) => ({ ...p, monthly_rate: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            Currency
            <input
              readOnly
              className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
              value={form.currency}
            />
          </label>
          <label className="text-sm">
            Status
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.status}
              onChange={(e) =>
                setForm((p) => ({ ...p, status: e.target.value as SupplierStatus }))
              }
            >
              <option value="active">active</option>
              <option value="suspended">suspended</option>
            </select>
          </label>
          <label className="text-sm">
            Compliance agreement
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.compliance_agreement}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  compliance_agreement: e.target.value as FormState["compliance_agreement"],
                }))
              }
            >
              <option value="">None</option>
              <option value="BAA">BAA</option>
              <option value="DPA">DPA</option>
              <option value="both">both</option>
            </select>
          </label>
          <label className="text-sm">
            Contract renewal date
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.contract_renewal_date}
              onChange={(e) =>
                setForm((p) => ({ ...p, contract_renewal_date: e.target.value }))
              }
            />
          </label>
          <label className="text-sm">
            Contact email
            <input
              type="email"
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={form.contact_email}
              onChange={(e) => setForm((p) => ({ ...p, contact_email: e.target.value }))}
            />
          </label>
          <fieldset className="md:col-span-2">
            <legend className="text-sm font-medium text-slate-800">Categories</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {VALID_CATEGORIES.map((category) => (
                <label key={category} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={form.categories.includes(category)}
                    onChange={() => toggleCategory(category)}
                  />
                  {category}
                </label>
              ))}
            </div>
          </fieldset>
          <label className="text-sm md:col-span-2">
            Notes
            <textarea
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              rows={3}
              value={form.notes}
              onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
            />
          </label>
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Register supplier"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
