import "dotenv/config";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { randomBytes, randomUUID } from "node:crypto";
import { createDatabaseClient } from "../src/backend/database/create-client";
import { getTestDatabaseUrl } from "../src/backend/database/test-config";
import { createAuth, type AuthMail } from "../src/backend/auth/factory";
import { handleAuth } from "../src/backend/auth/handler";
import { readAuthConfig, type AuthConfig } from "../src/backend/auth/config";

const database = createDatabaseClient(getTestDatabaseUrl());
const config: AuthConfig = { origin: "https://auth.example.test", secret: randomBytes(48).toString("hex"), transport: "file", clientIpHeader: "x-test-client" };
const mail: AuthMail[] = [];
const auth = createAuth(database, config, async (message) => { mail.push(message); });
const emails: string[] = [];
const ips: string[] = [];
function ip() { const bytes = randomBytes(3); const address = `10.${bytes[0]}.${bytes[1]}.${bytes[2]}`; ips.push(address); return address; }
function email() { const address = `auth-${randomUUID()}@example.test`; emails.push(address); return address; }
const password = `Test-${randomBytes(20).toString("hex")}`;
const cookie = (result: Response) => result.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
async function request(endpoint: string, body?: unknown, options: { cookie?: string; ip?: string; origin?: string } = {}) {
  const headers = new Headers({ "content-type": "application/json", origin: options.origin ?? config.origin, "x-test-client": options.ip ?? ip() });
  if (options.cookie) headers.set("cookie", options.cookie);
  return handleAuth(new Request(new URL(endpoint.startsWith("/") ? endpoint : `/api/auth/${endpoint}`, config.origin), { method: body === undefined ? "GET" : "POST", headers, body: body === undefined ? undefined : JSON.stringify(body) }), auth, database, config);
}
async function register(address: string) {
  const result = await request("sign-up/email", { name: "Test Customer", email: address, password });
  assert.equal(result.status, 200, "Registration should succeed");
  return result;
}
async function verify(address: string) {
  const message = mail.findLast((message) => message.to === address && message.subject.includes("Verify"));
  assert.ok(message, "Verification email is captured privately");
  const link = new URL(message.text.match(/https:\/\/\S+/)![0]);
  const result = await request(`${link.pathname}${link.search}`);
  assert.equal(result.status, 302);
  assert.equal(new URL(result.headers.get("location")!).origin, config.origin);
}
after(async () => {
  // Only delete this run's explicit fixtures; never reset or truncate a database.
  const users = await database.user.findMany({ where: { email: { in: emails } }, select: { id: true } });
  const ids = users.map((user) => user.id);
  await database.verification.deleteMany({ where: { value: { in: ids } } });
  await database.userRole.deleteMany({ where: { userId: { in: ids } } });
  await database.customerProfile.deleteMany({ where: { userId: { in: ids } } });
  await database.user.deleteMany({ where: { id: { in: ids } } });
  await database.rateLimit.deleteMany({ where: { OR: ips.map((address) => ({ key: { contains: address } })) } });
  await database.$disconnect();
});

test("registration provisions only a customer, hashes passwords, and requires verified email", async () => {
  const address = email();
  const result = await register(address.toUpperCase());
  assert.equal(result.headers.get("set-cookie"), null);
  const user = await database.user.findUniqueOrThrow({ where: { email: address }, include: { roles: true, customerProfile: true, accounts: true } });
  assert.deepEqual(user.roles.map((role) => role.role), ["CUSTOMER"]);
  assert.ok(user.customerProfile);
  assert.notEqual(user.accounts[0].password, password);
  assert.ok(user.accounts[0].password && user.accounts[0].password.length > 64);
  assert.equal(user.emailVerified, false);
  assert.equal((await request("sign-in/email", { email: address, password })).status, 403);
  await verify(address);
  const login = await request("sign-in/email", { email: address, password });
  assert.equal(login.status, 200);
  const setCookie = login.headers.get("set-cookie")!;
  assert.match(setCookie, /HttpOnly/i); assert.match(setCookie, /Secure/i); assert.match(setCookie, /SameSite=Lax/i);
  const session = await (await request("get-session", undefined, { cookie: cookie(login) })).json();
  assert.equal(session.user.id, user.id);
  assert.equal(session.token, undefined);
  assert.equal(session.user.password, undefined);
  assert.equal((await request("sign-out", {}, { cookie: cookie(login) })).status, 200);
  assert.equal(await (await request("get-session", undefined, { cookie: cookie(login) })).json(), null);
});

test("public endpoints reject privilege injection, untrusted origins, unknown routes and oversized bodies", async () => {
  const address = email();
  assert.equal((await request("sign-up/email", { name: "Attacker", email: address, password, role: "ADMIN" })).status, 400);
  assert.equal((await request("sign-up/email", { name: "Attacker", email: address, password }, { origin: "https://evil.example" })).status, 403);
  assert.equal((await request("delete-user", {})).status, 404);
  assert.equal((await request("sign-up/email", { name: "a".repeat(17000), email: address, password })).status, 413);
  assert.equal(await database.user.count({ where: { email: address } }), 0);
});

test("reset tokens are single use and reset revokes all sessions", async () => {
  const address = email(); await register(address); await verify(address);
  const login = await request("sign-in/email", { email: address, password });
  const previousCookie = cookie(login);
  assert.equal((await request("request-password-reset", { email: address })).status, 200);
  const message = mail.findLast((entry) => entry.to === address && entry.subject.includes("Reset"))!;
  const link = new URL(message.text.match(/https:\/\/\S+/)![0]);
  const redirect = await request(`${link.pathname}${link.search}`);
  assert.equal(redirect.status, 302);
  const token = new URL(redirect.headers.get("location")!).searchParams.get("token");
  assert.ok(token);
  const newPassword = `${password}-changed`;
  assert.equal((await request("reset-password", { token, newPassword })).status, 200);
  assert.equal(await (await request("get-session", undefined, { cookie: previousCookie })).json(), null);
  assert.notEqual((await request("reset-password", { token, newPassword })).status, 200);
  assert.equal((await request("sign-in/email", { email: address, password })).status, 401);
  assert.equal((await request("sign-in/email", { email: address, password: newPassword })).status, 200);
});

test("suspension immediately denies existing sessions and new sign-ins", async () => {
  const address = email(); await register(address); await verify(address);
  const login = await request("sign-in/email", { email: address, password });
  await database.user.update({ where: { email: address }, data: { status: "SUSPENDED" } });
  assert.equal(await (await request("get-session", undefined, { cookie: cookie(login) })).json(), null);
  assert.equal((await request("sign-in/email", { email: address, password })).status, 403);
});

test("unknown and known recovery requests have the same public response", async () => {
  const address = email(); await register(address);
  const known = await request("request-password-reset", { email: address });
  const unknown = await request("request-password-reset", { email: email() });
  assert.equal(known.status, unknown.status);
  assert.deepEqual(await known.json(), await unknown.json());
  const duplicate = await register(address);
  assert.equal(duplicate.status, 200);
  assert.equal(await database.user.count({ where: { email: address } }), 1);
});

test("database-backed rate limits reject repeated login attempts", async () => {
  const address = email(); const clientIp = ip();
  for (let attempt = 0; attempt < 5; attempt++) assert.equal((await request("sign-in/email", { email: address, password }, { ip: clientIp })).status, 401);
  const denied = await request("sign-in/email", { email: address, password }, { ip: clientIp });
  assert.equal(denied.status, 429);
  assert.ok(denied.headers.get("retry-after"));
});

test("production rejects local outbox, insecure origins, and missing mail/proxy configuration", () => {
  const local = { NODE_ENV: "development", BETTER_AUTH_URL: "http://127.0.0.1:3000", BETTER_AUTH_SECRET: config.secret, AUTH_EMAIL_TRANSPORT: "file" } as const;
  assert.equal(readAuthConfig(local).transport, "file");
  assert.throws(() => readAuthConfig({ ...local, NODE_ENV: "production" }));
  assert.throws(() => readAuthConfig({ ...local, NODE_ENV: "production", BETTER_AUTH_URL: "https://fallsfix.example" }));
  assert.throws(() => readAuthConfig({ ...local, AUTH_EMAIL_TRANSPORT: "smtp" }));
});
