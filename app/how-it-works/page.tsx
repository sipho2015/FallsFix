import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";
import { Steps } from "@/components/steps";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "The planned FallsFix journey from a request and quotation to completed work and an invoice.",
};
export default function HowItWorksPage() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="A CLEAR PATH FROM START TO FINISH"
        title="Getting help should feel simpler."
      >
        <p>
          We’re designing FallsFix around a managed process, with clear next
          steps for you and the technician. Here’s how it will work when
          bookings open.
        </p>
      </PageIntro>
      <Steps />
      <div className="two-column section">
        <section>
          <h2>Know what happens next.</h2>
          <div className="detail-list">
            <article>
              <h3>We review your request</h3>
              <p>
                FallsFix will check the location, scope, and technician
                availability before confirming an assignment. Your preferred
                time is a request, not a confirmed appointment.
              </p>
            </article>
            <article>
              <h3>You agree to the work</h3>
              <p>
                Assessment may be needed first. Any call-out charge will be
                disclosed in advance, and chargeable work will require an agreed
                quotation or fixed-price scope.
              </p>
            </article>
            <article>
              <h3>You confirm the outcome</h3>
              <p>
                After the technician records completion, you’ll confirm the work
                or raise a concern. Invoicing and payment recording follow, with
                an optional review.
              </p>
            </article>
          </div>
        </section>
        <section className="faq-section">
          <h2>A few things to know</h2>
          <details>
            <summary>Can I book a service now?</summary>
            <p>
              Not yet. This is the prelaunch website. Requests and technician
              applications will open after the service operation is ready.
            </p>
          </details>
          <details>
            <summary>Will prices be listed online?</summary>
            <p>
              Pricing has not been published. The scope and price must be agreed
              before chargeable work begins.
            </p>
          </details>
          <details>
            <summary>What if the job needs more work?</summary>
            <p>
              The planned process requires a revised scope and your approval
              before additional chargeable work begins.
            </p>
          </details>
          <details>
            <summary>Is FallsFix an emergency service?</summary>
            <p>
              No emergency-response service is offered. Do not use this website
              to request urgent emergency assistance.
            </p>
          </details>
          <Link href="/services" className="text-link">
            Explore planned services →
          </Link>
        </section>
      </div>
    </main>
  );
}
