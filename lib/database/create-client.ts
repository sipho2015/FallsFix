import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

// Shared by the server-only entry point and trusted CLI scripts, never browser code.
export function createDatabaseClient(connectionString: string) {
  const url = new URL(connectionString);
  if (!["postgres:", "postgresql:"].includes(url.protocol)) {
    throw new Error("A PostgreSQL connection URL is required.");
  }
  const adapter = new PrismaPg({
    connectionString,
    max: 5,
    connectionTimeoutMillis: 5000,
  });
  return new PrismaClient({ adapter });
}
