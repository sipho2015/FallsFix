import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/frontend/components/page-intro";

export const metadata: Metadata = {
  title: "Your information",
  description:
    "How FallsFix uses account details, job records and private photos.",
};

export default function PrivacyPage() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="YOUR INFORMATION"
        title="Keep service details in the right hands."
      >
        <p>
          This page explains the information used by the current FallsFix
          application and how to contact the operator about it.
        </p>
      </PageIntro>
      <div className="detail-list privacy-copy">
        <section>
          <h2>Accounts and sign-in</h2>
          <p>
            FallsFix stores your name, email, contact details and account
            records. Passwords are hashed. Session cookies keep you signed in;
            verification and password-recovery messages are sent to your email
            address. Sign out when using a shared device.
          </p>
        </section>
        <section>
          <h2>Service requests</h2>
          <p>
            Your request can contain an address, directions, contact details,
            problem description, appointments, private photos, messages and
            service history. These details support the requested work. Keep
            unrelated personal information out of descriptions and photos.
          </p>
        </section>
        <section>
          <h2>Who can see job details?</h2>
          <p>
            Access is checked against account roles, ownership and current
            assignment. You can view your jobs. Administrators coordinate them.
            Verified technicians see the details needed for their current
            assignments; access ends when the assignment ends. Private job-photo
            URLs require authorized access.
          </p>
        </section>
        <section>
          <h2>Payments and verification</h2>
          <p>
            The website records invoices, manual receipts, reversals and
            refunds. It does not collect card numbers or act as an online
            payment gateway. Technician identity and competence review is
            arranged privately by the administrator; do not upload identity
            documents as job evidence.
          </p>
        </section>
        <section>
          <h2>Retention and removal requests</h2>
          <p>
            Job photos are protected through the three-day rework window and
            while a complaint, unpaid refund, rework or retention hold remains
            active. Eligible-photo cleanup is an operator task; eligibility does
            not mean a file has already been deleted. Financial, account and
            audit records are separate from photo cleanup. Backups can retain
            recovery copies and require their own retention review.
          </p>
          <p>
            Contact FallsFix to request a correction or removal. The operator
            must review the records, any unresolved service obligations and
            recovery copies before confirming what can be removed.
          </p>
        </section>
        <section>
          <h2>Contact the operator</h2>
          <p>
            Email{" "}
            <a href="mailto:siphomoyo893@gmail.com" className="text-link">
              siphomoyo893@gmail.com
            </a>
            . Include your job reference where relevant; never send passwords or
            payment-card details.
          </p>
          <Link href="/contact" className="button">
            Contact & support
          </Link>
        </section>
      </div>
    </main>
  );
}
