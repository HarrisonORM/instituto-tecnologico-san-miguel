import { handle, session, supabase } from "@/server/backend";

export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return handle(async () => {
    const { token, userId } = await session(request);
    const [profiles, roles, permissions] = await Promise.all([
      supabase(`/rest/v1/profiles?id=eq.${userId}&select=*&limit=1`, token),
      supabase(`/rest/v1/user_roles?user_id=eq.${userId}&select=role`, token),
      supabase(`/rest/v1/user_permissions?user_id=eq.${userId}&select=permission`, token),
    ]);
    return { profile: profiles[0], roles, permissions };
  });
}
