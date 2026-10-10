import "dotenv/config";
import { readAuthConfig } from "../src/backend/auth/config";
const missing:string[]=[];
try {
  const auth = readAuthConfig({...process.env,NODE_ENV:"production"});
  const site = new URL(process.env.SITE_URL ?? "");
  if (site.origin !== auth.origin || site.pathname !== "/" || site.search || site.hash || site.username || site.password)
    missing.push("SITE_URL matching the canonical HTTPS authentication origin");
} catch {missing.push("canonical SITE_URL, HTTPS authentication origin, SMTP credentials, secret, and trusted proxy header");}
try {
  const database = new URL(process.env.DATABASE_URL ?? "");
  if (!["postgres:", "postgresql:"].includes(database.protocol) || database.pathname.length <= 1)
    missing.push("valid PostgreSQL DATABASE_URL");
} catch {missing.push("valid PostgreSQL DATABASE_URL");}
if(process.env.AUTH_EMAIL_TRANSPORT!=="smtp")missing.push("real SMTP delivery");
if(missing.length){console.error("Production configuration is incomplete: " + missing.join("; "));process.exitCode=1;}
else console.log("Production configuration shape validated. Delivery, backup, monitoring, and pilot verification are still required.");
