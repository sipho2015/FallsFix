import { apiIdentity, apiError, boundedBody, json } from "@/backend/operations/http";
import { getDatabase } from "@/backend/database/db";
import { executeOperation, OperationError } from "@/backend/operations/service";
export const runtime = "nodejs";
export async function POST(request: Request) {
  try {
    const userId = await apiIdentity(request, true);
    if (!request.headers.get("content-type")?.startsWith("application/json")) throw new OperationError("JSON required.", 415);
    const body = JSON.parse((await boundedBody(request, 64000)).toString("utf8"));
    return json(await getDatabase().$transaction(tx => executeOperation(tx, userId, body), { timeout: 15000 }));
  } catch (error) { return apiError(error); }
}
