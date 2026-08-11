import type {
  CandidateFilters,
  CandidateListResult,
  CandidateFormValues,
  CandidateNote,
  CandidateRecord,
  ClinicLocation,
  NoteCreate,
  RecordPatch,
  RecordStage,
  RecordStatus,
} from "@/types/tracker";
import { LOCATION_OPTIONS } from "@/types/tracker";

const LOCATION_STORAGE_KEY = "healthcore-talent-pipeline-locations";
const DEFAULT_RECORDS_LIMIT = 20;
const MAX_RECORD_PAGES = 10;

export const trackerApiBaseUrl =
  process.env.NEXT_PUBLIC_API_URL ?? "https://playground.4geeks.com/tracker/api/v1";

type ApiListResponse<T> = {
  data?: T[];
  total?: number;
  page?: number;
  limit?: number;
};

type ApiNotesResponse = {
  data?: Array<{
    id: string;
    record_id: string;
    content: string;
    created_at: string;
  }>;
};

type ApiRecord = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url: string | null;
  cv_url: string | null;
  status: RecordStatus | string;
  stage: RecordStage | string;
  experience_years: number;
  notes_count: number;
  applied_at: string;
  updated_at: string;
  notes?: Array<{
    id: string;
    record_id: string;
    content: string;
    created_at: string;
  }>;
};

function inferLocation(recordId: string): ClinicLocation {
  const seed = Array.from(recordId).reduce((total, character) => {
    return total + character.charCodeAt(0);
  }, 0);

  return LOCATION_OPTIONS[seed % LOCATION_OPTIONS.length];
}

function readLocationMap(): Record<string, ClinicLocation> {
  if (typeof window === "undefined") {
    return {};
  }

  const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);

  if (!raw) {
    return {};
  }

  try {
    return JSON.parse(raw) as Record<string, ClinicLocation>;
  } catch {
    return {};
  }
}

function writeLocationMap(map: Record<string, ClinicLocation>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(map));
}

function normalizeNotes(
  notes: Array<{ id: string; content: string; created_at: string }> | undefined,
): CandidateNote[] {
  return (notes ?? []).map((note) => ({
    id: note.id,
    content: note.content,
    created_at: note.created_at,
    author: "HealthCore Internal",
  }));
}

function toCandidateRecord(
  record: ApiRecord,
  locationMap: Record<string, ClinicLocation>,
): CandidateRecord {
  const normalizedNotes = normalizeNotes(record.notes);

  return {
    ...record,
    location_requested: locationMap[record.id] ?? inferLocation(record.id),
    notes: normalizedNotes,
    notes_count: record.notes_count ?? normalizedNotes.length,
  };
}

async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${trackerApiBaseUrl}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}.`;

    try {
      const body = (await response.json()) as { detail?: string };
      if (body?.detail) {
        message = body.detail;
      }
    } catch {
      const text = await response.text();
      if (text) {
        message = text;
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

function applyLocationFilter(
  candidates: CandidateRecord[],
  location?: ClinicLocation,
) {
  if (!location) {
    return candidates;
  }

  return candidates.filter((candidate) => candidate.location_requested === location);
}

function sortByUpdatedAt(candidates: CandidateRecord[]) {
  return [...candidates].sort((left, right) => {
    return (
      new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime()
    );
  });
}

async function getNotesByRecordId(recordId: string): Promise<CandidateNote[]> {
  const notesResponse = await apiRequest<ApiNotesResponse>(`/records/${recordId}/notes`);

  return normalizeNotes(notesResponse.data);
}

async function getRecordById(recordId: string): Promise<CandidateRecord> {
  const locationMap = readLocationMap();
  const record = await apiRequest<ApiRecord>(`/records/${recordId}`);
  const notes = await getNotesByRecordId(recordId);

  return {
    ...toCandidateRecord(record, locationMap),
    notes,
    notes_count: notes.length,
  };
}

function buildListQuery(filters: CandidateFilters = {}) {
  const params = new URLSearchParams();
  const page = Math.max(1, Math.min(filters.page ?? 1, MAX_RECORD_PAGES));
  const limit = Math.max(1, filters.limit ?? DEFAULT_RECORDS_LIMIT);

  if (filters.status) {
    params.set("status", filters.status);
  }

  if (filters.stage) {
    params.set("stage", filters.stage);
  }

  if (filters.search?.trim()) {
    params.set("search", filters.search.trim());
  }

  params.set("page", String(page));
  params.set("limit", String(limit));

  const query = params.toString();
  return query ? `?${query}` : "";
}

export async function listCandidates(filters: CandidateFilters = {}) {
  const list = await apiRequest<ApiListResponse<ApiRecord>>(
    `/records${buildListQuery(filters)}`,
  );
  const page = Math.max(1, Math.min(list.page ?? filters.page ?? 1, MAX_RECORD_PAGES));
  const limit = Math.max(1, list.limit ?? filters.limit ?? DEFAULT_RECORDS_LIMIT);
  const total = Math.max(0, list.total ?? 0);
  const totalPages = Math.max(1, Math.min(Math.ceil(total / limit), MAX_RECORD_PAGES));
  const locationMap = readLocationMap();
  const records = (list.data ?? []).map((record) => toCandidateRecord(record, locationMap));

  return {
    data: applyLocationFilter(sortByUpdatedAt(records), filters.location),
    total,
    page,
    limit,
    totalPages,
  } as CandidateListResult;
}

export async function getCandidate(candidateId: string) {
  return getRecordById(candidateId);
}

export async function createCandidate(values: CandidateFormValues) {
  const created = await apiRequest<ApiRecord>("/records", {
    method: "POST",
    body: JSON.stringify({
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
      position: values.position,
      linkedin_url: values.linkedin_url ?? null,
      cv_url: values.cv_url ?? null,
      experience_years: values.experience_years,
    }),
  });

  const locationMap = readLocationMap();
  locationMap[created.id] = values.location_requested;
  writeLocationMap(locationMap);

  return {
    ...toCandidateRecord(created, locationMap),
    notes: [],
    notes_count: 0,
  };
}

export async function updateCandidate(
  candidateId: string,
  values: CandidateFormValues,
) {
  await apiRequest<ApiRecord>(`/records/${candidateId}`, {
    method: "PUT",
    body: JSON.stringify({
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
      position: values.position,
      linkedin_url: values.linkedin_url ?? null,
      cv_url: values.cv_url ?? null,
      experience_years: values.experience_years,
    }),
  });

  const locationMap = readLocationMap();
  locationMap[candidateId] = values.location_requested;
  writeLocationMap(locationMap);

  return getRecordById(candidateId);
}

export async function patchCandidate(
  candidateId: string,
  patch: RecordPatch,
) {
  const payload: RecordPatch = {};

  if (patch.status !== undefined) {
    payload.status = patch.status;
  }

  if (patch.stage !== undefined) {
    payload.stage = patch.stage;
  }

  await apiRequest<ApiRecord>(`/records/${candidateId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return getRecordById(candidateId);
}

export async function addCandidateNote(
  candidateId: string,
  note: NoteCreate,
) {
  await apiRequest(`/records/${candidateId}/notes`, {
    method: "POST",
    body: JSON.stringify(note),
  });

  return getRecordById(candidateId);
}

export async function deleteCandidateNote(
  candidateId: string,
  noteId: string,
) {
  await apiRequest(`/records/${candidateId}/notes/${noteId}`, {
    method: "DELETE",
  });

  return getRecordById(candidateId);
}