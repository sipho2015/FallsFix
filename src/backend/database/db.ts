import "server-only";
import { createDatabaseClient } from "./create-client";

const databaseGlobal = globalThis as typeof globalThis & {
  fallsfixDatabase?: ReturnType<typeof createDatabaseClient>;
};

// Lazy creation keeps public pages buildable without credentials or a live database.
export function getDatabase() {
  if (!databaseGlobal.fallsfixDatabase) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString)
      throw new Error("DATABASE_URL is required for database operations.");
    databaseGlobal.fallsfixDatabase = createDatabaseClient(connectionString);
  }
  return databaseGlobal.fallsfixDatabase;
}
