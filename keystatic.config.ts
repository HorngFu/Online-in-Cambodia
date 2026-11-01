import { collection, config, fields } from "@keystatic/core";

// GitHub mode switches on once the GitHub App exists (Phase 5), signalled by
// its slug env var. Until then Keystatic runs in local mode, which only works
// with `npm run dev` because it edits files on disk.
export const isGitHubMode = Boolean(
  process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
);

export default config({
  storage: isGitHubMode
    ? { kind: "github", repo: "HorngFu/Online-in-Cambodia" }
    : { kind: "local" },
  ui: {
    brand: { name: "Online in Cambodia" },
  },
  collections: {
    // Minimal placeholder; the full listing model is built in Phase 2.
    listings: collection({
      label: "Listings",
      slugField: "name",
      path: "content/listings/*",
      format: "yaml",
      schema: {
        name: fields.slug({ name: { label: "Name (English)" } }),
        nameKm: fields.text({ label: "Name (Khmer)" }),
      },
    }),
  },
});
