import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/frontend/components/page-intro";
import { ContextPhoto } from "@/frontend/components/context-photo";
export const metadata: Metadata = {
  title: "Contact & support",
  description:
    "Contact FallsFix about a service request or an existing job in Victoria Falls.",
};
export default function ContactPage() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="LET'S KEEP THINGS CLEAR"
        title="A local service. A human conversation."
      >
        <p>
          Need a service, an update or help with an existing job? Contact
          FallsFix or use your workspace to keep the details with your request.
        </p>
      </PageIntro>
      <div className="editorial-split">
        <ContextPhoto subject="coordination" />
        <section className="contact-details">
          <h2>Get in touch</h2>
          <dl>
            <div>
              <dt>Phone</dt>
              <dd>
                <a href="tel:+263789652298">+263 789 652 298</a>
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd className="break-all">
                <a href="mailto:siphomoyo893@gmail.com">
                  siphomoyo893@gmail.com
                </a>
              </dd>
            </div>
            <div>
              <dt>Monday&ndash;Friday</dt>
              <dd>08:00&ndash;17:00</dd>
            </div>
            <div>
              <dt>Saturday</dt>
              <dd>Closed</dd>
            </div>
            <div>
              <dt>Sunday</dt>
              <dd>08:00&ndash;17:00</dd>
            </div>
          </dl>
          <p>
            Victoria Falls local time (CAT, UTC+2). Contact is handled by the
            operator; these hours do not guarantee an immediate reply.
          </p>
          <p>
            Service area: Victoria Falls and its suburbs. Confirm an appointment
            before travelling; no public walk-in office is listed.
          </p>
        </section>
      </div>
      <section className="section" aria-labelledby="support-title">
        <h2 id="support-title">Start in the right place.</h2>
        <div className="link-tiles">
          <Link href="/request-service">
            <h3>A new service request</h3>
            <p>
              Describe the issue, your location and preferred time for
              availability review.
            </p>
          </Link>
          <Link href="/portal/customer?view=requests">
            <h3>An existing job or concern</h3>
            <p>
              Open your request to check updates, contact support or record a
              complaint against the job.
            </p>
          </Link>
          <Link href="/portal/customer?view=application">
            <h3>Apply as a technician</h3>
            <p>
              Submit your skills and experience from your verified customer
              account.
            </p>
          </Link>
          <Link href="/how-it-works">
            <h3>Quotes, payments and rework</h3>
            <p>
              Understand approvals, receipts and what to do if the work needs
              attention.
            </p>
          </Link>
        </div>
      </section>
    </main>
  );
}
