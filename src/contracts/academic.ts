export type Role = "student" | "teacher" | "academic_admin" | "system_admin";
export type AccountState = "active" | "suspended" | "archived" | "deleting";
export interface Profile {
  id: string; full_name: string; address: string; avatar_path: string | null;
  document_number: string | null; birth_date: string | null; program_id: string | null; state: AccountState;
}
export interface CurrentUser { profile: Profile; roles: { role: Role }[]; permissions: { permission: string }[] }
export interface Task {
  id: string; group_id: string; category_id: string; author_id: string; title: string;
  description: string; due_at: string; created_at: string;
}
export interface Submission {
  id: string; task_id: string; student_id: string; current_version: number;
  replacement_allowed: boolean; grade: number | null; graded_at: string | null;
}
export interface SubmissionVersion { id: string; submission_id: string; version: number; body: string; late: boolean; submitted_at: string }
export interface FinalResult { student_id: string; group_id: string; final_grade: number; passed: boolean; closed_at: string }
export interface UploadReservation {
  id: string; path: string; bytes: number; mime_type: string;
  inspection_state: "reserved" | "inspecting" | "verified" | "rejected";
}
export interface AuthTokens { access_token: string; refresh_token: string; expires_in: number; token_type: string }
export interface PublicProgram { id: string; name: string; description: string; price_label: string }
export interface PaginatedQuery { limit?: number; offset?: number; [column: string]: string | number | undefined }
