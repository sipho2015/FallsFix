import "dotenv/config";
import { createDatabaseClient } from "../../database/client/create-client";
import { deleteEligibleJobPhotos } from "../operations/retention";

async function main() {
  const db = createDatabaseClient(process.env.DATABASE_URL!);
  const apply = process.argv.includes("--apply");
  let count = 0;
  try {
    const jobs = await db.job.findMany({ where: { reworkUntil: { lt: new Date() }, photos: { some: {} } }, select: { id: true } });
    for (const job of jobs) count += await db.$transaction(tx => deleteEligibleJobPhotos(tx, job.id, new Date(), apply));
    console.log(`${apply ? "Deleted" : "Eligible for deletion"}: ${count} photos. ${apply ? "" : "Dry run; use --apply to delete eligible photos."}`);
  } finally { await db.$disconnect(); }
}
main().catch(() => { console.error("Photo cleanup failed; check database connectivity and migrations."); process.exitCode = 1; });
