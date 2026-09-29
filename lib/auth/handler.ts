import { isIP } from "node:net";
import type { PrismaClient } from "../../generated/prisma/client";
import type { AuthConfig } from "./config";
import { activeSession, type FallsFixAuth } from "./factory";
import { authPaths, authSchemas } from "./validation";

const response = (body: unknown, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store", "Referrer-Policy": "no-referrer" } });
export async function handleAuth(request: Request, auth: FallsFixAuth, database: PrismaClient, config: AuthConfig) {
  const url = new URL(request.url);
  const endpoint = url.pathname.replace(/^\/api\/auth\//, "");
  const headers = new Headers(request.headers);
  // Only accept a single IP from a header overwritten by a trusted reverse proxy.
  const suppliedIp = config.clientIpHeader ? headers.get(config.clientIpHeader) : null;
  headers.set("x-fallsfix-client-ip", suppliedIp && isIP(suppliedIp) ? suppliedIp : "127.0.0.1");
  headers.delete("x-forwarded-for");
  headers.delete("x-real-ip");
  let forwarded = new Request(request, { headers });
  if (request.method === "GET") {
    if (endpoint === "get-session") return response(await activeSession(auth, database, headers));
    if (endpoint !== "verify-email" && !/^reset-password\/[^/]+$/.test(endpoint)) return response({ message: "Not found." }, 404);
    // Redirect destinations are supplied by the application, never by callers.
    url.searchParams.set("callbackURL", `${config.origin}/${endpoint === "verify-email" ? "login?verified=1" : "reset-password"}`);
    forwarded = new Request(url, { headers });
  } else if (request.method === "POST") {
    if (headers.get("origin") !== config.origin) return response({ message: "This request could not be verified. Refresh and try again." }, 403);
    if (headers.get("content-type")?.split(";")[0].trim() !== "application/json") return response({ message: "JSON is required." }, 415);
    const mode = (Object.keys(authPaths) as (keyof typeof authPaths)[]).find((key) => authPaths[key] === endpoint);
    if (!mode) return response({ message: "Not found." }, 404);
    const reader = forwarded.body?.getReader();
    if (!reader) return response({ message: "A request body is required." }, 400);
    const chunks: Uint8Array[] = [];
    let size = 0;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > 16384) { await reader.cancel(); return response({ message: "Request too large." }, 413); }
      chunks.push(value);
    }
    let input: unknown;
    try { input = JSON.parse(Buffer.concat(chunks).toString("utf8")); }
    catch { return response({ message: "Invalid request." }, 400); }
    const parsed = authSchemas[mode].safeParse(input);
    if (!parsed.success) return response({ message: "Check the entered details and try again." }, 400);
    const body: Record<string, unknown> = { ...parsed.data };
    if (mode === "register" || mode === "resend") body.callbackURL = `${config.origin}/login?verified=1`;
    if (mode === "forgot") body.redirectTo = `${config.origin}/reset-password`;
    forwarded = new Request(url, { method: "POST", headers, body: JSON.stringify(body) });
  } else return response({ message: "Method not allowed." }, 405);
  const result = await auth.handler(forwarded);
  const resultHeaders = new Headers(result.headers);
  if (result.status === 429) resultHeaders.set("Retry-After", resultHeaders.get("X-Retry-After") ?? "60");
  resultHeaders.set("Cache-Control", "no-store");
  resultHeaders.set("Referrer-Policy", "no-referrer");
  if (request.method === "POST" && result.ok) {
    // The browser needs the HttpOnly cookie, never a bearer token in JSON.
    await result.body?.cancel();
    resultHeaders.set("Content-Type", "application/json");
    resultHeaders.delete("Content-Length");
    return new Response(JSON.stringify({ success: true }), { status: result.status, headers: resultHeaders });
  }
  return new Response(result.body, { status: result.status, headers: resultHeaders });
}
