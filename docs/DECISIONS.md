# Decisions

This file records the project decisions from [DEVELOPMENT_PHASES.md — Section 2](DEVELOPMENT_PHASES.md#2-decisions-to-confirm). To change a decision, open a pull request that updates the entry and adds a row to the changelog at the bottom.

**Decided:** 2026-11-01 (all recommended defaults accepted)

| # | Topic | Decision | Consequence |
| --- | --- | --- | --- |
| D1 | Project name | **Online in Cambodia** (working name) | Can be renamed before launch (Phase 10). |
| D2 | Languages | **English + Khmer from day one** | i18n (`/en` and `/km` routes, JSON dictionaries, Khmer font) is set up in Phases 1–3 rather than as a separate Phase 6. Phase 6 becomes "finish and review translations". |
| D3 | Code license | **MIT** | See [`LICENSE`](../LICENSE). |
| D4 | Data license | **CC BY-SA 4.0** | Everything in `content/` and `public/logos/` metadata. See [`DATA_LICENSE.md`](../DATA_LICENSE.md). Third-party logos stay the property of their owners. |
| D5 | Who edits | **Small trusted editor team via GitHub; the public sends suggestions** | Editors get write access and work through branches and pull requests. Everyone else uses issue forms (and later the website form). |
| D6 | Rendering / hosting | **Next.js on Cloudflare Workers via OpenNext, pages pre-rendered at build** | Confirmed in Phase 1: 5.8 MiB Worker (limit 64 MiB), pre-rendered pages served from the read-only static assets cache (no R2). The fallback remains a static export with Keystatic in local mode. |
| D7 | Search | **Client-side index built at build time** | Built in Phase 4: 1.5 KB gzipped for 28 listings (~53 bytes each). Revisit at about 5,000 listings or when the index is larger than about 1 MB gzipped. |
| D8 | Domain | **Free `*.workers.dev` subdomain until launch** | Buy the domain in Phase 10. |
| D9 | Logos | **Small pre-optimized WebP files (≤ 50 KB) in the repo** | Move to Cloudflare R2 if the repo grows past about 300 MB. |
| D10 | Platforms | **26 platforms, see DEVELOPMENT_PHASES.md Section 4.2** | Seeded in Phase 2. Payments simplified to KHQR + cards; foodpanda added to delivery. Add more any time in the editor (Settings → Platforms). |
| D11 | Business owners claiming listings | **Not in MVP** | Planned as Phase 11e. |
| D12 | Analytics | **Cloudflare Web Analytics (cookieless)** | No cookie consent banner needed. |

## Changelog

| Date | Decision | Change |
| --- | --- | --- |
| 2026-11-01 | D1–D12 | Initial decisions recorded. |
| 2026-11-01 | D2 | Use Next.js's built-in `app/[lang]` + JSON dictionaries pattern instead of `next-intl`: no extra dependency, fully static pages. Revisit if we need ICU plurals. |
| 2026-11-02 | D7 | Search uses plain normalized substring matching instead of FlexSearch/Fuse.js: no dependency, Khmer works without word segmentation, fast enough for thousands of listings. No typo tolerance yet. |
| 2026-11-02 | — | 404s: one bilingual page via Next.js `global-not-found` (experimental flag), because unknown URLs never reach a language-specific page when every page is pre-built. Verified on the local Workers runtime. |
| 2026-11-02 | D10 | Platform list finalized for seeding: KHQR replaces individual bank apps, foodpanda and a Mobile apps group added, Facebook Marketplace and Shopify dropped. |
| 2026-11-01 | D6 | Cache Components turned off (classic static generation) for the most predictable OpenNext behaviour; `/` → `/en` is a config redirect, not a proxy. |
