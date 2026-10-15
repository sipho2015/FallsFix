import type { Metadata } from "next";
import { AuthPage } from "@/frontend/components/auth-page";
export const metadata: Metadata = { title: "Forgot password" };
export default function ForgotPasswordPage() {
  return <AuthPage mode="forgot" title="Reset your password." description="Enter your account email and we will send a reset link if an account exists." />;
}
