import type { Metadata } from "next";
import { AuthPage } from "@/frontend/components/auth-page";
export const metadata: Metadata = {
  title: "Log in",
  description:
    "Log in to your verified FallsFix customer account.",
};
export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const notice = query.error ? "This verification link is invalid or expired. Request another verification email below." : query.verified === "1" ? "Your email has been verified. You can now log in." : query.reset === "1" ? "Your password has been changed. Log in with your new password." : undefined;
  return <AuthPage mode="login" title="Welcome back." description="Log in with your verified email address. Service bookings are still being prepared." notice={notice} />;
}
