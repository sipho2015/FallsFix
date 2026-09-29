import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/frontend/components/page-intro";

export const metadata: Metadata = {
  title: "About us",
  description:
    "Why FallsFix is building a local property-maintenance and service-management business for Victoria Falls.",
};
export default function AboutPage() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="LOCAL ROOTS. PRACTICAL HELP."
        title="For the places we call our own."
      >
        <p>
          FallsFix is a property-maintenance and service-management business
          being built for Victoria Falls, Zimbabwe.
        </p>
      </PageIntro>
      <div className="two-column story-panel">
        <div>
          <span className="eyebrow">THE IDEA BEHIND FALLSFIX</span>
          <h2>Finding a technician is only the beginning.</h2>
        </div>
        <div>
          <p>
            Arranging a repair often means more than finding a phone number.
            Someone needs to understand the problem, agree on a price,
            coordinate a visit, and make sure the outcome is clear.
          </p>
          <p>
            We’re building FallsFix to bring those steps together. Customers
            will request help, administrators will coordinate suitable
            technicians, and everyone will have a shared record of the job.
          </p>
          <p>
            We’re starting with Victoria Falls and individual service requests.
            Our first priority is making that everyday process dependable.
          </p>
        </div>
      </div>
      <section className="section" aria-labelledby="principles-title">
        <p className="eyebrow">WHAT WE’RE BUILDING TOWARDS</p>
        <h2 id="principles-title">Care that goes beyond the repair.</h2>
        <div className="values-grid">
          <article>
            <span>01 / COMMUNITY</span>
            <h3>Local skills, local needs</h3>
            <p>
              A network designed around the homes, lodges, shops, and workplaces
              of Victoria Falls.
            </p>
          </article>
          <article>
            <span>02 / CLARITY</span>
            <h3>No guessing what comes next</h3>
            <p>
              Agreed scope, visible job progress, and records that keep the
              details together.
            </p>
          </article>
          <article>
            <span>03 / ACCOUNTABILITY</span>
            <h3>A managed service journey</h3>
            <p>
              Technician verification, coordinated assignments, and a way to
              raise concerns are part of the planned service.
            </p>
          </article>
        </div>
      </section>
      <div className="inline-note">
        FallsFix is preparing to launch. We’re not yet accepting bookings or
        claiming an active verified technician network.{" "}
        <Link href="/how-it-works">Explore the planned process →</Link>
      </div>
    </main>
  );
}
