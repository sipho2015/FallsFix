import "server-only";
import type { Prisma } from "../../database/generated/prisma/client";
import { getDatabase } from "../../database/client/db";
import { hasRole, type Principal, readAuthorizedJob } from "../authorization/policy";
export function jobScope(principal: Principal, role: "customer" | "technician" | "admin"): Prisma.JobWhereInput {
  if (role === "admin" && hasRole(principal, "ADMIN")) return {};
  if (role === "customer" && hasRole(principal, "CUSTOMER")) return { customerId: principal.user.id };
  if (role === "technician" && hasRole(principal, "TECHNICIAN")) return { assignments: { some: { technicianId: principal.user.id, endedAt: null } } };
  return { id: "00000000-0000-0000-0000-000000000000" };
}
export async function jobDetail(principal: Principal, id: string) {
  const db = getDatabase();
  if (!await readAuthorizedJob(db, principal.user.id, id)) return null;
  const admin = hasRole(principal, "ADMIN");
  const owner = await db.job.count({ where: { id, customerId: principal.user.id } }) > 0 && hasRole(principal, "CUSTOMER");
  return db.job.findUnique({ where: { id }, include: {
    category: true, location: true,
    assignments: { where: { endedAt: null }, include: { technician: { select: { user: { select: { name: true } } } } } },
    history: { orderBy: { createdAt: "asc" }, select: { id: true, toStatus: true, createdAt: true } },
    notes: { where: admin ? {} : { visibility: "CUSTOMER" }, orderBy: { createdAt: "asc" }, select: { id: true, body: true, visibility: true, createdAt: true } },
    appointments: { orderBy: { startsAt: "desc" } },
    documents: { where: admin ? {} : owner ? { status: { not: "DRAFT" } } : { kind: "QUOTE", status: "APPROVED" }, include: { payments: admin || owner, refund: admin || owner }, orderBy: { createdAt: "desc" } },
    complaints: admin || owner,
    review: true,
    photos: { select: { id: true, createdAt: true } },
  } });
}
export const dateText = (date: Date) => new Intl.DateTimeFormat("en-ZW", { timeZone: "Africa/Harare", dateStyle: "medium", timeStyle: "short" }).format(date) + " CAT";
