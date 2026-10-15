import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/frontend/components/page-intro";
import { ContextPhoto } from "@/frontend/components/context-photo";
export const metadata: Metadata = {
  title: "Become a technician",
  description:
    "Apply to the FallsFix technician network and learn about verification and assigned work.",
};
export default function TechnicianPage() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="BRING YOUR SKILLS CLOSER TO HOME"
        title="Good work starts with good people."
      >
        <p>
          Apply to offer your skills through FallsFix in Victoria Falls. Tell us
          what you do, where you work and the experience you bring.
        </p>
      </PageIntro>
      <div className="editorial-split">
        <ContextPhoto subject="handyman" />
        <section>
          <h2>Work with a clear plan.</h2>
          <div className="detail-list">
            <article>
              <h3>Your assignments in one place</h3>
              <p>
                Approved technicians can review assigned jobs, accept or decline
                work, and see the service details needed for current
                assignments.
              </p>
            </article>
            <article>
              <h3>Keep the customer informed</h3>
              <p>
                Record assessments, appointments, progress and private job
                photos. The customer approves the scope and any call-out price
                before dispatch.
              </p>
            </article>
            <article>
              <h3>Keep a useful work history</h3>
              <p>
                Completed assignments and service records remain organized.
                Access to private customer details ends when your assignment
                ends.
              </p>
            </article>
          </div>
        </section>
      </div>
      <section className="section" aria-labelledby="verification-title">
        <div className="two-column">
          <div>
            <p className="eyebrow">BEFORE YOU ARE APPROVED</p>
            <h2 id="verification-title">Tell us about your skills.</h2>
            <ul className="verification-list">
              <li>
                National ID or passport and a profile photo for private review.
              </li>
              <li>A verified phone number and the areas you cover.</li>
              <li>The services and skills you want to offer.</li>
              <li>
                A qualification, previous-work evidence or reference where
                available.
              </li>
            </ul>
            <p>
              The administrator arranges private verification. Do not upload
              identity documents as job photos. Approval is reviewed for each
              skill.
            </p>
          </div>
          <aside className="notice-panel">
            <h2>Ready to apply?</h2>
            <p>
              Create and verify your customer account, then open the technician
              application tab. Submit your main skill, phone number and
              experience.
            </p>
            <Link href="/portal/customer?view=application" className="button">
              Open technician application
            </Link>
            <p>
              Approval does not guarantee assignments or income. Technician
              allocation is 75% of approved labour charges only; parts,
              materials and other charges are separate. Confirm payout
              arrangements with FallsFix before accepting work.
            </p>
            <Link href="/register" className="text-link">
              Create an account
            </Link>
          </aside>
        </div>
      </section>
    </main>
  );
}
