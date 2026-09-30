import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/frontend/components/page-intro";
import { ActionForm } from "@/frontend/components/action-form";
import { services } from "@/shared/data/services";
export const metadata: Metadata = { title: "Request a service", description: "Tell FallsFix what you need help with in Victoria Falls." };
export default async function RequestPage({ searchParams }: { searchParams: Promise<{ service?: string | string[] }> }) {
  const query = await searchParams;
  const service = services.find(s => s.slug === query.service);
  return <main id="main-content" tabIndex={-1} className="shell page-content">
    <PageIntro eyebrow="LET’S GET IT SORTED" title="Request a service"><p>Tell us what needs attention. We will review coverage and availability before confirming an appointment or price.</p></PageIntro>
    <div className="two-column"><section>
      <h2>{service?.name ?? "What do you need help with?"}</h2>
      <p><Link href={`/login?next=${encodeURIComponent(`/request-service${service ? `?service=${service.slug}` : ""}`)}`} className="text-link">Log in</Link> or <Link href="/register" className="text-link">create and verify your account</Link> before submitting. You can track your request from your customer workspace.</p>
      <ActionForm action="request" title="Submit service request" redirectToJob fields={[
        { name: "category", label: "Service", value: service?.slug, options: services.map(s => ({ value: s.slug, label: s.name })) },
        { name: "description", label: "Describe the problem (at least 10 characters)", type: "textarea" },
        { name: "contactName", label: "Contact name", maxLength: 120 }, { name: "contactPhone", label: "Contact phone", type: "tel", maxLength: 32 },
        { name: "addressLine", label: "Street address / property" }, { name: "locality", label: "Suburb / locality", value: "Victoria Falls", maxLength: 120 },
        { name: "directions", label: "Directions (optional)", type: "textarea", required: false, maxLength: 1000 },
        { name: "preferredAt", label: "Preferred date and time (CAT, optional)", type: "datetime-local", required: false },
      ]} />
    </section><aside className="notice-panel"><h2>What happens next?</h2><p>You receive a request reference once it is saved. An administrator reviews your needs and arranges an eligible technician.</p><p>You approve the quoted scope and price before work starts. A preferred date is not a confirmed booking.</p><p>Add optional photos securely from the saved request. Avoid including identity documents or sensitive information.</p><Link href="/contact" className="text-link">Need help? Contact us</Link></aside></div>
  </main>;
}
