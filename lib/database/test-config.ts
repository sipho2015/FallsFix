export function getTestDatabaseUrl() {
  const connectionString = process.env.TEST_DATABASE_URL;
  if (!connectionString)
    throw new Error(
      "TEST_DATABASE_URL must point to a dedicated fallsfix_test database.",
    );
  const target = new URL(connectionString);
  if (target.pathname !== "/fallsfix_test")
    throw new Error("Database tests require the database name fallsfix_test.");
  if (process.env.DATABASE_URL) {
    const application = new URL(process.env.DATABASE_URL);
    if (
      target.host === application.host &&
      target.pathname === application.pathname
    ) {
      throw new Error(
        "The test database must be separate from the application database.",
      );
    }
  }
  return connectionString;
}
