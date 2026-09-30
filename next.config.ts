import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  distDir: process.env.NEXT_BUILD_DIR ?? ".next",
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
      { source: "/api/auth/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }, { key: "Cache-Control", value: "no-store" }] },
      { source: "/reset-password", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
      { source: "/jobs/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
      { source: "/portal/:path*", headers: [{ key: "Referrer-Policy", value: "no-referrer" }] },
    ];
  },
};

export default nextConfig;
