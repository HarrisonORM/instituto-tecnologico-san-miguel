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
    if (!Number.isInteger(limit) || limit < 1 || limit > 100 || !Number.isSafeInteger(offset) || offset < 0) throw new ApiError(400, "Paginación no válida");
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
    return supabase(`/rest/v1/${resource}?${query}`, token);
  });
}

export async function POST(request: Request, context: Context) {
  return handle(async () => {
    const { token } = await session(request);
    const { resource: operation } = await context.params;
    if (!Object.hasOwn(operations, operation)) throw new ApiError(404, "Operación no disponible");
    const body = await bodyOf(request);
    if (Object.keys(body).some(key => !operations[operation].includes(key))) throw new ApiError(400, "Campo no admitido");
    return supabase(`/rest/v1/rpc/${operation}`, token, body, "POST");
  });
}
