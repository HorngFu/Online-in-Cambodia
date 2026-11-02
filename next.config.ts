import type { NextConfig } from "next";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import { defaultLocale } from "./src/i18n/config";

// The Keystatic GitHub App slug is public (it's in the app's URL), so
// production builds default to this project's app and online editing doesn't
// depend on a dashboard build variable. Set the env var to override it (e.g. in
// a fork). Dev stays in local mode unless .env sets it.
const keystaticAppSlug =
  process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG ||
  (process.env.NODE_ENV === "production" ? "online-in-cambodia-keystatic" : "");

const nextConfig: NextConfig = {
  env: { NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG: keystaticAppSlug },
  // Keystatic's GitHub sign-in redirects local dev from localhost to 127.0.0.1.
  allowedDevOrigins: ["127.0.0.1"],
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
