import { ApiError, handle, session, supabase, config, json } from "@/server/backend";

export const dynamic = "force-dynamic";
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { token } = await session(request, "file");
    const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError(400, "Archivo no válido");
    const uploads = await supabase(`/rest/v1/uploads?id=eq.${id}&inspection_state=eq.verified&select=path,mime_type&limit=1`, token) as { path: string; mime_type: string }[];
    const file = uploads[0];
    if (!file) throw new ApiError(404, "Archivo no disponible");
    const { url, key } = config();
    const response = await fetch(`${url}/storage/v1/object/authenticated/evidence/${file.path.split("/").map(encodeURIComponent).join("/")}`, {
      headers: { apikey: key, Authorization: `Bearer ${token}` }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new ApiError(404, "Archivo no disponible");
    return new Response(response.body, { headers: {
      "Content-Type": "application/octet-stream", "Content-Disposition": `attachment; filename="${id}"`,
      "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff",
    } });
  } catch (error) {
    return json({ error: error instanceof ApiError ? error.message : "Archivo temporalmente no disponible" }, error instanceof ApiError ? error.status : 503);
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { token, userId } = await session(request, "file"); const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError(400, "Archivo no válido");
    const files=await supabase(`/rest/v1/uploads?id=eq.${id}&owner_id=eq.${userId}&select=path&limit=1`,token) as {path:string}[];
    if(!files[0])throw new ApiError(404,"Reserva no disponible");
    await supabase("/rest/v1/rpc/discard_upload",token,{p_upload:id},"POST");
    try {await supabase("/storage/v1/object/evidence",token,{prefixes:[files[0].path]},"DELETE");}
    catch(error){if(!(error instanceof ApiError && error.status===404))throw new ApiError(409,"Retirada pendiente; conservar la reserva para conciliar");}
    return supabase("/rest/v1/rpc/release_upload", token, { p_upload: id }, "POST");
  });
}
