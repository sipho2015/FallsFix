import { z } from "zod";

const email = z.string().trim().toLowerCase().max(254).email("Enter a valid email address.");
const password = z.string().min(12, "Use at least 12 characters.").max(128, "Use no more than 128 characters.");
export const authSchemas = {
  register: z.object({ name: z.string().trim().min(2, "Enter your name.").max(120), email, password }).strict(),
  login: z.object({ email, password: z.string().min(1, "Enter your password.").max(128) }).strict(),
  forgot: z.object({ email }).strict(),
  resend: z.object({ email }).strict(),
  reset: z.object({ token: z.string().min(1).max(2048), newPassword: password }).strict(),
  logout: z.object({}).strict(),
};
export type AuthMode = Exclude<keyof typeof authSchemas, "logout">;
export const authPaths = {
  register: "sign-up/email", login: "sign-in/email", forgot: "request-password-reset",
  resend: "send-verification-email", reset: "reset-password", logout: "sign-out",
} as const;
