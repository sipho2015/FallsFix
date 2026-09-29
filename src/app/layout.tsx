import type { Metadata } from "next";
import { SiteHeader } from "@/frontend/components/site-header";
import { SiteFooter } from "@/frontend/components/site-footer";
import "@/frontend/styles/globals.css";

export const metadata: Metadata = {
  title: {
    default: "FallsFix | Local help. Properly managed.",
    template: "%s | FallsFix",
  },
  description:
    "Local property maintenance and service coordination for Victoria Falls. FallsFix is preparing to launch.",
  // Keep prelaunch pages unindexed until operational details are approved.
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col antialiased">
        <a
          href="#main-content"
          className="sr-only z-50 rounded bg-white px-4 py-3 focus:not-sr-only focus:absolute focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
