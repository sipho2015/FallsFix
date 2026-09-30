import "dotenv/config";
import { createDatabaseClient } from "../src/backend/database/create-client";
import { executeOperation } from "../src/backend/operations/service";

async function main() {
  const db = createDatabaseClient(process.env.DATABASE_URL!);
  try {
    await db.$transaction(async tx => {
      const owner = await tx.user.findUnique({ where: { email: "siphomoyo893@gmail.com" }, include: { roles: true } });
      if (!owner?.emailVerified || owner.status !== "ACTIVE" || !owner.roles.some(r => r.role === "ADMIN")) {
        throw new Error("Register, verify and provision the intended owner administrator first.");
      }
      const categories = await tx.serviceCategory.findMany();
      if (!categories.some(c => c.slug === "it-support")) throw new Error("Seed the service catalogue first.");
      for (const [key, value] of [["invoiceIssuer", "FallsFix"], ["invoiceAddress", "4223 Chinotimba"]]) {
        await executeOperation(tx, owner.id, { action: "setting", key, value, reason: "Owner instructions recorded in docs/owner-decisions.md." });
      }
      for (const category of categories) {
        const isActive = category.slug === "it-support";
        if (category.isActive !== isActive) await executeOperation(tx, owner.id, {
          action: "catalogue", categoryId: category.id, isActive,
          reason: "Owner confirmed current fulfilment for Computer and IT support only.",
        });
      }
    });
    console.log("Owner invoice identity and current service coverage saved with audit records.");
  } finally { await db.$disconnect(); }
}
main().catch(error => { console.error(error instanceof Error ? error.message : "Configuration failed."); process.exitCode = 1; });
