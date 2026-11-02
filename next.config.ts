import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { defaultLocale } from "./src/i18n/config";

const nextConfig: NextConfig = {
  experimental: {
    // Bilingual 404 for URLs outside /en and /km (we have no single root layout).
    globalNotFound: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  // Static redirect instead of a proxy, so the root URL costs no Worker CPU.
  async redirects() {
    return [
      { source: "/", destination: `/${defaultLocale}`, permanent: false },
    ];
  },
};

export default nextConfig;

// Makes Cloudflare bindings available to `next dev`.
initOpenNextCloudflareForDev();
