import process from "node:process";
import { ApiError, bodyOf, handle, session, supabase, text } from "@/server/backend";

export async function POST(request: Request) {
  return handle(async () => {
    const { token } = await session(request, "admin");
    // RPC valida administrador activo y MFA antes de usar una clave privilegiada.
    await supabase("/rest/v1/rpc/require_account_admin", token, {}, "POST");
    const body = await bodyOf(request);
    const email = text(body.email, 254).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ApiError(400, "Introduce un correo electrónico válido");
    const role = text(body.role, 40);
    if (!["student", "teacher", "academic_admin", "system_admin"].includes(role)) throw new ApiError(400, "Rol no válido");
    const name = text(body.full_name, 200);
    const key = text(request.headers.get("idempotency-key"), 36);
    if (!/^[0-9a-f-]{36}$/i.test(key)) throw new ApiError(400, "Idempotency-Key debe ser un UUID");
    if (!process.env.SUPABASE_SECRET_KEY) throw new ApiError(503, "Administración de Auth pendiente de configurar");
    const job = await supabase("/rest/v1/rpc/prepare_invitation", token, { p_key: key, p_email: email, p_name: name, p_role: role }, "POST") as { status: string; auth_user_id: string | null };
    if (job.status === "complete") return { id: job.auth_user_id, state: "invited" };
    const invited = await supabase("/auth/v1/invite", undefined, { email, data: { full_name: name } }, "POST", true) as { id: string };
    try {
      await supabase("/rest/v1/rpc/finish_invitation", token, { p_key: key, p_auth_user: invited.id }, "POST");
    } catch {
      // Auth y PostgreSQL no comparten transacción. El usuario sin perfil no obtiene acceso.
      throw new ApiError(409, "Invitación enviada; aprovisionamiento pendiente de conciliación administrativa");
    }
    return { id: invited.id, state: "invited" };
  });
}
