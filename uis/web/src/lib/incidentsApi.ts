export type InvalidBreakdownItem = {
  rule: string;
  label: string;
  count: number;
};

export type IncidentAnalysisResult = {
  source_file: string;
  total_records: number;
  valid_count: number;
  invalid_count: number;
  invalid_breakdown: InvalidBreakdownItem[];
  category_counts: Record<string, number>;
  status_counts: Record<string, number>;
  country_counts: Record<string, number>;
  satisfaction: {
    scored_cases: number;
    closed_valid: number;
    average_score: number;
    histogram: Record<string, number>;
  };
};

export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8000";
}
