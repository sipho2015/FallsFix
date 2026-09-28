import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

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
          Our support channels are being prepared alongside the service.
          Verified contact details and operating hours will be published before
          bookings open.
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
          <h2>Contact availability</h2>
          <dl>
            <div>
              <dt>Phone & WhatsApp</dt>
              <dd>Coming soon</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>Coming soon</dd>
            </div>
            <div>
              <dt>Operating hours</dt>
              <dd>To be confirmed</dd>
            </div>
          </dl>
          <p>We’re not collecting messages through this website yet.</p>
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
