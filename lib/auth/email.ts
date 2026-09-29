import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import nodemailer from "nodemailer";
import type { AuthConfig } from "./config";
import type { AuthMail } from "./factory";

export async function deliverAuthMail(config: AuthConfig, mail: AuthMail) {
  if (config.transport === "file") {
    const directory = path.join(process.cwd(), ".local", "auth-mail");
    await mkdir(directory, { recursive: true });
    await writeFile(path.join(directory, `${randomUUID()}.json`), JSON.stringify(mail, null, 2), { flag: "wx", mode: 0o600 });
    return;
  }
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === "465", requireTLS: true,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
    connectionTimeout: 10000, socketTimeout: 15000,
  });
  await transport.sendMail({ from: process.env.SMTP_FROM, ...mail });
}
