import { ApiError, handle, session, supabase } from "@/server/backend";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  return handle(async () => {
    const { token } = await session(request, "admin"); const { id } = await context.params;
    if (!/^[0-9a-f-]{36}$/i.test(id)) throw new ApiError(400, "Trabajo no válido");
    const target = await supabase("/rest/v1/rpc/invitation_target", token, { p_key: id }, "POST") as string;
    await supabase("/rest/v1/rpc/reconcile_invitation", token, { p_key: id, p_auth_user: target }, "POST");
    return { id, state: "complete" };
  });
}
