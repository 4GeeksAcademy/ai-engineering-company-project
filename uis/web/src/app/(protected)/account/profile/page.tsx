"use client";

import { useState, type FormEvent } from "react";
import { useAuth } from "@/components/AuthProvider";
import { ApiValidationError } from "@/lib/apiClient";
import { updateMyProfile } from "@/lib/authApi";

export default function ProfilePage() {
  const { user, refresh } = useAuth();
  const [name, setName] = useState(user?.profile.name ?? "");
  const [phone, setPhone] = useState(user?.profile.phone ?? "");
  const [address, setAddress] = useState(user?.profile.address ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateMyProfile({
        name: name.trim() || null,
        phone: phone.trim() || null,
        address: address.trim() || null,
      });
      await refresh();
      setSaved(true);
    } catch (err) {
      setError(err instanceof ApiValidationError || err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl">
      <h2 className="text-2xl font-semibold text-slate-900">Account profile</h2>
      <p className="mt-2 text-sm text-slate-600">Email comes from your user account. Name and contact live on your profile.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {saved ? <p className="text-sm text-emerald-700">Profile saved.</p> : null}
        <label className="block text-sm font-medium text-slate-700">
          Email
          <input
            readOnly
            className="mt-1 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
            value={user?.email ?? ""}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Name
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Phone
          <input
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Address
          <textarea
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
            rows={3}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-sky-700 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-800 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
