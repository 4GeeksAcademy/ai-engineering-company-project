import { apiBaseUrl } from "@/lib/incidentsApi";

export const VALID_CATEGORIES = [
  "medical_supplies",
  "laboratory_services",
  "pharmaceutical",
  "clinical_software",
  "it_infrastructure",
  "hr_and_payroll_software",
  "cleaning_and_facilities",
  "patient_communication",
  "billing_and_coding_software",
  "training_platforms",
] as const;

export type SupplierStatus = "active" | "suspended";
export type SupplierCountry = "USA" | "UK";
export type SupplierCurrency = "USD" | "GBP";

export type Supplier = {
  id: number;
  name: string;
  country: SupplierCountry;
  categories: string[];
  monthly_rate: number;
  currency: SupplierCurrency;
  updated_at: string;
  status: SupplierStatus;
  compliance_agreement: "BAA" | "DPA" | "both" | null;
  contract_renewal_date: string | null;
  contact_email: string | null;
  notes: string | null;
};

export type SupplierCreateInput = {
  name: string;
  country: SupplierCountry;
  categories: string[];
  monthly_rate: number;
  currency: SupplierCurrency;
  status: SupplierStatus;
  compliance_agreement?: "BAA" | "DPA" | "both" | null;
  contract_renewal_date?: string | null;
  contact_email?: string | null;
  notes?: string | null;
};

export type FieldError = { field: string; message: string };

export class ApiValidationError extends Error {
  errors: FieldError[];

  constructor(message: string, errors: FieldError[]) {
    super(message);
    this.errors = errors;
  }
}

async function parseError(response: Response): Promise<never> {
  const payload = await response.json().catch(() => ({}));
  const errors: FieldError[] = Array.isArray(payload.errors)
    ? payload.errors
    : Array.isArray(payload.detail?.errors)
      ? payload.detail.errors
      : [];

  if (response.status === 422 || errors.length > 0) {
    const message =
      typeof payload.detail === "string"
        ? payload.detail
        : payload.detail?.detail || "Validation failed";
    throw new ApiValidationError(message, errors);
  }

  const detail =
    typeof payload.detail === "string"
      ? payload.detail
      : "Request failed. Please try again.";
  throw new Error(detail);
}

export async function fetchSuppliers(): Promise<Supplier[]> {
  const response = await fetch(`${apiBaseUrl()}/suppliers`);
  if (!response.ok) await parseError(response);
  return response.json();
}

export async function createSupplier(input: SupplierCreateInput): Promise<Supplier> {
  const response = await fetch(`${apiBaseUrl()}/suppliers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) await parseError(response);
  return response.json();
}

export async function updateSupplierRate(
  id: number,
  monthly_rate: number,
): Promise<Supplier> {
  const response = await fetch(`${apiBaseUrl()}/suppliers/${id}/rate`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ monthly_rate }),
  });
  if (!response.ok) await parseError(response);
  return response.json();
}

export async function updateSupplierStatus(
  id: number,
  status: SupplierStatus,
): Promise<Supplier> {
  const response = await fetch(`${apiBaseUrl()}/suppliers/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) await parseError(response);
  return response.json();
}
