import process from "node:process";
import { ApiError, config, handle, session, supabase } from "@/server/backend";
import { boundedBytes, inspectSignature } from "@/server/file-inspection";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { token, userId } = await session(request, "file"); const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError(400, "Archivo no válido");
    if (!process.env.SUPABASE_SECRET_KEY) throw new ApiError(503, "Inspección pendiente de configurar");
    const file = await supabase("/rest/v1/rpc/begin_inspection", undefined, { p_upload: id, p_actor: userId }, "POST", true) as { path: string; bytes: number; mime_type: string };
    try {
      const { url, key } = config();
      const response = await fetch(`${url}/storage/v1/object/authenticated/evidence/${file.path.split("/").map(encodeURIComponent).join("/")}`, {
        headers: { apikey: key, Authorization: `Bearer ${token}` }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new ApiError(400, "Archivo no disponible para inspección");
      const bytes = await boundedBytes(response, Math.min(file.bytes, 2000000));
      const sha = inspectSignature(bytes, file.mime_type);
      await supabase("/rest/v1/rpc/finish_inspection", undefined, { p_upload: id, p_actor: userId, p_sha: sha, p_bytes: bytes.length }, "POST", true);
      return { id, state: "verified" };
    } catch (error) {
      await supabase("/rest/v1/rpc/reject_inspection", undefined, { p_upload: id, p_actor: userId }, "POST", true).catch(() => undefined);
      throw error;
    }
  });
}
