import { ApiError, bodyOf, handle, operations, resources, session, supabase } from "@/server/backend";

type Context = { params: Promise<{ resource: string }> };
export const dynamic = "force-dynamic";

export async function GET(request: Request, context: Context) {
  return handle(async () => {
    const { token } = await session(request);
    const { resource } = await context.params;
    if (!resources.includes(resource)) throw new ApiError(404, "Recurso no disponible");
    const input = new URL(request.url).searchParams;
    const limit = Number(input.get("limit") ?? 25);
    const offset = Number(input.get("offset") ?? 0);
    if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0 || offset>1000000) throw new ApiError(400, "Paginación no válida");
    const query = new URLSearchParams({ select: "*", limit: String(limit), offset: String(offset) });
    // Solo igualdad sobre columnas explícitas; RLS sigue siendo la autoridad final.
    const filters = ["id", "group_id", "task_id", "submission_id", "period_id", "subject_id", "student_id", "program_id", "user_id"];
    for (const field of filters) {
      const value = input.get(field);
      if (value) {
        if (!/^[0-9a-f-]{36}$/i.test(value)) throw new ApiError(400, "Identificador no válido");
        query.set(field, `eq.${value}`);
      }
    }
    query.set("order", resource === "rubrics" ? "task_id" : resource === "final_results" ? "group_id,student_id" : resource === "enrollments" ? "group_id,student_id" : resource === "teacher_groups" ? "group_id,teacher_id" : "id");
    const orders:Record<string,string>={tasks:"due_at,id",notifications:"created_at.desc,id",comments:"created_at,id",submission_versions:"submitted_at.desc,id",calendar_events:"starts_at,id",profiles:"full_name,id",periods:"starts_on.desc,id",audit_events:"created_at.desc,id",grade_history:"created_at.desc,id"};
    if(orders[resource])query.set("order",orders[resource]);
    return supabase(`/rest/v1/${resource}?${query}`, token);
  });
}

export async function POST(request: Request, context: Context) {
  return handle(async () => {
    const { resource: operation } = await context.params;
    if (!Object.hasOwn(operations, operation)) throw new ApiError(404, "Operación no disponible");
    const reads = ["group_roster", "search_roster", "teacher_work_queue", "student_task_feed", "notification_count", "dashboard_counts", "my_subject_result", "operational_snapshot"];
    const { token } = await session(request, reads.includes(operation) ? "read" : "write");
    const body = await bodyOf(request);
    if (Object.keys(body).some(key => !operations[operation].includes(key))) throw new ApiError(400, "Campo no admitido");
    const key=request.headers.get("idempotency-key");
    if(key) {
      if(!/^[0-9a-f-]{36}$/i.test(key))throw new ApiError(400,"Clave de idempotencia no válida");
      if(!["publish_task","submit_work","review_work","add_comment","close_period","manage_structure"].includes(operation))throw new ApiError(400,"Esta operación no admite recibos idempotentes");
      return supabase("/rest/v1/rpc/command_once",token,{p_key:key,p_operation:operation,p_arguments:body},"POST");
    }
    return supabase(`/rest/v1/rpc/${operation}`, token, body, "POST");
  });
}
