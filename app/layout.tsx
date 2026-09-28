import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "FallsFix | Coming soon", template: "%s | FallsFix" },
  description: "Local property maintenance and service coordination for Victoria Falls. FallsFix is preparing to launch.",
  // The foundation is not a launched service; revisit indexing with the public site.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col antialiased">
        <a href="#main-content" className="sr-only z-50 rounded bg-white px-4 py-3 focus:not-sr-only focus:absolute focus:left-4 focus:top-4">
          Skip to content
        </a>
        <header className="border-b border-ink/15">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 sm:px-10">
            <Link href="/" aria-label="FallsFix home" className="text-2xl font-bold tracking-tight">FallsFix<span className="text-[#678a32]">.</span></Link>
            <span className="text-sm text-muted">Victoria Falls, Zimbabwe</span>
          </div>
        </header>
        {children}
        <footer className="border-t border-ink/15">
          <div className="mx-auto max-w-6xl px-6 py-6 text-sm text-muted sm:px-10">FallsFix · Local care for the places that matter.</div>
        </footer>
      </body>
    </html>
  );
}
