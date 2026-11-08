import { createHmac } from "node:crypto";
import { programs } from "@/lib/content";
import { ApiError, bodyOf, handle, supabase, text } from "@/server/backend";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  return handle(async () => {
    const body = await bodyOf(request);
    if (body.website) return { received: true };
    if (body.consent !== "yes") throw new ApiError(400, "Consentimiento requerido");
    const name = text(body.name, 120).trim(); const email = text(body.email, 254).trim().toLowerCase();
    const program = text(body.program, 30); const message = text(body.message, 2000).trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !programs.some(item => item.slug === program) || message.length < 10) throw new ApiError(400, "Datos no válidos");
    const secret = process.env.CONTACT_RATE_LIMIT_SECRET;
    if (!secret || secret.length < 32) throw new ApiError(503, "Recepción de solicitudes no disponible");
    const fingerprint = createHmac("sha256", secret).update(email).digest("hex");
    await supabase("/rest/v1/rpc/submit_contact", undefined, { p_name: name, p_email: email, p_program: program, p_message: message, p_fingerprint: fingerprint }, "POST", true);
    return { received: true };
  });
}
