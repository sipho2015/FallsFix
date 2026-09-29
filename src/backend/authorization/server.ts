import "server-only";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import type { Role } from "../../../generated/prisma/client";
import { activeSession } from "../auth/factory";
import { getAuth } from "../auth/server";
import { getDatabase } from "../database/db";
import { hasRole, loadPrincipal, readAuthorizedJob } from "./policy";

export async function requirePrincipal() {
  const requestHeaders = await headers();
  if (!requestHeaders.get("cookie")) redirect("/login");
  const database = getDatabase();
  const session = await activeSession(getAuth(), database, requestHeaders);
  if (!session) redirect("/login");
  const principal = await loadPrincipal(database, session.user.id);
  if (!principal) redirect("/login");
  return principal;
}

export async function requireRole(role: Role) {
  const principal = await requirePrincipal();
  if (!hasRole(principal, role)) notFound();
  return principal;
}

export async function requireJob(jobId: string) {
  const principal = await requirePrincipal();
  const job = await readAuthorizedJob(getDatabase(), principal.user.id, jobId);
  if (!job) notFound();
  return job;
}
