import type { Metadata } from "next";
import { AuthPage } from "@/components/auth-page";
export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Create and verify your FallsFix customer account.",
};
export default function RegisterPage() {
  return <AuthPage mode="register" title="Start with a customer account." description="We use your name and email to manage your account. Verify your email before logging in. Creating an account does not submit a service request; bookings are not open yet." />;
}
