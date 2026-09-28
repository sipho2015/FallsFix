import Link from "next/link";
import { PageIntro } from "@/components/page-intro";

export function AccountPreview({ register = false }: { register?: boolean }) {
  return (
    <main id="main-content" tabIndex={-1} className="shell page-content">
      <PageIntro
        eyebrow="YOUR FALLSFIX ACCOUNT"
        title={
          register
            ? "Your home for getting help."
            : "A place to keep it all together."
        }
      >
        <p>
          {register
            ? "Customer registration will open when secure accounts and service requests are ready."
            : "Login is not available yet. Customer and technician accounts will become available as FallsFix prepares to launch."}
        </p>
      </PageIntro>
      <section className="notice-panel narrow-panel">
        <h2>Accounts coming soon</h2>
        <p>
          We’re preparing a secure way to manage requests, follow work, and find
          your quotes and invoices. This page does not collect passwords or
          create an account.
        </p>
        <div className="button-row">
          <Link className="button" href="/services">
            Explore services ↗
          </Link>
          <Link className="text-link" href="/become-a-technician">
            For technicians →
          </Link>
        </div>
      </section>
    </main>
  );
}
