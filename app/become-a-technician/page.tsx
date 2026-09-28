import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export const metadata: Metadata = {
  title: "Become a technician",
  description:
    "Learn about FallsFix’s planned technician network and future application process.",
};
export default function TechnicianPage() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="BRING YOUR SKILLS CLOSER TO HOME"
        title="Good work starts with good people."
      >
        <p>
          We’re preparing a network of local technicians and service providers
          who take pride in their craft and communicate clearly with customers.
        </p>
      </PageIntro>
      <div className="two-column">
        <section>
          <h2>Built around the work you do.</h2>
          <div className="detail-list">
            <article>
              <h3>Clear job information</h3>
              <p>
                The planned technician portal will bring assigned work, customer
                needs, and service locations together.
              </p>
            </article>
            <article>
              <h3>A coordinated process</h3>
              <p>
                FallsFix will manage assignment and quotations, while you assess
                the issue and record the work performed.
              </p>
            </article>
            <article>
              <h3>A record of your work</h3>
              <p>
                Progress notes, before-and-after photos, and job history will
                help keep each service accountable.
              </p>
            </article>
          </div>
        </section>
        <aside className="notice-panel">
          <p className="eyebrow">APPLICATIONS COMING SOON</p>
          <h2>Get ready to tell us about your skills.</h2>
          <p>
            We expect to review service experience, coverage, and relevant
            qualifications or references. Final verification requirements and
            commercial terms will be shared before applications open.
          </p>
          <p>
            Applications are not currently being collected. Joining the network
            will require approval; it will not guarantee assignments or income.
          </p>
          <Link href="/services" className="button">
            Explore planned categories ↗
          </Link>
        </aside>
      </div>
    </main>
  );
}
