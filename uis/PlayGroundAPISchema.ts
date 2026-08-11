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

export interface TalentTrackerApi {
  getRecords(
    query?: GetRecordsQuery
  ): Promise<GetRecordsResponse>;

  createRecord(
    body: RecordCreate
  ): Promise<RecordOut>;

  getRecord(
    id: string
  ): Promise<GetRecordResponse>;

  replaceRecord(
    id: string,
    body: RecordCreate
  ): Promise<RecordOut>;

  patchRecord(
    id: string,
    body: RecordPatch
  ): Promise<RecordOut>;

  deleteRecord(
    id: string
  ): Promise<void>;

  getNotes(
    id: string
  ): Promise<GetNotesResponse>;

  addNote(
    id: string,
    body: NoteCreate
  ): Promise<AddNoteResponse>;

  deleteNote(
    id: string,
    noteId: string
  ): Promise<void>;
}

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

export interface ValidationError {
  loc: Array<string | number>;
  msg: string;
  type: string;
}

export interface HTTPValidationError {
  detail?: ValidationError[];
}

export interface GetRecordsQuery {
  status?: RecordStatus;
  stage?: RecordStage;
  search?: string;
  page?: number;
  /** Defaults to 20 when omitted. */
  limit?: number;
}

export interface RecordIdParams {
  id: string;
}

export interface NoteParams {
  id: string;
  note_id: string;
}

export interface CreateRecordRequest {
  body: RecordCreate;
}

export interface ReplaceRecordRequest {
  id: string;
  body: RecordCreate;
}

export interface AddNoteRequest {
  id: string;
  body: NoteCreate;
}

export type GetRecordsResponse = unknown;

export type GetRecordResponse = unknown;

export interface CreateRecordResponse extends RecordOut {}

export interface ReplaceRecordResponse extends RecordOut {}

export interface PatchRecordResponse extends RecordOut {}

export type GetNotesResponse = unknown;

export type AddNoteResponse = unknown;

export type DeleteRecordResponse = void;

export type DeleteNoteResponse = void;
