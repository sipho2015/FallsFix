import Link from "next/link";
import { BrandLogo } from "./brand-logo";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <Link href="/" className="brand" aria-label="FallsFix home">
            <BrandLogo />
          </Link>
          <p>
            Local care for the
            <br />
            places that matter.
          </p>
          <span className="footer-location">Victoria Falls, Zimbabwe</span>
        </div>
        <nav aria-label="Explore">
          <h2>Explore</h2>
          <Link href="/services">Our services</Link>
          <Link href="/how-it-works">How it works</Link>
          <Link href="/about">About FallsFix</Link>
        </nav>
        <nav aria-label="Get involved">
          <h2>Get involved</h2>
          <Link href="/become-a-technician">Become a technician</Link>
          <Link href="/contact">Contact & support</Link>
          <Link href="/register">Create an account</Link>
          <Link href="/privacy">Your information</Link>
        </nav>
        <div>
          <h2>A local beginning</h2>
          <p>
            Serving homes and businesses in Victoria Falls.
            Submit a request for availability and scope review.
          </p>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>FallsFix · Built around your community.</span>
        <Link href="/photo-credits">Photo credits</Link>
      </div>
    </footer>
  );
}
