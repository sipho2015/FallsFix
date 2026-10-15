import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "database/prisma/schema.prisma",
  migrations: {
    path: "database/prisma/migrations",
    seed: "tsx database/prisma/seed.ts",
  },
  // Generation and public-site builds do not require a live database.
  datasource: {
    url: process.env.DATABASE_URL,
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
