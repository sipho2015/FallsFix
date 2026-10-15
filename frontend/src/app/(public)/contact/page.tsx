import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/frontend/components/page-intro";

export const metadata: Metadata = {
  title: "Contact & support",
  description:
    "FallsFix contact availability and prelaunch service information for Victoria Falls.",
};
export default function ContactPage() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="LET’S KEEP THINGS CLEAR"
        title="A local service. A human conversation."
      >
        <p>
          Get in touch by phone or email during our operating hours. FallsFix is
          accepts online requests for review before confirming service availability.
        </p>
      </PageIntro>
      <div className="contact-grid">
        <section className="notice-panel">
          <p className="eyebrow">WHERE WE’RE STARTING</p>
          <h2>Victoria Falls, Zimbabwe</h2>
          <p>
            Exact service boundaries will be confirmed at launch. There is no
            public walk-in office listed at this stage.
          </p>
        </section>
        <section className="contact-details">
          <h2>Get in touch</h2>
          <dl>
            <div>
              <dt>Phone</dt>
              <dd>
                <a className="underline underline-offset-4" href="tel:+263789652298">
                  +263 789 652 298
                </a>
              </dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd className="break-all">
                <a className="underline underline-offset-4" href="mailto:siphomoyo893@gmail.com">
                  siphomoyo893@gmail.com
                </a>
              </dd>
            </div>
            <div>
              <dt>Monday–Friday</dt>
              <dd>08:00–17:00</dd>
            </div>
            <div>
              <dt>Saturday</dt>
              <dd>Closed</dd>
            </div>
            <div>
              <dt>Sunday</dt>
              <dd>08:00–17:00</dd>
            </div>
          </dl>
          <p>All hours are in Victoria Falls local time (CAT, UTC+2).</p>
          <p>Please use the phone or email links above. There is no online contact form yet.</p>
        </section>
      </div>
      <section className="section">
        <h2>While we get ready</h2>
        <div className="link-tiles">
          <Link href="/how-it-works">
            <h3>Questions about the service ↗</h3>
            <p>Read about the planned process and common questions.</p>
          </Link>
          <Link href="/become-a-technician">
            <h3>Interested in technician work ↗</h3>
            <p>Learn about the network and upcoming application process.</p>
          </Link>
        </div>
      </section>
    </main>
  );
}
