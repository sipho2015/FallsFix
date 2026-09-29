import type { Metadata } from "next";
import { PageIntro } from "@/frontend/components/page-intro";
import { ServiceCatalogue } from "@/frontend/components/service-catalogue";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore FallsFix’s planned repair, home care, and technology services in Victoria Falls.",
};
export default function ServicesPage() {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="A PLACE FOR EVERYDAY HELP"
        title="What needs taking care of?"
      >
        <p>
          From a small repair to a property refresh, explore our planned
          services. Bookings are not open yet; this catalogue does not guarantee
          availability.
        </p>
      </PageIntro>
      <ServiceCatalogue />
      <aside className="inline-note">
        Not sure which category fits? Once requests open, describe the problem
        and FallsFix will help identify the right kind of support.
      </aside>
    </main>
  );
}
