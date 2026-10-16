import type { NextConfig } from "next";
import path from "node:path";
import { loadEnvConfig } from "@next/env";

const repositoryRoot = path.resolve(import.meta.dirname, "..");
loadEnvConfig(repositoryRoot, process.env.NODE_ENV === "development", console, true);

const nextConfig: NextConfig = {
  turbopack: { root: repositoryRoot },
  outputFileTracingRoot: repositoryRoot,
  poweredByHeader: false,
  distDir: process.env.NEXT_BUILD_DIR ?? ".next",
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Referrer-Policy", value: "no-referrer" },
      ],
    }];
  },
};

export default nextConfig;
