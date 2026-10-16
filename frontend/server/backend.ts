import "server-only";
import { isIP } from "node:net";
import { INTERNAL_CLIENT_IP_HEADER } from "../../backend/auth/config";

// Runs in a route handler, never at build time, in middleware or in the browser.
export async function forwardToBackend(request: Request) {
  try {
    const binding = process.env.BACKEND_URL;
    if (!binding) throw new Error("Missing backend binding.");
    const base = new URL(binding.endsWith("/") ? binding : `${binding}/`);
    if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash)
      throw new Error("Invalid backend binding.");

    const incoming = new URL(request.url);
    const target = new URL(incoming.pathname.slice(1) + incoming.search, base);
    const headers = new Headers();
    for (const name of ["accept", "content-type", "cookie", "origin", "user-agent"]) {
      const value = request.headers.get(name);
      if (value) headers.set(name, value);
    }
    // Do not accept an inbound private header or a caller-supplied forwarding list.
    const ingressHeader = process.env.AUTH_CLIENT_IP_HEADER;
    const ip = ingressHeader ? request.headers.get(ingressHeader) : null;
    if (ip && isIP(ip)) headers.set(INTERNAL_CLIENT_IP_HEADER, ip);

    const options: RequestInit & { duplex: "half" } = {
      method: request.method,
      headers,
      body: request.method === "GET" || request.method === "HEAD" ? undefined : request.body,
      duplex: "half",
      redirect: "manual",
      cache: "no-store",
      signal: AbortSignal.any([request.signal, AbortSignal.timeout(30000)]),
    };
    const response = await fetch(target, options);
    const responseHeaders = new Headers(response.headers);
    // fetch decodes compressed bodies; preserve all Set-Cookie headers and redirects.
    for (const name of ["connection", "keep-alive", "transfer-encoding", "content-encoding", "content-length"])
      responseHeaders.delete(name);
    return new Response(response.body, { status: response.status, headers: responseHeaders });
  } catch {
    console.error("Internal backend request failed. Check the service binding and backend availability.");
    return Response.json({ message: "Service temporarily unavailable. Please try again later." },
      { status: 503, headers: { "Cache-Control": "no-store" } });
  }
}
