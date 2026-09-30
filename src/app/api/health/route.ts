import { getDatabase } from "@/backend/database/db";
export async function GET() {
  try { await getDatabase().$queryRaw`SELECT 1`; return Response.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } }); }
  catch { return Response.json({ status: "unavailable" }, { status: 503, headers: { "Cache-Control": "no-store" } }); }
}
