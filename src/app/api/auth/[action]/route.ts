import process from "node:process";
import { randomUUID } from "node:crypto";
import { ApiError, bodyOf, handle, session, supabase, text } from "@/server/backend";

export const dynamic = "force-dynamic";
type Context = { params: Promise<{ action: string }> };

export async function POST(request: Request, context: Context) {
  return handle(async () => {
    const { action } = await context.params;
    const body = await bodyOf(request);
    if (action === "verify") {
      const type = text(body.type, 20);
      if (!["invite", "recovery", "email"].includes(type)) throw new ApiError(400, "Verificación no admitida");
      return supabase("/auth/v1/verify", undefined, { token_hash: text(body.token_hash, 4096), type }, "POST");
    }
    if (action === "login" || action === "refresh") {
      const result = await supabase(`/auth/v1/token?grant_type=${action === "login" ? "password" : "refresh_token"}`, undefined,
        action === "login" ? { email: text(body.email, 254), password: text(body.password, 1024) } : { refresh_token: text(body.refresh_token, 8192) }, "POST") as { access_token: string };
      await session(new Request("http://local", { headers: { authorization: `Bearer ${result.access_token}` } }));
      return result;
    }
    if (action === "recover") {
      const redirect = process.env.AUTH_RECOVERY_REDIRECT_URL;
      if (!redirect) throw new ApiError(503, "Retorno de recuperación pendiente de configurar");
      const parsed = new URL(redirect);
      if (parsed.protocol !== "https:" && !(parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname))) throw new ApiError(503, "Retorno no válido");
      // Auth aplica sus límites de envío; respuesta genérica para no enumerar cuentas.
      try { await supabase(`/auth/v1/recover?redirect_to=${encodeURIComponent(redirect)}`, undefined, { email: text(body.email, 254) }, "POST"); }
      catch (error) { if (error instanceof ApiError && [429,503].includes(error.status)) throw error; }
      return { message: "Si la cuenta permite recuperación, recibirás las instrucciones" };
    }
    const { token } = await session(request);
    if (action === "mfa-list") {
      const user = await supabase("/auth/v1/user", token) as { factors?: { id: string; friendly_name?: string; status: string; factor_type?: string }[] };
      return (user.factors ?? []).map(({ id, friendly_name, status, factor_type }) => ({ id, friendly_name, status, factor_type }));
    }
    if (action === "mfa-enroll") return supabase("/auth/v1/factors", token, { factor_type: "totp", friendly_name: `Instituto San Miguel · ${randomUUID().slice(0, 8)}` }, "POST");
    if (action === "mfa-challenge" || action === "mfa-verify") {
      const factor = text(body.factor_id, 36);
      if (!/^[0-9a-f-]{36}$/i.test(factor)) throw new ApiError(400, "Factor no válido");
      const verify = action === "mfa-verify";
      return supabase(`/auth/v1/factors/${factor}/${verify ? "verify" : "challenge"}`, token,
        verify ? { challenge_id: text(body.challenge_id, 36), code: text(body.code, 20) } : {}, "POST");
    }
    if (action === "password") {
      const password = text(body.password, 128);
      if (password.length < 12) throw new ApiError(400, "La contraseña debe tener al menos 12 caracteres");
      const user = await supabase("/auth/v1/user", token) as { factors?: { status: string }[] };
      if (user.factors?.some(item => item.status === "verified")) await supabase("/rest/v1/rpc/require_recent_verification", token, {}, "POST");
      return supabase("/auth/v1/user", token, { password }, "PUT");
    }
    if (action === "logout") return supabase("/auth/v1/logout", token, {}, "POST");
    throw new ApiError(404, "Acción no disponible");
  });
}
