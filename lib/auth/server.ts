import "server-only";
import { after } from "next/server";
import { getDatabase } from "../database/db";
import { readAuthConfig } from "./config";
import { createAuth } from "./factory";
import { deliverAuthMail } from "./email";

let instance: ReturnType<typeof createAuth> | undefined;
export function getAuth() {
  if (!instance) {
    const config = readAuthConfig();
    instance = createAuth(getDatabase(), config, async (mail) => {
      // Finish after the response to avoid revealing account existence through SMTP latency.
      after(async () => {
        try { await deliverAuthMail(config, mail); }
        catch { console.error("Authentication email delivery failed. Check the mail service configuration."); }
      });
    });
  }
  return instance;
}
