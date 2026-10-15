import type { Prisma, Role } from "../../database/generated/prisma/client";

type PolicyDatabase = Pick<Prisma.TransactionClient, "user" | "job">;

// Call only with identity obtained from a validated session, never a request body.
export async function loadPrincipal(database: PolicyDatabase, userId: string) {
  const user = await database.user.findUnique({
    where: { id: userId },
    select: {
      id: true, name: true, email: true, status: true, emailVerified: true,
      roles: { select: { role: true } },
      customerProfile: { select: { userId: true } },
      technicianProfile: { select: { isActive: true, verificationStatus: true } },
    },
  });
  if (!user || user.status !== "ACTIVE" || !user.emailVerified) return null;
  return {
    user: { id: user.id, name: user.name, email: user.email },
    roles: user.roles.map(({ role }) => role),
    customer: !!user.customerProfile,
    technician: user.technicianProfile?.isActive === true && user.technicianProfile.verificationStatus === "VERIFIED",
  };
}

export type Principal = NonNullable<Awaited<ReturnType<typeof loadPrincipal>>>;

export function hasRole(principal: Principal, role: Role) {
  if (!principal.roles.includes(role)) return false;
  if (role === "CUSTOMER") return principal.customer;
  if (role === "TECHNICIAN") return principal.technician;
  return role === "ADMIN";
}

// Read permission is not permission to mutate jobs, access internal notes or files.
// Reload current membership each time; use the transaction client for future writes.
export async function readAuthorizedJob(database: PolicyDatabase, userId: string, jobId: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(jobId)) return null;
  const principal = await loadPrincipal(database, userId);
  if (!principal) return null;
  const scopes: Prisma.JobWhereInput[] = [];
  const administrator = hasRole(principal, "ADMIN");
  if (hasRole(principal, "CUSTOMER")) scopes.push({ customerId: userId });
  if (hasRole(principal, "TECHNICIAN")) scopes.push({
    assignments: { some: { technicianId: userId, endedAt: null, status: { in: ["PENDING", "ACCEPTED"] } } },
  });
  if (!administrator && !scopes.length) return null;
  return database.job.findFirst({
    where: administrator ? { id: jobId } : { id: jobId, OR: scopes },
    // Explicit projection prevents accidental disclosure of location/contact/internal data.
    select: { id: true, reference: true, description: true, status: true, createdAt: true },
  });
}

export const portalRoles = { customer: "CUSTOMER", technician: "TECHNICIAN", admin: "ADMIN" } as const;
export type Portal = keyof typeof portalRoles;
export function isPortal(value: string): value is Portal {
  return Object.hasOwn(portalRoles, value);
}
