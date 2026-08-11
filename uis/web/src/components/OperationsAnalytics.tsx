"use client";

import { useState } from "react";
import {
  knownLocationIds,
  sampleAppointments,
  sampleClaims,
  sampleClinicians,
  sampleLocations,
} from "@healthcore/types/sampleData";
import {
  filterAppointmentsByStatus,
  filterClaims,
  groupClaimsBy,
  sortAppointmentsByDate,
  sortClaimsById,
} from "@healthcore/utils/collections";
import {
  binarySearchClaimById,
  findClaimById,
  findClinicianById,
} from "@healthcore/utils/search";
import {
  calculateDenialRate,
  calculateNoShowCost,
  denialRateByLocation,
  denialRateByPayer,
  flagHighDenialPayers,
  flagHighNoShowLocations,
  generateCMEReport,
  getCliniciansAtRisk,
  getCliniciansWithExpiringLicences,
  noShowRateByLocation,
} from "@healthcore/utils/transformations";
import {
  isDenialRateAboveThreshold,
  isNoShowRateAboveThreshold,
  validateClaim,
  validateClinician,
} from "@healthcore/utils/validations";

type PanelKey = "collections" | "search" | "transformations" | "validation";

export function OperationsAnalytics() {
  const [outputs, setOutputs] = useState<Record<PanelKey, unknown>>({
    collections: { status: "Ready", section: "Collections" },
    search: { status: "Ready", section: "Search" },
    transformations: { status: "Ready", section: "Transformations" },
    validation: { status: "Ready", section: "CME and Validation" },
  });

  const write = (key: PanelKey, data: unknown) => {
    setOutputs((prev) => ({ ...prev, [key]: data }));
  };

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-sky-700">Operations</p>
        <h2 className="mt-2 text-3xl font-semibold text-slate-900">Analytics from Milestone 2</h2>
        <p className="mt-3 max-w-3xl text-slate-600">
          Buttons call the original modules under <code>src/</code> via{" "}
          <code>@healthcore/*</code> imports. Results render below in the interface.
        </p>
      </div>

      <Panel
        title="Collections"
        output={outputs.collections}
        actions={[
          {
            label: "Filter denied BlueCross claims",
            onClick: () =>
              write(
                "collections",
                filterClaims(sampleClaims, { payerName: "BlueCross", status: "denied" })
              ),
          },
          {
            label: "Sort claims by ID (desc)",
            onClick: () => {
              const sorted = sortClaimsById(sampleClaims, "desc");
              write("collections", { sorted, originalUnchanged: sampleClaims });
            },
          },
          {
            label: "Sort appointments by date",
            onClick: () => write("collections", sortAppointmentsByDate(sampleAppointments, "asc")),
          },
          {
            label: "Group claims by payer",
            onClick: () => write("collections", groupClaimsBy(sampleClaims, "payerName")),
          },
        ]}
      />

      <Panel
        title="Search"
        output={outputs.search}
        actions={[
          {
            label: "Find claim CLM-000004",
            onClick: () => write("search", findClaimById(sampleClaims, "CLM-000004")),
          },
          {
            label: "Find clinician CLN-000002",
            onClick: () => write("search", findClinicianById(sampleClinicians, "CLN-000002")),
          },
          {
            label: "Binary search CLM-000003",
            onClick: () => {
              const sortedClaims = sortClaimsById(sampleClaims, "asc");
              const index = binarySearchClaimById(sortedClaims, "CLM-000003");
              write("search", { sortedClaims, index });
            },
          },
        ]}
      />

      <Panel
        title="Transformations"
        output={outputs.transformations}
        actions={[
          {
            label: "Denial rate analytics",
            onClick: () => {
              const denialRate = calculateDenialRate(sampleClaims);
              write("transformations", {
                denialRate,
                denialRateByPayer: denialRateByPayer(sampleClaims),
                denialRateByLocation: denialRateByLocation(sampleClaims),
                highDenialPayersAbove8: flagHighDenialPayers(sampleClaims),
                denialRateAboveDefaultThreshold: isDenialRateAboveThreshold(denialRate),
              });
            },
          },
          {
            label: "No-show analytics",
            onClick: () => {
              const noShowRates = noShowRateByLocation(sampleAppointments);
              write("transformations", {
                noShowRateByLocation: noShowRates,
                filteredNoShows: filterAppointmentsByStatus(sampleAppointments, ["no_show"]),
                noShowCostMiami: calculateNoShowCost(
                  sampleAppointments,
                  sampleLocations[1],
                  "2025-03-14"
                ),
                highNoShowLocationsAbove20: flagHighNoShowLocations(sampleAppointments),
                miamiNoShowRateAboveDefaultThreshold: isNoShowRateAboveThreshold(
                  noShowRates["us-fl-001"] ?? 0
                ),
              });
            },
          },
        ]}
      />

      <Panel
        title="CME & validations"
        output={outputs.validation}
        actions={[
          {
            label: "Generate CME report",
            onClick: () => {
              const asOfDate = "2026-06-20";
              write("validation", {
                cmeReport: generateCMEReport(sampleClinicians, asOfDate),
                cliniciansAtRisk: getCliniciansAtRisk(sampleClinicians, asOfDate),
                cliniciansWithLicencesExpiringIn90Days: getCliniciansWithExpiringLicences(
                  sampleClinicians,
                  asOfDate,
                  90
                ),
                cliniciansWithLicencesExpiringIn30Days: getCliniciansWithExpiringLicences(
                  sampleClinicians,
                  asOfDate,
                  30
                ),
              });
            },
          },
          {
            label: "Run validations",
            onClick: () => {
              const invalidRoleClinician = {
                ...sampleClinicians[0],
                role: "invalid_role",
              } as unknown as (typeof sampleClinicians)[number];
              write("validation", {
                claimValidation: validateClaim(sampleClaims[1], knownLocationIds),
                clinicianValidation: validateClinician(sampleClinicians[0]),
                invalidClinicianRoleValidation: validateClinician(invalidRoleClinician),
              });
            },
          },
        ]}
      />
    </div>
  );
}

function Panel({
  title,
  actions,
  output,
}: {
  title: string;
  actions: { label: string; onClick: () => void }[];
  output: unknown;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
      <div className="mt-4 flex flex-wrap gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            onClick={action.onClick}
            className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-800 hover:bg-sky-50 hover:border-sky-300"
          >
            {action.label}
          </button>
        ))}
      </div>
      <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-950 p-4 text-xs leading-relaxed text-sky-100">
        {JSON.stringify(output, null, 2)}
      </pre>
    </section>
  );
}
