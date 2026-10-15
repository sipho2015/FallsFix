import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/frontend/components/page-intro";
import { Steps } from "@/frontend/components/steps";
import { ContextPhoto } from "@/frontend/components/context-photo";
export const metadata: Metadata = {
  title: "How it works",
  description:
    "How FallsFix requests, approved quotes, service visits, invoices and support work.",
};
export default function HowItWorksPage() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="A CLEAR PATH FROM START TO FINISH"
        title="Getting help should feel simpler."
      >
        <p>
          Submit a request, agree the work and follow the job through your
          account. Every appointment depends on confirmed coverage and
          technician availability.
        </p>
      </PageIntro>
      <Steps />
      <div className="editorial-split section">
        <ContextPhoto subject="coordination" />
        <section>
          <h2>You stay part of the decision.</h2>
          <div className="detail-list">
            <article>
              <h3>Before a visit</h3>
              <p>
                FallsFix reviews the issue and proposes suitable help. Approve
                the itemized call-out charge before dispatch, including an
                agreed zero charge if waived. A preferred time is not a
                confirmed booking.
              </p>
            </article>
            <article>
              <h3>Before chargeable work</h3>
              <p>
                Review the scope and separate labour, materials and other
                charges. New quotes use USD or ZAR and are valid for 14 days
                from sending. Extra work needs a revised quote and your
                approval.
              </p>
            </article>
            <article>
              <h3>After the work</h3>
              <p>
                Confirm the outcome or raise a concern from the request. Your
                invoice, manual payment receipts and job history stay with the
                job.
              </p>
            </article>
          </div>
        </section>
      </div>
      <section className="faq-section" aria-labelledby="faq-title">
        <h2 id="faq-title">Your questions, answered.</h2>
        <details>
          <summary>Can I request a service now?</summary>
          <p>
            Yes. Register and verify your email, then submit the request.
            FallsFix confirms availability, price and appointment details before
            work is arranged.
          </p>
        </details>
        <details>
          <summary>How do payments work?</summary>
          <p>
            FallsFix records payments received by cash, EcoCash, swipe or Visa.
            Payment arrangements are confirmed with the operator. The website
            records receipts; it does not currently collect online card
            payments.
          </p>
        </details>
        <details>
          <summary>What if the repair needs attention?</summary>
          <p>
            Report the issue from your job page. The free rework period is three
            days from completion and the in-app completion notification. A
            complaint submitted within that window can be reviewed afterwards.
            Contact FallsFix promptly and retain the job reference.
          </p>
        </details>
        <details>
          <summary>
            What happens if I cancel or the repair cannot be completed?
          </summary>
          <p>
            Standard cancellation after work starts does not refund the deposit.
            If the technician cannot complete the agreed repair, FallsFix can
            review a settlement with you. Where the 65% refund policy applies,
            it uses actual non-reversed payments received, less previously
            approved non-refundable costs already paid. It is not 65% of the
            quote. Approved refunds and their actual disbursement are recorded
            separately.
          </p>
        </details>
        <details>
          <summary>Are all catalogue services available?</summary>
          <p>
            The catalogue shows request categories. Availability and coverage
            are reviewed individually; a listed category does not guarantee an
            available technician.
          </p>
        </details>
        <details>
          <summary>Is FallsFix an emergency service?</summary>
          <p>
            No. Do not use this website to request urgent emergency assistance.
          </p>
        </details>
      </section>
      <div className="button-row section">
        <Link href="/request-service" className="button">
          Request a service
        </Link>
        <Link href="/contact" className="text-link">
          Speak to FallsFix
        </Link>
      </div>
    </main>
  );
}
