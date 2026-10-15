"use client";

import Link from "next/link";
import { BrandLogo } from "./brand-logo";
import { usePathname } from "next/navigation";
import { useRef, useState } from "react";

const links = [
  { href: "/services", label: "Services" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  return (
    <>
      <div className="launch-banner">
        <span className="launch-context">Made for Victoria Falls <span aria-hidden="true">·</span> </span>Local service requests, reviewed personally.
      </div>
      <header className="site-header">
        <div className="shell header-inner">
          <Link
            href="/"
            aria-label="FallsFix home"
            className="brand"
            onClick={() => setOpen(false)}
          >
            <BrandLogo />
          </Link>
          <button
            ref={menuButton}
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="primary-navigation"
            onClick={() => setOpen(!open)}
          >
            {open ? "Close menu" : "Menu"}
          </button>
          <nav
            id="primary-navigation"
            aria-label="Main navigation"
            className={`primary-nav ${open ? "is-open" : ""}`}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                setOpen(false);
                menuButton.current?.focus();
              }
            }}
          >
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                aria-current={pathname === href ? "page" : undefined}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              href="/account"
              prefetch={false}
              className="account-link"
              onClick={() => setOpen(false)}
            >
              My account
            </Link>
            <Link
              href="/request-service"
              className="button button-small"
              onClick={() => setOpen(false)}
            >
              Request a service <span aria-hidden="true">↗</span>
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}
