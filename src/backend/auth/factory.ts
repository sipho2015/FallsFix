import { randomUUID } from "node:crypto";
import { betterAuth } from "better-auth/minimal";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError } from "better-auth/api";
import type { PrismaClient } from "../../../generated/prisma/client";
import type { AuthConfig } from "./config";

export type AuthMail = { to: string; subject: string; text: string };
export function createAuth(database: PrismaClient, config: AuthConfig, deliver: (mail: AuthMail) => Promise<void>) {
  return betterAuth({
    appName: "FallsFix",
    baseURL: config.origin,
    secret: config.secret,
    trustedOrigins: [config.origin],
    database: prismaAdapter(database, { provider: "postgresql", transaction: true }),
    logger: { disabled: true },
    advanced: {
      database: { generateId: () => randomUUID() },
      useSecureCookies: config.origin.startsWith("https:"),
      ipAddress: { ipAddressHeaders: ["x-fallsfix-client-ip"] },
    },
    session: { expiresIn: 60 * 60 * 24 * 7, updateAge: 60 * 60 * 24, cookieCache: { enabled: false } },
    emailAndPassword: {
      enabled: true, autoSignIn: false, requireEmailVerification: true,
      minPasswordLength: 12, maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true, resetPasswordTokenExpiresIn: 3600,
      sendResetPassword: async ({ user, url }) => deliver({
        to: user.email, subject: "Reset your FallsFix password",
        text: `Use this link within one hour to reset your password:\n${url}\n\nIf you did not request this, ignore this email.`,
      }),
    },
    emailVerification: {
      sendOnSignUp: true, sendOnSignIn: false, autoSignInAfterVerification: false, expiresIn: 3600,
      sendVerificationEmail: async ({ user, url }) => deliver({
        to: user.email, subject: "Verify your FallsFix email",
        text: `Use this link within one hour to verify your email:\n${url}\n\nIf you did not register, ignore this email.`,
      }),
    },
    rateLimit: {
      enabled: true, storage: "database", window: 60, max: 60,
      customRules: {
        "/sign-in/email": { window: 60, max: 5 },
        "/sign-up/email": { window: 60, max: 3 },
        "/request-password-reset": { window: 60, max: 3 },
        "/send-verification-email": { window: 60, max: 3 },
        "/reset-password": { window: 60, max: 5 },
      },
    },
    databaseHooks: {
      session: { create: { before: async (session) => {
        const user = await database.user.findUnique({ where: { id: session.userId } });
        if (!user || user.status !== "ACTIVE" || !user.emailVerified)
          throw new APIError("FORBIDDEN", { message: "Unable to sign in." });
        return { data: session };
      } } },
    },
  });
}
export type FallsFixAuth = ReturnType<typeof createAuth>;

export async function activeSession(auth: FallsFixAuth, database: PrismaClient, headers: Headers) {
  const session = await auth.api.getSession({ headers });
  if (!session) return null;
  const user = await database.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.status !== "ACTIVE" || !user.emailVerified) {
    await database.session.deleteMany({ where: { userId: session.user.id } });
    return null;
  }
  return { user: { id: user.id, name: user.name, email: user.email }, expiresAt: session.session.expiresAt };
}
