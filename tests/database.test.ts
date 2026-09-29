import "dotenv/config";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { randomUUID } from "node:crypto";
import type { Prisma } from "../generated/prisma/client";
import { createDatabaseClient } from "../src/backend/database/create-client";
import { getTestDatabaseUrl } from "../src/backend/database/test-config";
import { seedReferenceData } from "../prisma/seed-data";

const database = createDatabaseClient(getTestDatabaseUrl());
after(() => database.$disconnect());

test("the application database role has no cluster administration privileges", async () => {
  const roles = await database.$queryRaw<
    Array<{ rolsuper: boolean; rolcreatedb: boolean; rolcreaterole: boolean }>
  >`SELECT rolsuper, rolcreatedb, rolcreaterole FROM pg_roles WHERE rolname = current_user`;
  assert.deepEqual(roles, [
    { rolsuper: false, rolcreatedb: false, rolcreaterole: false },
  ]);
});

async function rollbackTest(
  check: (tx: Prisma.TransactionClient) => Promise<void>,
) {
  const rollback = new Error("test fixture rollback");
  try {
    await database.$transaction(
      async (tx) => {
        await check(tx);
        throw rollback;
      },
      { timeout: 30000 },
    );
  } catch (error) {
    if (error !== rollback) throw error;
  }
}

async function fixture(tx: Prisma.TransactionClient) {
  const suffix = randomUUID();
  const customer = await tx.user.create({
    data: {
      email: `customer-${suffix}@example.invalid`,
      name: "Test customer",
      customerProfile: { create: {} },
      roles: { create: { role: "CUSTOMER" } },
    },
  });
  const admin = await tx.user.create({
    data: {
      email: `admin-${suffix}@example.invalid`,
      name: "Test admin",
      roles: { create: { role: "ADMIN" } },
    },
  });
  const technician = await tx.user.create({
    data: {
      email: `technician-${suffix}@example.invalid`,
      name: "Test technician",
      technicianProfile: { create: {} },
    },
  });
  const area = await tx.serviceArea.create({
    data: {
      slug: suffix,
      name: "Test area",
      countryCode: "ZW",
      timezone: "Africa/Harare",
    },
  });
  const category = await tx.serviceCategory.create({
    data: { slug: suffix, name: "Test category", description: "Test only" },
  });
  const job = await tx.job.create({
    data: {
      customerId: customer.id,
      categoryId: category.id,
      serviceAreaId: area.id,
      description: "Test fixture",
      requestKey: randomUUID(),
      location: {
        create: {
          addressLine: "Test location",
          locality: "Test locality",
          contactName: "Test customer",
          contactPhone: "test-only",
        },
      },
      history: { create: { actorId: customer.id, toStatus: "REQUESTED" } },
    },
  });
  return { customer, admin, technician, area, category, job };
}

test("reference seed is repeatable and preserves edited records", () =>
  rollbackTest(async (tx) => {
    await seedReferenceData(tx);
    await tx.serviceCategory.update({
      where: { slug: "plumbing" },
      data: { name: "Locally edited plumbing", isActive: true },
    });
    await seedReferenceData(tx);
    assert.equal(await tx.serviceCategory.count(), 12);
    assert.equal(await tx.serviceArea.count(), 1);
    const category = await tx.serviceCategory.findUniqueOrThrow({
      where: { slug: "plumbing" },
    });
    assert.equal(category.name, "Locally edited plumbing");
    assert.equal(category.isActive, true);
  }));

test("a user can hold multiple roles but not duplicate memberships", () =>
  rollbackTest(async (tx) => {
    const { customer } = await fixture(tx);
    await tx.userRole.create({
      data: { userId: customer.id, role: "TECHNICIAN" },
    });
    assert.equal(
      await tx.userRole.count({ where: { userId: customer.id } }),
      2,
    );
    await assert.rejects(
      tx.userRole.create({ data: { userId: customer.id, role: "CUSTOMER" } }),
      { code: "P2002" },
    );
  }));

test("job history and address survive profile changes", () =>
  rollbackTest(async (tx) => {
    const { customer, job } = await fixture(tx);
    await tx.user.update({
      where: { id: customer.id },
      data: { name: "Changed profile" },
    });
    assert.equal(
      (await tx.jobLocation.findUniqueOrThrow({ where: { jobId: job.id } }))
        .contactName,
      "Test customer",
    );
    assert.equal(
      await tx.jobStatusHistory.count({ where: { jobId: job.id } }),
      1,
    );
  }));

test("referenced customers cannot be deleted", () =>
  rollbackTest(async (tx) => {
    const { customer } = await fixture(tx);
    await assert.rejects(
      tx.customerProfile.delete({ where: { userId: customer.id } }),
      { code: "P2003" },
    );
  }));

test("missing customer references are rejected", () =>
  rollbackTest(async (tx) => {
    const { job, category, area } = await fixture(tx);
    await assert.rejects(
      tx.job.create({
        data: {
          customerId: randomUUID(),
          categoryId: category.id,
          serviceAreaId: area.id,
          description: job.description,
          requestKey: randomUUID(),
        },
      }),
      { code: "P2003" },
    );
  }));

test("request keys prevent duplicate submissions", () =>
  rollbackTest(async (tx) => {
    const { job } = await fixture(tx);
    await assert.rejects(
      tx.job.create({
        data: {
          customerId: job.customerId,
          categoryId: job.categoryId,
          serviceAreaId: job.serviceAreaId,
          description: job.description,
          requestKey: job.requestKey,
        },
      }),
      { code: "P2002" },
    );
  }));

test("only one current technician assignment is allowed", () =>
  rollbackTest(async (tx) => {
    const { admin, technician, job } = await fixture(tx);
    const assignment = {
      jobId: job.id,
      technicianId: technician.id,
      assignedById: admin.id,
    };
    await tx.jobAssignment.create({ data: assignment });
    await assert.rejects(tx.jobAssignment.create({ data: assignment }), {
      code: "P2002",
    });
  }));

test("reassignment preserves a finished assignment and allows a new one", () =>
  rollbackTest(async (tx) => {
    const { admin, technician, job } = await fixture(tx);
    const assignment = {
      jobId: job.id,
      technicianId: technician.id,
      assignedById: admin.id,
    };
    const previous = await tx.jobAssignment.create({ data: assignment });
    await tx.jobAssignment.update({
      where: { id: previous.id },
      data: {
        status: "REPLACED",
        endedAt: new Date(),
        reason: "Test handover",
      },
    });
    await tx.jobAssignment.create({ data: assignment });
    assert.equal(await tx.jobAssignment.count({ where: { jobId: job.id } }), 2);
  }));

test("appointments cannot end before they start", () =>
  rollbackTest(async (tx) => {
    const { admin, job } = await fixture(tx);
    await assert.rejects(
      tx.jobAppointment.create({
        data: {
          jobId: job.id,
          createdById: admin.id,
          purpose: "WORK",
          startsAt: new Date("2030-01-01T12:00:00Z"),
          endsAt: new Date("2030-01-01T11:00:00Z"),
        },
      }),
    );
  }));

test("unverified technicians cannot be activated", () =>
  rollbackTest(async (tx) => {
    const { technician } = await fixture(tx);
    await assert.rejects(
      tx.technicianProfile.update({
        where: { userId: technician.id },
        data: { isActive: true },
      }),
    );
  }));

test("failed transactions leave no partial customer records", async () => {
  const email = `rollback-${randomUUID()}@example.invalid`;
  const stop = new Error("simulated failure");
  await assert.rejects(
    database.$transaction(async (tx) => {
      await tx.user.create({
        data: {
          email,
          name: "Rollback fixture",
          customerProfile: { create: {} },
        },
      });
      throw stop;
    }),
    (error) => error === stop,
  );
  assert.equal(await database.user.count({ where: { email } }), 0);
});
