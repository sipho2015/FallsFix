import type { Metadata } from "next";
import { AuthPage } from "@/frontend/components/auth-page";
export const metadata: Metadata = { title: "Choose a new password", referrer: "no-referrer" };
export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const token = typeof query.token === "string" && query.token.length <= 2048 ? query.token : "";
  return <AuthPage mode="reset" title="Choose a new password." description="Changing your password signs you out of all existing sessions." token={token} notice={!token || query.error ? "This reset link is missing or invalid. Request a new reset link below." : undefined} />;
}
