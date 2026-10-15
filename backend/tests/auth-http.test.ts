import "dotenv/config";
import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";
import { readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { seedReferenceData } from "../../database/prisma/seed-data";
import { setTimeout as delay } from "node:timers/promises";
import { test } from "node:test";
import { createDatabaseClient } from "../../database/client/create-client";
import { getTestDatabaseUrl } from "../../database/client/test-config";

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
  const server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "frontend", "--hostname", "127.0.0.1", "--port", "3217"], {
    windowsHide: true,
    // Discard request logs, which may contain the private verification URL.
    stdio: "ignore",
    env: { ...process.env, NODE_ENV: "development", DATABASE_URL: databaseUrl, BETTER_AUTH_URL: origin, NEXT_BUILD_DIR: ".next-auth-test",
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
    await assertLoginRedirect(await fetch(`${origin}/portal/admin`, { redirect: "manual" }));
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
    const portal = (role: string) => fetch(`${origin}/portal/${role}`, { headers: { cookie }, redirect: "manual" });
    const allowed = async (role: string, title: string) => {
      const response = await portal(role);
      assert.equal(response.status, 200);
      assert.match(await response.text(), new RegExp(`<h1[^>]*>${title}</h1>`));
    };
    const denied = async (role: string) => {
      const response = await portal(role);
      assert.ok([200, 404].includes(response.status));
      const html = await response.text();
      assert.match(html, /Page not found/);
      assert.doesNotMatch(html, /<h1[^>]*>(Customer|Technician|Administrator) workspace<\/h1>/);
    };
    await allowed("customer", "Customer workspace");
    for (const [view, heading] of [["requests", "My requests"], ["notifications", "Your updates"], ["profile", "Your profile"], ["application", "Apply as a technician"]]) {
      const response = await fetch(origin + "/portal/customer?view=" + view, { headers: { cookie } });
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.match(html, new RegExp("<h2[^>]*>" + heading));
      assert.ok(html.includes('aria-label="Customer navigation"'));
      if (view !== "application") assert.ok(!html.includes('name="categoryId"'), "Application form belongs in its own section");
    }
    await denied("admin");
    await denied("technician");
    await denied("unknown");
    const fixtureUser = await database.user.findUniqueOrThrow({ where: { email: address } });
    await seedReferenceData(database);
    const operation = (body: unknown, originHeader = origin, sessionCookie = cookie) => fetch(origin + "/api/operations", { method: "POST", headers: { origin: originHeader, cookie: sessionCookie, "content-type": "application/json" }, body: JSON.stringify(body) });
    const requestBody = { action: "request", requestKey: randomUUID(), category: "electrical", description: "HTTP fixture socket repair", addressLine: "123 Fixture Street", locality: "Victoria Falls", contactName: "HTTP Fixture", contactPhone: "+263123456789" };
    assert.equal((await operation(requestBody, "https://untrusted.example")).status, 403);
    assert.equal((await operation(requestBody, origin, "")).status, 401);
    assert.equal((await operation({ ...requestBody, role: "ADMIN" })).status, 400);
    const submission = await operation(requestBody); assert.equal(submission.status, 200);
    const saved = await submission.json(); assert.ok(saved.jobId);
    assert.equal((await operation(requestBody)).status, 200);
    const customerOverview = await (await fetch(origin + "/portal/customer?view=overview&page=999", { headers: { cookie } })).text();
    assert.ok(customerOverview.includes("HTTP fixture socket repair"), "Overview always shows the most recent requests regardless of a stale page parameter");
    const customerRequests = await (await fetch(origin + "/portal/customer?view=requests", { headers: { cookie } })).text();
    assert.ok(customerRequests.includes("HTTP fixture socket repair"));
    const detail = await fetch(origin + "/jobs/" + saved.jobId, { headers: { cookie } });
    assert.match(await detail.text(), /HTTP fixture socket repair/);
    assert.equal((await operation({ action: "reviewRequest", jobId: saved.jobId, version: 0 })).status, 403);
    const invalidPhoto = await fetch(origin + "/api/photos?jobId=" + saved.jobId, { method: "POST", headers: { cookie, origin }, body: "not a photo" });
    assert.equal(invalidPhoto.status, 400);
    const image = await sharp({ create: { width: 10, height: 10, channels: 3, background: "blue" } }).png().toBuffer();
    const upload = await fetch(origin + "/api/photos?jobId=" + saved.jobId, { method: "POST", headers: { cookie, origin, "content-type": "image/png" }, body: image });
    assert.equal(upload.status, 200);
    const photo = await database.jobPhoto.findFirstOrThrow({ where: { jobId: saved.jobId } });
    assert.equal((await fetch(origin + "/api/photos/" + photo.id)).status, 401);
    const privatePhoto = await fetch(origin + "/api/photos/" + photo.id, { headers: { cookie } });
    assert.equal(privatePhoto.status, 200); assert.equal(privatePhoto.headers.get("cache-control"), "private, no-store");
    await database.userRole.create({ data: { userId: fixtureUser.id, role: "ADMIN" } });
    assert.equal((await operation({ action: "reviewRequest", jobId: saved.jobId, version: 0 })).status, 200);
    await allowed("admin", "Administrator workspace");
    const adminOverview = await (await portal("admin")).text();
    assert.ok(adminOverview.includes('aria-label="Administrator navigation"'));
    assert.ok(adminOverview.includes("Awaiting review"));
    assert.ok(!adminOverview.includes('name="identityEvidence"'), "Verification forms should not clutter the overview");
    for (const [view, heading] of [["requests","Service requests"],["people","Technician applications"],["services","Service coverage"],["reports","Operational reports"],["notifications","Notifications"],["activity","Recent audit events"],["settings","Business settings"],["profile","Your profile"]]) {
      const response = await fetch(origin + "/portal/admin?view=" + view, {headers:{cookie}});
      assert.equal(response.status,200);
      const html = await response.text();
      assert.match(html, new RegExp("<h2[^>]*>"+heading));
      if (view === "people" || view === "reports") assert.ok(html.includes('name="view" value="'+view+'"'), "Filters must retain the current section");
    }
    const applicationCategory = await database.serviceCategory.findUniqueOrThrow({ where: { slug: "it-support" } });
    await database.technicianApplication.create({ data: { userId: fixtureUser.id, categoryId: applicationCategory.id, phone: "+263123456789", bio: "HTTP technician application fixture" } });
    const filteredPeople = await (await fetch(origin + "/portal/admin?view=people&q=no-matching-account-fixture", { headers: { cookie } })).text();
    assert.ok(filteredPeople.includes("<h3>HTTP Test Customer</h3>"), "Applicant names must remain visible when the separate account search has no matches");
    assert.ok(filteredPeople.includes("HTTP technician application fixture"));
    const invoice = await database.jobDocument.create({ data: {
      jobId: saved.jobId, kind: "INVOICE", revision: 1, status: "ISSUED", currency: "USD", total: 10000,
      scope: "HTTP invoice agreed scope", technicianSnapshot: "Fixture Technician",
      issuerSnapshot: { invoiceIssuer: "Fixture Services", invoiceAddress: "Test Address", invoiceEmail: "billing@example.test", invoiceTaxId: "" },
      lines: [{type:"LABOUR",description:"Repair labour",quantity:1,unitAmount:4000},{type:"MATERIALS",description:"Replacement part",quantity:1,unitAmount:5000},{type:"CALLOUT",description:"Approved travel",quantity:1,unitAmount:1000}],
    } });
    const invoiceResponse = await fetch(origin + "/jobs/" + saved.jobId + "/invoice", { headers: { cookie } });
    assert.equal(invoiceResponse.status, 200);
    const invoiceHtml = await invoiceResponse.text();
    for (const expected of ["Fixture Technician", "billing@example.test", "LABOUR", "MATERIALS", "CALLOUT", "Payment status", "PAYMENT DUE", "USD 100.00"]) assert.ok(invoiceHtml.includes(expected), expected);
    assert.ok(!invoiceHtml.includes("Tax / TIN / BPIN identifier:"));
    await assertLoginRedirect(await fetch(origin + "/jobs/" + saved.jobId + "/invoice", { redirect: "manual" }));
    await database.jobDocument.delete({where:{id:invoice.id}});
    await database.userRole.delete({ where: { userId_role: { userId: fixtureUser.id, role: "ADMIN" } } });
    await denied("admin");
    await database.userRole.create({ data: { userId: fixtureUser.id, role: "TECHNICIAN" } });
    await database.technicianProfile.create({ data: { userId: fixtureUser.id } });
    await denied("technician");
    await database.technicianProfile.update({ where: { userId: fixtureUser.id }, data: { isActive: true, verificationStatus: "VERIFIED", verifiedAt: new Date(), verifiedById: fixtureUser.id } });
    await allowed("technician", "Technician workspace");
    await database.technicianProfile.update({ where: { userId: fixtureUser.id }, data: { isActive: false } });
    await denied("technician");
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
      const jobs = { customerId: user.id };
      await database.notification.deleteMany({ where: { userId: user.id } });
      await database.auditEvent.deleteMany({ where: { actorId: user.id } });
      await database.jobPhoto.deleteMany({ where: { job: jobs } });
      await database.jobRefund.deleteMany({ where: { document: { job: jobs } } });
      await database.payment.deleteMany({ where: { document: { job: jobs } } });
      await database.jobDocument.deleteMany({ where: { job: jobs } });
      await database.jobStatusHistory.deleteMany({ where: { job: jobs } });
      await database.jobLocation.deleteMany({ where: { job: jobs } });
      await database.job.deleteMany({ where: jobs });
      await database.rateLimit.deleteMany({ where: { key: { startsWith: "operations:" + user.id } } });
      await database.verification.deleteMany({ where: { value: user.id } });
      await database.userRole.deleteMany({ where: { userId: user.id } });
      await database.customerProfile.deleteMany({ where: { userId: user.id } });
      await database.technicianApplication.deleteMany({ where: { userId: user.id } });
      await database.technicianProfile.deleteMany({ where: { userId: user.id } });
      await database.user.delete({ where: { id: user.id } });
    }
    await database.rateLimit.deleteMany({ where: { key: { contains: clientIp } } });
    for (const file of createdMail) await unlink(path.join(outbox, file));
    await database.$disconnect();
  }
});
