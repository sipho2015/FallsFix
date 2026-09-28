import "dotenv/config";
import { execFileSync } from "node:child_process";
import { getTestDatabaseUrl } from "../lib/database/test-config";

execFileSync(
  process.execPath,
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  {
    env: { ...process.env, DATABASE_URL: getTestDatabaseUrl() },
    stdio: "inherit",
  },
);
