import { randomBytes } from "node:crypto";
import { readFile, appendFile } from "node:fs/promises";

let existing = "";
try { existing = await readFile(".env", "utf8"); }
catch (error) { if (error.code !== "ENOENT") throw error; }
const defaults = {
  BETTER_AUTH_SECRET: randomBytes(48).toString("base64url"),
  BETTER_AUTH_URL: "http://127.0.0.1:3000",
  AUTH_EMAIL_TRANSPORT: "file",
};
const missing = Object.entries(defaults).filter(([key]) => !new RegExp(`^${key}=`, "m").test(existing));
if (missing.length) await appendFile(".env", `\n${missing.map(([key, value]) => `${key}="${value}"`).join("\n")}\n`, { mode: 0o600 });
console.log("Local authentication configuration is ready. Existing values were preserved; no secrets are displayed.");
