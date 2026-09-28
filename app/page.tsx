import Link from "next/link";
import { HomeIllustration } from "@/components/home-illustration";
import { ServiceCard } from "@/components/service-card";
import { Steps } from "@/components/steps";
import { services } from "@/data/services";

export default function HomePage() {
  return (
    <main id="main-content" tabIndex={-1}>
      <section className="shell hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="small-dot" /> LOCAL HELP. PROPERLY MANAGED.
          </p>
          <h1 id="hero-title">
            What do you need <em>help with?</em>
          </h1>
          <p className="hero-description">
            A leaking tap. A room to refresh. A home that needs a little care.
            We’re bringing local service help together in Victoria Falls.
          </p>
          <div className="button-row">
            <Link className="button" href="/services">
              Explore our services <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/how-it-works" className="text-link">
              How FallsFix will work <span aria-hidden="true">→</span>
            </Link>
          </div>
          <p className="hero-footnote">
            For your home, your business, and your peace of mind.
          </p>
        </div>
        <HomeIllustration />
      </section>
      <div className="principle-strip">
        <div className="shell">
          <span>Local people & skills</span>
          <span>Clear scope before work</span>
          <span>One place to follow your job</span>
        </div>
      </div>
      <section className="shell section" aria-labelledby="services-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">FROM SMALL FIXES TO FRESH STARTS</p>
            <h2 id="services-title">A helping hand for every corner.</h2>
          </div>
          <Link href="/services" className="text-link">
            All 12 planned services <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <p className="section-description">
          Explore what we’re preparing to offer. Availability will be confirmed
          when bookings open.
        </p>
        <div className="service-grid">
          {services
            .filter((service) =>
              [
                "electrical",
                "plumbing",
                "air-conditioning",
                "cleaning",
                "gardening",
                "handyman",
              ].includes(service.slug),
            )
            .map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
        </div>
      </section>
      <section className="process-section" aria-labelledby="process-title">
        <div className="shell section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">LESS CHASING. MORE CLARITY.</p>
              <h2 id="process-title">From “needs fixing” to taken care of.</h2>
            </div>
            <span className="quiet-label">Our planned process</span>
          </div>
          <Steps />
          <Link href="/how-it-works" className="text-link">
            See the whole journey <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
      <section
        className="shell section local-section"
        aria-labelledby="local-title"
      >
        <div>
          <p className="eyebrow">STARTING RIGHT HERE</p>
          <h2 id="local-title">
            Big on local.
            <br />
            Thoughtful about the details.
          </h2>
        </div>
        <div>
          <p>
            Victoria Falls is more than a destination. It’s where people live,
            work, welcome guests, and build a life. Those places deserve
            reliable care.
          </p>
          <p>
            FallsFix is being built to connect that everyday need with local
            skills—and keep everyone clear on what happens next.
          </p>
          <Link href="/about" className="text-link">
            Get to know FallsFix <span aria-hidden="true">↗</span>
          </Link>
        </div>
      </section>
      <section
        className="shell technician-callout"
        aria-labelledby="technician-title"
      >
        <div>
          <p className="eyebrow">GOOD WITH YOUR HANDS?</p>
          <h2 id="technician-title">
            Your skills belong in the neighbourhood.
          </h2>
          <p>Learn about the technician network we’re preparing to build.</p>
        </div>
        <Link href="/become-a-technician" className="button button-light">
          Become a technician <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </main>
  );
}
