import "server-only";
import { randomUUID } from "node:crypto";
import { getDatabase } from "../database/db";
import { getAuth } from "../auth/server";
import { activeSession } from "../auth/factory";
import { OperationError } from "./service";
export const json = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
export async function apiIdentity(request: Request, write = false) {
  if (write && request.headers.get("origin") !== new URL(process.env.BETTER_AUTH_URL ?? request.url).origin) throw new OperationError("Request origin rejected.", 403);
  const session = await activeSession(getAuth(), getDatabase(), request.headers);
  if (!session) throw new OperationError("Please log in with your verified account.", 401);
  if (write) {
    const bucket = `operations:${session.user.id}:${Math.floor(Date.now() / 60000)}`;
    const limit = await getDatabase().rateLimit.upsert({ where: { key: bucket }, create: { key: bucket, count: 1, lastRequest: BigInt(Date.now()) }, update: { count: { increment: 1 } } });
    if (limit.count > 30) throw new OperationError("Too many updates. Wait a minute and try again.", 429);
    await getDatabase().rateLimit.deleteMany({ where: { key: { startsWith: "operations:" }, lastRequest: { lt: BigInt(Date.now() - 3600000) } } });
  }
  return session.user.id;
}
export function apiError(error: unknown) {
  if (error instanceof OperationError) return json({ message: error.message }, error.status);
  if (error instanceof SyntaxError) return json({ message: "Invalid request body." }, 400);
  const code = error && typeof error === "object" && "code" in error ? error.code : null;
  if (code === "P2002" || code === "P2034") return json({ message: "This operation was already submitted or changed. Refresh before retrying." }, 409);
  const reference = randomUUID();
  console.error("Operation failed", { reference, code });
  return json({ message: `Service temporarily unavailable. Please retry. Reference: ${reference}` }, 503);
}
export async function boundedBody(request: Request, max: number) {
  const reader = request.body?.getReader();
  if (!reader) throw new OperationError("Request body required.");
  const chunks: Uint8Array[] = []; let size = 0;
  while (true) { const part = await reader.read(); if (part.done) break; size += part.value.length; if (size > max) { await reader.cancel(); throw new OperationError("Request is too large.", 413); } chunks.push(part.value); }
  return Buffer.concat(chunks);
}
