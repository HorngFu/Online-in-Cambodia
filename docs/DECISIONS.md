# Decisions

This file records the project decisions from [DEVELOPMENT_PHASES.md — Section 2](DEVELOPMENT_PHASES.md#2-decisions-to-confirm). To change a decision, open a pull request that updates the entry and adds a row to the changelog at the bottom.

**Decided:** 2026-11-01 (all recommended defaults accepted)

| # | Topic | Decision | Consequence |
| --- | --- | --- | --- |
| D1 | Project name | **Online in Cambodia** (working name) | Can be renamed before launch (Phase 10). |
| D2 | Languages | **English + Khmer from day one** | i18n (`next-intl`, `/en` and `/km` routes, Khmer fonts) is set up in Phases 1–3 rather than as a separate Phase 6. Phase 6 becomes "finish and review translations". |
| D3 | Code license | **MIT** | See [`LICENSE`](../LICENSE). |
| D4 | Data license | **CC BY-SA 4.0** | Everything in `content/` and `public/logos/` metadata. See [`DATA_LICENSE.md`](../DATA_LICENSE.md). Third-party logos stay the property of their owners. |
| D5 | Who edits | **Small trusted editor team via GitHub; the public sends suggestions** | Editors get write access and work through branches and pull requests. Everyone else uses issue forms (and later the website form). |
| D6 | Rendering / hosting | **Next.js on Cloudflare Workers via OpenNext, pages pre-rendered at build** | Phase 1 must confirm the bundle fits the free plan and that the Keystatic API route runs on Workers. The fallback is a static export with Keystatic in local mode. |
| D7 | Search | **Client-side index built at build time** | Revisit at about 5,000 listings or when the index is larger than about 1 MB gzipped. |
| D8 | Domain | **Free `*.workers.dev` subdomain until launch** | Buy the domain in Phase 10. |
| D9 | Logos | **Small pre-optimized WebP files (≤ 50 KB) in the repo** | Move to Cloudflare R2 if the repo grows past about 300 MB. |
| D10 | Platforms | **Suggested list in DEVELOPMENT_PHASES.md Section 4.2** | Delivery apps must be checked to confirm they still operate in Cambodia before seeding (Phase 2). |
| D11 | Business owners claiming listings | **Not in MVP** | Planned as Phase 11e. |
| D12 | Analytics | **Cloudflare Web Analytics (cookieless)** | No cookie consent banner needed. |

## Changelog

| Date | Decision | Change |
| --- | --- | --- |
| 2026-11-01 | D1–D12 | Initial decisions recorded. |
