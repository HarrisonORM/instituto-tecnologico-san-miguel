export const dynamic = "force-dynamic";

export function GET(): Response {
  return Response.json(
    {
      status: "ok",
      service: "instituto-san-miguel",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
