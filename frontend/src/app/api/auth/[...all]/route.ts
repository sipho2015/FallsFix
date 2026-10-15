import { getAuth } from "@/backend/auth/server";
import { readAuthConfig } from "@/backend/auth/config";
import { handleAuth } from "@/backend/auth/handler";
import { getDatabase } from "@/backend/database/db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
async function handle(request: Request) {
  try { return await handleAuth(request, getAuth(), getDatabase(), readAuthConfig()); }
  catch {
    return Response.json({ message: "Account services are temporarily unavailable. Please try again later." },
      { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
export { handle as GET, handle as POST };
