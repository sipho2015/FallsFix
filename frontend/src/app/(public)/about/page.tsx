import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/frontend/components/page-intro";
import { ContextPhoto } from "@/frontend/components/context-photo";
export const metadata: Metadata = {
  title: "About us",
  description:
    "Local service coordination for homes and businesses in Victoria Falls.",
};
export default function AboutPage() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="LOCAL ROOTS. PRACTICAL HELP."
        title="For the places we call our own."
      >
        <p>
          FallsFix brings service requests, local technician coordination and
          job records together for Victoria Falls, Zimbabwe.
        </p>
      </PageIntro>
      <div className="editorial-split">
        <ContextPhoto subject="carpentry" />
        <section>
          <p className="eyebrow">MORE THAN A PHONE NUMBER</p>
          <h2>Good service needs a clear next step.</h2>
          <p>
            Explain the problem once. Follow your request, review the proposed
            scope and price, and keep your appointments, photos and invoices in
            one place.
          </p>
          <p>
            FallsFix reviews requests and coordinates eligible technicians.
            Coverage and availability are confirmed for each job before an
            appointment is agreed.
          </p>
          <Link href="/request-service" className="button">
            Tell us what needs attention
          </Link>
        </section>
      </div>
      <section className="section" aria-labelledby="principles-title">
        <p className="eyebrow">HOW WE WORK</p>
        <h2 id="principles-title">Care beyond the repair.</h2>
        <div className="values-grid">
          <article>
            <span>01 / LOCAL</span>
            <h3>Built around Victoria Falls</h3>
            <p>
              Homes, lodges, shops and workplaces across the city and its
              suburbs can submit requests for review.
            </p>
          </article>
          <article>
            <span>02 / CLEAR</span>
            <h3>Agree before work starts</h3>
            <p>
              Review the call-out charge, job scope and quotation before
              dispatch or chargeable work. Changes need a fresh agreement.
            </p>
          </article>
          <article>
            <span>03 / ACCOUNTABLE</span>
            <h3>A record you can return to</h3>
            <p>
              Technician verification, job history, private evidence, invoices
              and a complaint process support each service journey.
            </p>
          </article>
        </div>
      </section>
      <div className="inline-note">
        Submitting a request does not confirm a technician or appointment.{" "}
        <Link href="/how-it-works">See how requests work</Link>.
      </div>
    </main>
  );
}
