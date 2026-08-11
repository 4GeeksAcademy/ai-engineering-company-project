import type { RecordStage, RecordStatus } from "@/types/tracker";
import { STAGE_LABELS, STATUS_LABELS } from "@/types/tracker";

type StatusBadgeProps = {
  kind: "status" | "stage";
  value: RecordStatus | RecordStage | string;
};

const badgeClassNames = {
  received: "bg-sky-100 text-sky-800 border-sky-200",
  in_progress: "bg-amber-100 text-amber-900 border-amber-200",
  selected: "bg-emerald-100 text-emerald-900 border-emerald-200",
  discarded: "bg-rose-100 text-rose-900 border-rose-200",
  pending: "bg-slate-100 text-slate-800 border-slate-200",
  review: "bg-cyan-100 text-cyan-900 border-cyan-200",
  personal_interview: "bg-violet-100 text-violet-900 border-violet-200",
  technical_interview: "bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200",
  offer_presented: "bg-lime-100 text-lime-900 border-lime-200",
} as const;

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function StatusBadge({ kind, value }: StatusBadgeProps) {
  const label =
    kind === "status"
      ? STATUS_LABELS[value as RecordStatus] ?? humanize(value)
      : STAGE_LABELS[value as RecordStage] ?? humanize(value);

  const className =
    badgeClassNames[value as keyof typeof badgeClassNames] ??
    "bg-slate-100 text-slate-800 border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-[0.18em] uppercase ${className}`}
    >
      {label}
    </span>
  );
}