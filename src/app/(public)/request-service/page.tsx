import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/frontend/components/page-intro";
import { services } from "@/shared/data/services";

export const metadata: Metadata = {
  title: "Request a service",
  description:
    "Service requests will open when FallsFix launches. Learn what to prepare for a future request.",
};
export default async function RequestServicePage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const selected = (await searchParams).service;
  const service =
    typeof selected === "string"
      ? services.find((item) => item.slug === selected)
      : undefined;
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="WE’RE GETTING READY"
        title="Your next fix starts here. Soon."
      >
        <p>
          Service requests are not open yet. We’re preparing the people and
          process behind FallsFix before accepting bookings.
        </p>
      </PageIntro>
      <div className="two-column">
        <section className="notice-panel">
          <p className="eyebrow">BOOKING AVAILABILITY</p>
          <h2>{service ? service.name : "Requests coming soon"}</h2>
          <p>
            {service
              ? service.description
              : "Browse the services we’re preparing to coordinate in Victoria Falls."}
          </p>
          <p>
            No request has been submitted or saved. Selecting a category is a
            preview, not a booking or confirmation of availability.
          </p>
          <Link className="button" href="/services">
            Explore other services ↗
          </Link>
        </section>
        <section>
          <h2>When requests open, have these handy.</h2>
          <ul className="check-list">
            <li>A short description of the problem</li>
            <li>Your service location in Victoria Falls</li>
            <li>A preferred date and time</li>
            <li>Photos that help explain the issue, if useful</li>
          </ul>
          <p>
            Your preferred time will be confirmed after review. You’ll agree on
            the scope and any charges before chargeable work begins.
          </p>
          <Link href="/how-it-works" className="text-link">
            Understand the process →
          </Link>
        </section>
      </div>
    </main>
  );
}
