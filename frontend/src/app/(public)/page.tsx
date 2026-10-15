import Link from "next/link";
import Image from "next/image";
import { ServiceCard } from "@/frontend/components/service-card";
import { ContextPhoto } from "@/frontend/components/context-photo";
import { photoFor } from "@/shared/data/photography";
import { Steps } from "@/frontend/components/steps";
import { services } from "@/shared/data/services";

const featured = [
  "it-support",
  "plumbing",
  "electrical",
  "cleaning",
  "appliance-repair",
  "handyman",
];

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1} className="public-home">
      <section className="shell home-hero" aria-labelledby="hero-title">
        <div className="home-hero-copy">
          <p className="home-location">LOCAL TO VICTORIA FALLS</p>
          <h1 id="hero-title">
            Less hassle.
            <br />
            More <span>sorted.</span>
          </h1>
          <p className="home-lead">
            A computer that won&apos;t start. A repair you&apos;ve put off. Tell
            us what needs attention. We&apos;ll help you find the next step.
          </p>
          <div className="home-hero-actions">
            <Link href="/request-service" className="button">
              What do you need help with?{" "}
              <span aria-hidden="true">&nearr;</span>
            </Link>
            <Link href="/services" className="text-link">
              Explore services <span aria-hidden="true">&nearr;</span>
            </Link>
          </div>
          <div className="home-assurance">
            <span>Clear quotes</span>
            <span>Local coordination</span>
            <span>Job updates</span>
          </div>
        </div>
        <div className="home-feature">
          <div className="home-feature-heading">
            <span>EVERYDAY PROBLEMS. LOCAL HELP.</span>
          </div>
          <div className="home-feature-art">
            <Image
              src={photoFor("it-support").src}
              alt={photoFor("it-support").alt}
              width={720}
              height={480}
              sizes="(max-width: 700px) 90vw, 45vw"
              preload
            />
          </div>
          <div className="home-feature-bottom">
            <div>
              <span className="home-feature-label">START WITH A REQUEST</span>
              <h2>
                Get your tech
                <br />
                back on track.
              </h2>
            </div>
            <Link
              href="/request-service?service=it-support"
              aria-label="Request computer and IT support"
            >
              &nearr;
            </Link>
          </div>
          <p className="home-feature-note">
            Computer & IT support &middot; Victoria Falls
          </p>
        </div>
      </section>
      <section className="shell home-services" aria-labelledby="services-title">
        <div className="home-section-heading">
          <div>
            <p className="eyebrow">A LITTLE HELP GOES A LONG WAY</p>
            <h2 id="services-title">What needs a fix?</h2>
          </div>
          <Link href="/services" className="text-link">
            All services <span aria-hidden="true">&nearr;</span>
          </Link>
        </div>
        <p className="home-section-copy">
          Find your category. We review every request and confirm coverage
          before arranging a visit.
        </p>
        <div className="service-grid">
          {featured
            .map((slug) => services.find((service) => service.slug === slug))
            .filter((service) => service !== undefined)
            .map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
        </div>
      </section>
      <section className="home-process" aria-labelledby="process-title">
        <div className="shell">
          <div className="home-section-heading">
            <div>
              <p className="eyebrow">YOU ASK. WE COORDINATE.</p>
              <h2 id="process-title">
                A clear next step.
                <br />
                At every step.
              </h2>
            </div>
            <p>
              From the first request to the final invoice,
              <br />
              keep it all in one place.
            </p>
          </div>
          <Steps />
          <Link href="/how-it-works" className="text-link">
            How it works <span aria-hidden="true">&nearr;</span>
          </Link>
        </div>
      </section>
      <section className="shell home-local" aria-labelledby="local-title">
        <ContextPhoto subject="carpentry" className="home-local-photo" />
        <div>
          <p className="eyebrow">FOR THE PLACE WE CALL HOME</p>
          <h2 id="local-title">
            Made for life
            <br />
            in Victoria Falls.
          </h2>
          <p>
            Homes, small businesses and the people who keep them going. FallsFix
            brings local service requests, quotes and progress together.
          </p>
          <Link href="/about" className="text-link">
            Meet FallsFix <span aria-hidden="true">&nearr;</span>
          </Link>
        </div>
      </section>
      <section className="shell home-join" aria-labelledby="technician-title">
        <div>
          <p className="eyebrow">BRING YOUR SKILLS</p>
          <h2 id="technician-title">
            Good at fixing things?
            <br />
            Let&apos;s talk.
          </h2>
          <p>Apply to join the FallsFix technician network.</p>
        </div>
        <Link href="/become-a-technician" className="button">
          Become a technician <span aria-hidden="true">&nearr;</span>
        </Link>
      </section>
    </main>
  );
}
