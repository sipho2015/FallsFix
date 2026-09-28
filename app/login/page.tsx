import type { Metadata } from "next";
import { AccountPreview } from "@/components/account-preview";
export const metadata: Metadata = {
  title: "Login coming soon",
  description:
    "Secure FallsFix accounts are being prepared. Login is not available yet.",
};
export default function LoginPage() {
  return <AccountPreview />;
}
