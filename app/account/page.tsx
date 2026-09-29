import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/server";
import { activeSession } from "@/lib/auth/factory";
import { getDatabase } from "@/lib/database/db";
import { PageIntro } from "@/components/page-intro";
import { SignOut } from "@/components/sign-out";
export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";
export default async function AccountPage() {
  const requestHeaders = await headers();
  if (!requestHeaders.get("cookie")) redirect("/login");
  const session = await activeSession(getAuth(), getDatabase(), requestHeaders);
  if (!session) redirect("/login");
  return <main id="main-content" tabIndex={-1} className="shell page-content">
    <PageIntro eyebrow="YOUR ACCOUNT" title={`Welcome, ${session.user.name}.`}><p>Your email is verified: {session.user.email}</p></PageIntro>
    <div className="notice-panel"><h2>Your account is ready.</h2><p>Service requests and your customer dashboard are still being prepared. No booking has been created.</p></div>
    <SignOut />
  </main>;
}
