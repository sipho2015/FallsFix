import "dotenv/config";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, test } from "node:test";
import type { Prisma, Role } from "../../database/generated/prisma/client";
import { createDatabaseClient } from "../../database/client/create-client";
import { getTestDatabaseUrl } from "../../database/client/test-config";
import { hasRole, loadPrincipal, readAuthorizedJob } from "../authorization/policy";

const database = createDatabaseClient(getTestDatabaseUrl());
after(() => database.$disconnect());

async function fixture(tx: Prisma.TransactionClient) {
  const createUser = (role: Role) => tx.user.create({ data: {
    name: "Authorization fixture", email: `${randomUUID()}@example.test`, emailVerified: true,
    roles: { create: { role } },
    ...(role === "CUSTOMER" ? { customerProfile: { create: {} } } : {}),
    ...(role === "TECHNICIAN" ? { technicianProfile: { create: {} } } : {}),
  } });
  const customer = await createUser("CUSTOMER");
  const stranger = await createUser("CUSTOMER");
  const admin = await createUser("ADMIN");
  const technician = await createUser("TECHNICIAN");
  const category = await tx.serviceCategory.create({ data: { slug: randomUUID(), name: "Fixture", description: "Fixture" } });
  const area = await tx.serviceArea.create({ data: { slug: randomUUID(), name: "Fixture", countryCode: "ZW", timezone: "Africa/Harare" } });
  const job = await tx.job.create({ data: { customerId: customer.id, categoryId: category.id, serviceAreaId: area.id, description: "Private fixture job", requestKey: randomUUID() } });
  return { customer, stranger, admin, technician, job };
}

async function rollback(check: (tx: Prisma.TransactionClient, data: Awaited<ReturnType<typeof fixture>>) => Promise<void>) {
  const stop = new Error("rollback authorization fixtures");
  try {
    await database.$transaction(async (tx) => { await check(tx, await fixture(tx)); throw stop; }, { timeout: 30000 });
  } catch (error) { if (error !== stop) throw error; }
}

test("customers read only their jobs; administrators do not inherit customer or technician roles", () => rollback(async (tx, f) => {
  assert.equal((await readAuthorizedJob(tx, f.customer.id, f.job.id))?.id, f.job.id);
  assert.equal(await readAuthorizedJob(tx, f.stranger.id, f.job.id), null);
  assert.equal((await readAuthorizedJob(tx, f.admin.id, f.job.id))?.id, f.job.id);
  const principal = (await loadPrincipal(tx, f.admin.id))!;
  assert.equal(hasRole(principal, "ADMIN"), true);
  assert.equal(hasRole(principal, "CUSTOMER"), false);
  assert.equal(hasRole(principal, "TECHNICIAN"), false);
  const job = (await readAuthorizedJob(tx, f.admin.id, f.job.id))!;
  assert.deepEqual(Object.keys(job).sort(), ["createdAt", "description", "id", "reference", "status"]);
}));

test("technicians require active verification and a current assignment; ending it removes access", () => rollback(async (tx, f) => {
  const assignment = await tx.jobAssignment.create({ data: { jobId: f.job.id, technicianId: f.technician.id, assignedById: f.admin.id } });
  assert.equal(await readAuthorizedJob(tx, f.technician.id, f.job.id), null);
  await tx.technicianProfile.update({ where: { userId: f.technician.id }, data: { isActive: true, verificationStatus: "VERIFIED", verifiedAt: new Date(), verifiedById: f.admin.id } });
  assert.equal((await readAuthorizedJob(tx, f.technician.id, f.job.id))?.id, f.job.id);
  await tx.technicianProfile.update({ where: { userId: f.technician.id }, data: { isActive: false } });
  assert.equal(await readAuthorizedJob(tx, f.technician.id, f.job.id), null);
  await tx.technicianProfile.update({ where: { userId: f.technician.id }, data: { isActive: true } });
  await tx.jobAssignment.update({ where: { id: assignment.id }, data: { status: "REPLACED", endedAt: new Date() } });
  assert.equal(await readAuthorizedJob(tx, f.technician.id, f.job.id), null);
}));

test("role removal, suspension and verification changes are read immediately", () => rollback(async (tx, f) => {
  await tx.userRole.delete({ where: { userId_role: { userId: f.customer.id, role: "CUSTOMER" } } });
  assert.equal(await readAuthorizedJob(tx, f.customer.id, f.job.id), null);
  await tx.user.update({ where: { id: f.admin.id }, data: { status: "SUSPENDED" } });
  assert.equal(await loadPrincipal(tx, f.admin.id), null);
  assert.equal(await readAuthorizedJob(tx, f.admin.id, f.job.id), null);
  await tx.user.update({ where: { id: f.admin.id }, data: { status: "ACTIVE", emailVerified: false } });
  assert.equal(await readAuthorizedJob(tx, f.admin.id, f.job.id), null);
}));

test("multiple explicit roles combine access; missing and malformed job IDs disclose nothing", () => rollback(async (tx, f) => {
  await tx.userRole.create({ data: { userId: f.customer.id, role: "ADMIN" } });
  const principal = (await loadPrincipal(tx, f.customer.id))!;
  assert.equal(hasRole(principal, "CUSTOMER"), true);
  assert.equal(hasRole(principal, "ADMIN"), true);
  assert.equal(hasRole(principal, "TECHNICIAN"), false);
  assert.equal(await readAuthorizedJob(tx, f.customer.id, randomUUID()), null);
  assert.equal(await readAuthorizedJob(tx, f.customer.id, "not-a-job-id"), null);
  assert.equal(await readAuthorizedJob(tx, randomUUID(), f.job.id), null);
}));
