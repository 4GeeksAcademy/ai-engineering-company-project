export type RecordStatus =
  | "received"
  | "in_progress"
  | "selected"
  | "discarded";

export type RecordStage =
  | "pending"
  | "review"
  | "personal_interview"
  | "technical_interview"
  | "offer_presented";

export interface RecordCreate {
  full_name: string;
  email: string;
  phone: string;
  position: string;
  linkedin_url?: string | null;
  cv_url?: string | null;
  experience_years: number;
}

export interface RecordOut {
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
}

export interface RecordPatch {
  status?: RecordStatus | string | null;
  stage?: RecordStage | string | null;
}

export interface NoteCreate {
  content: string;
}

export type ClinicLocation =
  | "Downtown Miami"
  | "Brickell"
  | "Coral Gables"
  | "Doral"
  | "Aventura"
  | "Fort Lauderdale";

export interface CandidateNote {
  id: string;
  content: string;
  author: string;
  created_at: string;
}

export interface CandidateRecord extends RecordOut {
  location_requested: ClinicLocation;
  notes: CandidateNote[];
}

export interface CandidateFormValues extends RecordCreate {
  location_requested: ClinicLocation;
}

export interface CandidateFilters {
  status?: RecordStatus;
  stage?: RecordStage;
  location?: ClinicLocation;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CandidateListResult {
  data: CandidateRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type AsyncState = "idle" | "loading" | "success" | "error";

export const STATUS_OPTIONS: RecordStatus[] = [
  "received",
  "in_progress",
  "selected",
  "discarded",
];

export const STAGE_OPTIONS: RecordStage[] = [
  "pending",
  "review",
  "personal_interview",
  "technical_interview",
  "offer_presented",
];

export const LOCATION_OPTIONS: ClinicLocation[] = [
  "Downtown Miami",
  "Brickell",
  "Coral Gables",
  "Doral",
  "Aventura",
  "Fort Lauderdale",
];

export const STATUS_LABELS: Record<RecordStatus, string> = {
  received: "Received",
  in_progress: "In progress",
  selected: "Selected",
  discarded: "Discarded",
};

export const STAGE_LABELS: Record<RecordStage, string> = {
  pending: "Pending",
  review: "Review",
  personal_interview: "Personal interview",
  technical_interview: "Technical interview",
  offer_presented: "Offer presented",
};