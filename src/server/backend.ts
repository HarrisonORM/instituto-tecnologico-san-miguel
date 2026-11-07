import process from "node:process";

if (typeof window !== "undefined") throw new Error("Este módulo solo puede ejecutarse en el servidor");

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new ApiError(503, "Configuración de Supabase pendiente");
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(key)) throw new ApiError(503, "La configuración pública requiere una clave Publishable");
  const parsed = new URL(url);
  if (parsed.protocol !== "https:" || !/^[a-z0-9]{20}\.supabase\.co$/.test(parsed.hostname) || parsed.port || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname !== "/") {
    throw new ApiError(503, "URL de Supabase no válida");
  }
  return { url: parsed.origin, key };
}

export async function supabase(path: string, token?: string, body?: unknown, method = "GET", privileged = false) {
  const { url, key } = config();
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (privileged && !secret) throw new ApiError(503, "Administración de Auth pendiente de configurar");
  let response: Response;
  try {
    response = await fetch(`${url}${path}`, {
      method, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
      headers: {
        apikey: privileged ? secret! : key,
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch { throw new ApiError(503, "Servicio temporalmente no disponible"); }
  if (!response.ok) {
    // No reenviar mensajes de Auth, SQL, nombres de restricciones ni cuerpos privados.
    const error = await response.json().catch(() => ({})) as { code?: string; message?: string };
    const status = response.status === 404 ? 404 : response.status === 429 || error.code === "P0429" ? 429 : response.status === 401 ? 401 :
      response.status === 403 || error.code === "42501" ? 403 : response.status >= 500 ? 503 : 400;
    throw new ApiError(status, status === 429 ? "Demasiados intentos; espera antes de repetir" : error.code === "P0001" && error.message ? error.message : "La operación no pudo completarse");
  }
  if (response.status === 204) return null;
  const data = await response.json();
  const singleRow = ["/rest/v1/rpc/reserve_upload", "/rest/v1/rpc/begin_inspection", "/rest/v1/rpc/prepare_invitation"];
  if (singleRow.includes(path)) {
    if (Array.isArray(data)) {
      if(data.length!==1 || !data[0] || typeof data[0]!=="object")throw new ApiError(503,"Respuesta de operación no disponible");
      return data[0];
    }
    if(!data || typeof data!=="object")throw new ApiError(503,"Respuesta de operación no disponible");
  }
  return data;
}

export async function bodyOf(request: Request): Promise<Record<string, unknown>> {
  if (!request.headers.get("content-type")?.includes("application/json")) throw new ApiError(415, "Usa JSON");
  const reader = request.body?.getReader();
  if (!reader) throw new ApiError(400, "Falta el contenido");
  const chunks: Uint8Array[] = []; let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read(); if (done) break;
      size += value.length;
      if (size > 128000) { await reader.cancel(); throw new ApiError(413, "Contenido demasiado grande"); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
    const value: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error();
    return value as Record<string, unknown>;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(400, "JSON no válido");
  } finally { reader.releaseLock(); }
}

export function text(value: unknown, max = 500): string {
  if (typeof value !== "string" || !value.trim() || value.length > max) throw new ApiError(400, "Campo no válido");
  return value;
}

export async function session(request: Request, action: "read" | "write" | "file" | "admin" = "read") {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) throw new ApiError(401, "Sesión requerida");
  const token = authorization.slice(7);
  if (!token || token.length > 8192) throw new ApiError(401, "Sesión no válida");
  const user = await supabase("/auth/v1/user", token) as { id: string };
  const profiles = await supabase(`/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=id,state&limit=1`, token) as { id: string; state: string }[];
  if (!profiles[0] || profiles[0].state !== "active") throw new ApiError(403, "Cuenta no habilitada");
  await supabase("/rest/v1/rpc/consume_api_budget", token, { p_action: action }, "POST");
  return { token, userId: user.id };
}

export function json(value: unknown, status = 200) {
  return Response.json(value, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
}
export async function handle(work: () => Promise<unknown>) {
  try { return json({ data: await work() }); }
  catch (error) {
    return json({ error: error instanceof ApiError ? error.message : "Error interno", }, error instanceof ApiError ? error.status : 500);
  }
}

// Operaciones declaradas: nunca aceptar una ruta o nombre RPC arbitrario del cliente.
export const operations: Record<string, readonly string[]> = {
  update_my_profile: ["p_address", "p_avatar_path"], group_roster: ["p_group"],
  manage_structure: ["p_kind", "p_data"], set_evaluation: ["p_subject", "p_period", "p_categories"],
  publish_task: ["p_groups", "p_title", "p_description", "p_due_at", "p_category_name", "p_students"],
  submit_work: ["p_submission", "p_body", "p_uploads"], review_work: ["p_submission", "p_action", "p_grade", "p_comment"],
  add_comment: ["p_submission", "p_body"], close_period: ["p_period"], reserve_upload: ["p_bytes", "p_mime"],
  manage_account: ["p_user", "p_state"], correct_identity: ["p_user", "p_name", "p_document", "p_birth"],
  request_deletion: ["p_user"], approve_deletion: ["p_request"], mark_notification: ["p_notification"],
  set_permission: ["p_user", "p_permission", "p_enabled"], release_upload: ["p_upload"],
  request_identity_change: ["p_proposed", "p_reason"], resolve_identity_request: ["p_request", "p_accept"],
  assign_program: ["p_user", "p_program"], set_role: ["p_user", "p_role", "p_enabled"],
  add_calendar_event: ["p_period", "p_title", "p_start", "p_end"], set_rubric: ["p_task", "p_criteria"],
  edit_structure: ["p_kind", "p_id", "p_data"], retire_structure: ["p_kind", "p_id"],
  remove_assignment: ["p_group", "p_user", "p_kind"], cancel_deletion: ["p_request"], notification_count: [],
  discard_upload: ["p_upload"],
  set_public_offer: ["p_program", "p_description", "p_price_label", "p_published"],
  dashboard_counts: ["p_mode"], my_subject_result: ["p_group"],
  reconcile_storage_budget: [], operational_snapshot: [],
  search_roster: ["p_group", "p_search", "p_limit", "p_offset"],
  teacher_work_queue: ["p_group", "p_state", "p_search", "p_limit", "p_offset"],
  student_task_feed: ["p_period", "p_limit", "p_offset"], mark_all_notifications: [],
  set_translation: ["p_kind", "p_id", "p_locale", "p_fields"],
  mark_contact: ["p_contact"],
};
export const resources = ["profiles", "programs", "periods", "subjects", "groups", "teacher_groups", "enrollments", "categories", "tasks", "submissions", "submission_versions", "comments", "grade_history", "final_results", "notifications", "audit_events", "deletion_requests", "uploads", "identity_requests", "calendar_events", "rubrics"];
resources.push("invitation_jobs");
resources.push("content_translations", "contact_inquiries");
