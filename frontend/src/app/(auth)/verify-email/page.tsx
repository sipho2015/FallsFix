import type { Metadata } from "next";
import { AuthPage } from "@/frontend/components/auth-page";
export const metadata: Metadata = { title: "Verify your email" };
export default function VerifyEmailPage() {
  return <AuthPage mode="resend" title="Check your email." description="Need another verification link? Enter your account email below. Links expire after one hour." />;
}
