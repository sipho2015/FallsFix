import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import { createDatabaseClient } from "../lib/database/create-client";
import { getTestDatabaseUrl } from "../lib/database/test-config";

async function assertLoginRedirect(response: Response) {
  if (response.status === 307) assert.equal(response.headers.get("location"), "/login");
  else {
    // Next's root loading boundary can begin streaming before redirect() resolves.
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<meta[^>]*http-equiv="refresh"[^>]*content="[^\"]*url=\/login"/);
    assert.doesNotMatch(html, /HTTP Test Customer|Your account is ready/);
  }
}

test("Next.js serves registration, verification mail, protected account and logout", { timeout: 180000 }, async () => {
  const databaseUrl = getTestDatabaseUrl();
  const database = createDatabaseClient(databaseUrl);
  const origin = "http://127.0.0.1:3217";
  const address = `http-auth-${randomUUID()}@example.test`;
  const password = randomBytes(32).toString("base64url");
  const outbox = path.join(process.cwd(), ".local", "auth-mail");
  const createdMail: string[] = [];
  let initialMail: string[] = [];
  try { initialMail = await readdir(outbox); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error; }
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3217"], {
    windowsHide: true,
    // Discard request logs, which may contain the private verification URL.
    stdio: "ignore",
    env: { ...process.env, NODE_ENV: "development", DATABASE_URL: databaseUrl, BETTER_AUTH_URL: origin,
      BETTER_AUTH_SECRET: randomBytes(48).toString("base64url"), AUTH_EMAIL_TRANSPORT: "file", AUTH_CLIENT_IP_HEADER: "x-test-client" },
  });
  const clientIp = `10.${randomBytes(1)[0]}.${randomBytes(1)[0]}.${randomBytes(1)[0]}`;
  const post = (endpoint: string, body: unknown, cookie = "") => fetch(`${origin}/api/auth/${endpoint}`, {
    method: "POST", headers: { origin, "content-type": "application/json", "x-test-client": clientIp, cookie }, body: JSON.stringify(body), redirect: "manual",
  });
  try {
    let ready = false;
    for (let attempt = 0; attempt < 90; attempt++) {
      assert.equal(server.exitCode, null, "The isolated Next server exited before becoming ready; stop any dev server using this checkout.");
      try { ready = (await fetch(`${origin}/login`, { signal: AbortSignal.timeout(1000) })).ok; }
      catch { /* Wait for initial compilation. */ }
      if (ready) break;
      await delay(500);
    }
    assert.ok(ready, "The isolated Next server must be ready");
    const anonymous = await fetch(`${origin}/account`, { redirect: "manual" });
    await assertLoginRedirect(anonymous);
    assert.equal((await post("sign-up/email", { name: "HTTP Test Customer", email: address, password })).status, 200);
    let verificationUrl = "";
    for (let attempt = 0; attempt < 30 && !verificationUrl; attempt++) {
      const files = await readdir(outbox).catch(() => [] as string[]);
      for (const file of files.filter((file) => !initialMail.includes(file))) {
        const message = JSON.parse(await readFile(path.join(outbox, file), "utf8"));
        if (message.to === address) {
          createdMail.push(file);
          verificationUrl = message.text.match(/http:\/\/\S+/)[0];
        }
      }
      if (!verificationUrl) await delay(200);
    }
    assert.ok(verificationUrl, "Next after() must write the local verification email");
    const verified = await fetch(verificationUrl, { redirect: "manual", headers: { "x-test-client": clientIp } });
    assert.equal(verified.status, 302);
    const login = await post("sign-in/email", { email: address, password });
    assert.equal(login.status, 200);
    assert.deepEqual(await login.json(), { success: true });
    const cookie = login.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
    const account = await fetch(`${origin}/account`, { headers: { cookie } });
    assert.equal(account.status, 200);
    assert.match(await account.text(), /HTTP Test Customer/);
    assert.equal((await post("sign-out", {}, cookie)).status, 200);
    const loggedOut = await fetch(`${origin}/account`, { headers: { cookie }, redirect: "manual" });
    await assertLoginRedirect(loggedOut);
  } finally {
    if (server.pid && server.exitCode === null) {
      if (process.platform === "win32") spawnSync("taskkill", ["/PID", String(server.pid), "/T", "/F"], { windowsHide: true, stdio: "ignore" });
      else server.kill("SIGTERM");
    }
    const user = await database.user.findUnique({ where: { email: address } });
    if (user) {
      await database.verification.deleteMany({ where: { value: user.id } });
      await database.userRole.deleteMany({ where: { userId: user.id } });
      await database.customerProfile.deleteMany({ where: { userId: user.id } });
      await database.user.delete({ where: { id: user.id } });
    }
    await database.rateLimit.deleteMany({ where: { key: { contains: clientIp } } });
    for (const file of createdMail) await unlink(path.join(outbox, file));
    await database.$disconnect();
  }
});
