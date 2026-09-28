import type { Metadata } from "next";
import { AccountPreview } from "@/components/account-preview";
export const metadata: Metadata = {
  title: "Registration coming soon",
  description:
    "Customer registration will open when accounts and service requests are ready.",
};
export default function RegisterPage() {
  return <AccountPreview register />;
}
