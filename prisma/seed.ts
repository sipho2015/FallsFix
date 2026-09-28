import "dotenv/config";
import { createDatabaseClient } from "../lib/database/create-client";
import { seedReferenceData } from "./seed-data";

async function main() {
  if (process.env.NODE_ENV === "production")
    throw new Error("Development seed is disabled in production.");
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString)
    throw new Error("DATABASE_URL is required for seeding.");
  const database = createDatabaseClient(connectionString);
  try {
    await database.$transaction(seedReferenceData);
    console.log(
      "Reference catalogue seeded; existing records preserved. No users, jobs, or prices created.",
    );
  } finally {
    await database.$disconnect();
  }
}

main().catch(() => {
  console.error(
    "Reference seed failed. Check database configuration and migration status; connection details are not logged.",
  );
  process.exitCode = 1;
});
