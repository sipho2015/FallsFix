import type { Metadata } from "next";
import Link from "next/link";
import { requirePrincipal } from "@/lib/authorization/server";
import { hasRole, portalRoles, type Portal } from "@/lib/authorization/policy";
import { PageIntro } from "@/components/page-intro";
import { SignOut } from "@/components/sign-out";
export const metadata: Metadata = { title: "Your account" };
export const dynamic = "force-dynamic";
export default async function AccountPage() {
  const session = await requirePrincipal();
  return <main id="main-content" tabIndex={-1} className="shell page-content">
    <PageIntro eyebrow="YOUR ACCOUNT" title={`Welcome, ${session.user.name}.`}><p>Your email is verified: {session.user.email}</p></PageIntro>
    <div className="notice-panel"><h2>Your account is ready.</h2><p>Service requests and your customer dashboard are still being prepared. No booking has been created.</p></div>
    <nav className="auth-links" aria-label="Your workspaces">
      {(Object.keys(portalRoles) as Portal[]).filter((portal) => hasRole(session, portalRoles[portal])).map((portal) =>
        <Link key={portal} href={`/portal/${portal}`} prefetch={false}>{portal === "admin" ? "Administrator" : portal === "technician" ? "Technician" : "Customer"} workspace</Link>
      )}
    </nav>
    <SignOut />
  </main>;
}
