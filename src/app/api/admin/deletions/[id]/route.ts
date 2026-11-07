import process from "node:process";
import { ApiError, handle, session, supabase } from "@/server/backend";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    if (process.env.BACKEND_ENABLE_HARD_DELETE !== "true") throw new ApiError(503, "Eliminación física deshabilitada hasta validar su procedimiento");
    if (!process.env.SUPABASE_SECRET_KEY) throw new ApiError(503, "Falta configuración administrativa");
    const { token } = await session(request, "admin");
    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError(400, "Solicitud no válida");
    const target = await supabase("/rest/v1/rpc/begin_deletion", token, { p_request: id }, "POST") as string;
    try {
      await supabase(`/auth/v1/admin/users/${encodeURIComponent(target)}`, undefined, undefined, "DELETE", true);
    } catch (error) {
      // DELETE puede haberse completado aunque se perdiera la respuesta.
      if (!(error instanceof ApiError && error.status === 404)) throw new ApiError(409, "Eliminación pendiente de conciliación; conservar esta solicitud y no reactivar la cuenta");
    }
    try { await supabase("/rest/v1/rpc/finish_deletion", token, { p_request: id }, "POST"); }
    catch { throw new ApiError(409, "Auth procesado; falta finalizar la conciliación local"); }
    return { state: "complete", request_id: id };
  });
}
