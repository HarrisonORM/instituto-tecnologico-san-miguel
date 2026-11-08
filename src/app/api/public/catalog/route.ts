import { handle, supabase } from "@/server/backend";
export const dynamic = "force-dynamic";
export async function GET() {
  const response = await handle(async () => ({ programs: await supabase("/rest/v1/rpc/academic_offer", undefined, {}, "POST") }));
  if (response.ok) response.headers.set("Cache-Control", "public, max-age=60, s-maxage=300");
  return response;
}
