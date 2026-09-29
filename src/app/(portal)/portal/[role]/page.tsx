import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageIntro } from "@/frontend/components/page-intro";
import { isPortal, portalRoles } from "@/backend/authorization/policy";
import { requireRole } from "@/backend/authorization/server";

export const metadata: Metadata = { title: "Your workspace" };
export const dynamic = "force-dynamic";
const titles = { customer: "Customer workspace", technician: "Technician workspace", admin: "Administrator workspace" };

export default async function PortalPage({ params }: { params: Promise<{ role: string }> }) {
  const { role } = await params;
  if (!isPortal(role)) notFound();
  const principal = await requireRole(portalRoles[role]);
  return <main id="main-content" tabIndex={-1} className="shell page-content">
    <PageIntro eyebrow="YOUR FALLSFIX WORKSPACE" title={titles[role]}>
      <p>Welcome, {principal.user.name}.</p>
    </PageIntro>
    <div className="notice-panel"><h2>Your workspace is being prepared.</h2>
      <p>Account access is ready. Tools for managing services will be added in the next stages. Bookings are not open yet.</p>
    </div>
    <Link href="/account" className="text-link">Back to your account</Link>
  </main>;
}
