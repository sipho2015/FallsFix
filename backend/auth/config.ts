// Set only by the public frontend proxy, from its trusted ingress IP header.
export const INTERNAL_CLIENT_IP_HEADER = "x-fallsfix-proxy-client-ip";

export type AuthConfig = {
  origin: string;
  secret: string;
  transport: "file" | "smtp";
  clientIpHeader?: string;
};

export function readAuthConfig(env = process.env): AuthConfig {
  const url = new URL(env.BETTER_AUTH_URL ?? "");
  const local = ["127.0.0.1", "localhost", "[::1]"].includes(url.hostname);
  if (url.username || url.password || url.pathname !== "/" || url.search || url.hash ||
      !["http:", "https:"].includes(url.protocol)) throw new Error("Invalid authentication origin.");
  if (url.protocol !== "https:" && (!local || env.NODE_ENV === "production"))
    throw new Error("Authentication requires HTTPS outside local development.");
  if (!env.BETTER_AUTH_SECRET || env.BETTER_AUTH_SECRET.length < 32)
    throw new Error("A private authentication secret is required.");
  const transport = env.AUTH_EMAIL_TRANSPORT;
  if (transport !== "file" && transport !== "smtp") throw new Error("Configure authentication email delivery.");
  if (transport === "file" && (!local || env.NODE_ENV === "production"))
    throw new Error("File email delivery is restricted to local development.");
  if (transport === "smtp" && (!env.SMTP_HOST || !env.SMTP_FROM || !env.SMTP_USER || !env.SMTP_PASSWORD ||
      !["465", "587"].includes(env.SMTP_PORT ?? ""))) throw new Error("Complete SMTP configuration is required.");
  const clientIpHeader = env.AUTH_CLIENT_IP_HEADER?.toLowerCase();
  if (clientIpHeader && !/^[a-z0-9-]+$/.test(clientIpHeader)) throw new Error("Invalid proxy header.");
  if (env.NODE_ENV === "production" && !clientIpHeader)
    throw new Error("Configure a client IP header sanitized by the trusted reverse proxy.");
  return { origin: url.origin, secret: env.BETTER_AUTH_SECRET, transport, clientIpHeader };
}
