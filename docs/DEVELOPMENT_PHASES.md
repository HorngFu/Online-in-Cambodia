# Online in Cambodia — Development Phases

> An open-source, community-maintained directory of organizations, companies, shops, places and brands in Cambodia, showing **which online platforms each one is on — and which it is not on**.

This document is the roadmap. It is written so you can work **one phase at a time**: each phase has a goal, tasks, a "done when" checklist, and a ready-to-copy prompt you can send to Claude to build it.

**How to use this document**

1. Answer the open questions in [Section 2 — Decisions to confirm](#2-decisions-to-confirm) (or accept the recommended defaults).
2. Copy the **"Ask Claude"** prompt of the next phase and send it.
3. When the phase is finished, tick it in the [Progress tracker](#7-progress-tracker) and move on.

---

## Table of contents

1. [Product summary](#1-product-summary)
2. [Decisions to confirm](#2-decisions-to-confirm)
3. [Architecture](#3-architecture)
4. [Content model](#4-content-model)
5. [Hosting cost plan: free first, paid later](#5-hosting-cost-plan-free-first-paid-later)
6. [Development phases](#6-development-phases)
7. [Progress tracker](#7-progress-tracker)
8. [Risks and how we handle them](#8-risks-and-how-we-handle-them)

---

## 1. Product summary

**Problem.** People in Cambodia often can't tell where a business or organization actually lives online: Is this shop on Telegram? Does this NGO have a website? Can I pay this café with KHQR? Can I order from this restaurant on a delivery app?

**Solution.** A free public website where anyone can:

- **Search** for an organization, company, shop, place or brand by name (English or Khmer).
- **See a platform grid** for each listing: ✅ available (with link) · ❌ not available · ❔ unknown.
- **Filter** by category, province, and platform — including the reverse question ("shops in Siem Reap that are *not* on Telegram").
- **Suggest** a new listing or a correction, without needing to code.

**Who it is for**

| Audience | What they get |
| --- | --- |
| Public / customers | Find the official channels of a business and avoid fake pages |
| Businesses & NGOs | Free visibility; see which platforms they're missing |
| Researchers, journalists, government, digital-skills NGOs | Open data on Cambodia's digital adoption |
| Volunteer contributors | An easy way to help keep the directory accurate |

**Principles**

- Open source code, open data.
- Free to run at the start; every paid upgrade has a clear trigger.
- Khmer-first friendly (Khmer search, Khmer fonts).
- Content lives in Git (via Keystatic), so every change is reviewed and has history.

---

## 2. Decisions to confirm

Recommended defaults are marked **(Recommended)**. If you don't answer, Claude will use the recommended option.

| # | Question | Options | Notes |
| --- | --- | --- | --- |
| D1 | **Project / brand name** | "Online in Cambodia" (repo name) **(Recommended for now)** · another name | Can change before launch (Phase 10). |
| D2 | **Languages** | English + Khmer from day one **(Recommended)** · English first, Khmer later | Adding i18n later means touching every page; cheaper to set it up early. |
| D3 | **Code license** | MIT **(Recommended)** · Apache-2.0 · AGPL-3.0 | MIT is simplest and most contributor-friendly. AGPL forces forks that host it to publish changes. |
| D4 | **Data license** | CC BY-SA 4.0 **(Recommended)** · CC BY 4.0 · ODbL · CC0 | BY-SA = others can reuse the data but must credit you and share alike. |
| D5 | **Who can edit in the CMS** | Small trusted editor team via GitHub; public sends suggestions **(Recommended)** · anyone with a GitHub account opens PRs directly | Keystatic GitHub mode requires editors to have write access to the repo (or use branches + PRs). |
| D6 | **Rendering / hosting mode** | Next.js on Cloudflare Workers via OpenNext, pages pre-rendered at build **(Recommended)** · pure static export (no server, Keystatic only works locally) | OpenNext keeps the `/keystatic` admin working online. Static export is the fallback if OpenNext ever becomes a problem (see Risks). |
| D7 | **Search** | Client-side search index built at build time **(Recommended until ~5,000 listings)** · hosted search (Algolia/Typesense/Meilisearch) | Client-side search costs $0 and works offline-ish. |
| D8 | **Domain** | Start on free `*.workers.dev` subdomain, buy domain at launch **(Recommended)** · buy now | `.org` ≈ US$10/yr via Cloudflare Registrar. `.org.kh` / `.com.kh` need a Cambodian registrar and documents. |
| D9 | **Logos / images** | Small pre-optimized WebP logos committed to the repo **(Recommended)** · Cloudflare R2 storage | R2 has a free 10 GB tier; move there when the repo gets heavy. |
| D10 | **Initial platform list** | See [Section 4.2](#42-platform) **(Recommended)** · your own list | You know the local market best — please review this list. |
| D11 | **Business owners claiming listings** | Not in MVP; later phase **(Recommended)** · in MVP | Needs accounts + verification; adds cost and moderation work. |
| D12 | **Analytics** | Cloudflare Web Analytics — free, cookieless **(Recommended)** · Google Analytics · none | Cookieless = no consent banner needed. |

---

## 3. Architecture

### 3.1 Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js** (latest stable, App Router, TypeScript) | Your choice; strong SEO via pre-rendering. |
| Styling | **Tailwind CSS** + a small component set (e.g. shadcn/ui) | Fast to build, easy for contributors. |
| CMS | **Keystatic** (local mode in dev, GitHub mode in production) | Your choice; content stored as files in this repo, free. |
| Content storage | YAML / Markdoc files in `content/` | Diffable, reviewable, no database to pay for. |
| Hosting | **Cloudflare Workers** with **OpenNext** (`@opennextjs/cloudflare`) | Your choice; generous free tier, global CDN. |
| Search | Build-time JSON index + client-side substring search (`src/lib/search.ts`) | $0, no dependency, works for Khmer (no word breaks needed). Add typo tolerance or a library later if needed. |
| i18n | Next.js built-in pattern: `app/[lang]` routes (`/en/...`, `/km/...`) + JSON dictionaries in `src/i18n/` | No extra dependency; pages stay fully static. Can move to `next-intl` later if we need plurals/ICU formatting. |
| Fonts | Kantumruy Pro or Noto Sans Khmer + Inter | Good Khmer rendering. |
| Analytics | Cloudflare Web Analytics | Free, privacy-friendly. |
| CI | GitHub Actions | Lint, type-check, validate content, link checks. Free for public repos. |

### 3.2 How it fits together

```
 Editors ──► /keystatic (admin UI) ──► GitHub API ──► commit / PR to repo
                                                        │
 Contributors ──► "Suggest an edit" form / GitHub Issue ─┘ (reviewed by editors)
                                                        │
                                              GitHub Actions (validate)
                                                        │
                                          Cloudflare build & deploy (OpenNext)
                                                        │
 Visitors ◄──────── pre-rendered pages + search index from Cloudflare edge
```

- Every content change is a Git commit → every change triggers a rebuild → pages are pre-rendered static HTML → cheap and fast.
- No database in the free phase. Database (Cloudflare D1) only arrives in the scale phase, if needed.

### 3.3 Proposed folder structure

```
/
├─ content/
│  ├─ listings/        # one file per organization/business
│  ├─ platforms/       # one file per online platform (Facebook, Telegram, ...)
│  └─ categories/      # one file per category
├─ public/logos/       # optimized listing logos
├─ src/
│  ├─ app/[locale]/    # pages (home, listings, categories, provinces, about)
│  ├─ app/keystatic/   # Keystatic admin UI
│  ├─ app/api/keystatic/ # Keystatic API route (GitHub mode)
│  ├─ components/
│  ├─ lib/             # content readers, search index builder, helpers
│  └─ messages/        # en.json, km.json translations
├─ scripts/            # validation, link checker, data import/export
├─ docs/               # this file, contributing guide, decisions
├─ keystatic.config.ts
├─ open-next.config.ts
└─ wrangler.jsonc
```

---

## 4. Content model

### 4.1 Listing

One file per entity, e.g. `content/listings/brown-coffee.yaml`.

| Field | Type | Required | Example / notes |
| --- | --- | --- | --- |
| `name` (EN) | text | ✅ | Brown Coffee |
| `nameKm` | text | | ប្រោន កាហ្វេ |
| `slug` | slug | ✅ | `brown-coffee` (auto from name) |
| `type` | select | ✅ | `ngo` · `company` · `shop` · `place` · `brand` · `government` · `school` · `other` |
| `categories` | relation (multi) | ✅ | Café, Food & Drink |
| `provinces` | multi-select | | Phnom Penh, Siem Reap (25 provinces fixed list) |
| `description` / `descriptionKm` | short text | | 1–3 sentences |
| `logo` | image | | WebP ≤ 50 KB |
| `platforms` | array of platform entries (below) | ✅ | |
| `sources` | array of URLs | | Where the info was verified |
| `lastVerified` | date | ✅ | Shows "stale" badge if older than N months |
| `verifiedBy` | text | | Editor GitHub username |
| `status` | select | ✅ | `active` · `closed` · `unverified` |

**Platform entry** (inside a listing):

| Field | Type | Notes |
| --- | --- | --- |
| `platform` | relation → Platform | e.g. Telegram |
| `availability` | select | `available` · `not_available` · `unknown` |
| `url` | URL | Required when `available`, unless the platform has `linkRequired: false` (e.g. KHQR) |
| `handle` | text | e.g. `@browncoffeekh` |
| `isOfficial` | checkbox | Helps users avoid fake pages |
| `note` | text | e.g. "Orders only, no support" |

> **Design choice:** a platform missing from a listing counts as **unknown**, not "not available". "Not available" must be set on purpose by an editor. This keeps the data honest.

### 4.2 Platform

`content/platforms/telegram.yaml` — so new platforms can be added without code changes.

| Field | Notes |
| --- | --- |
| `name`, `nameKm` | |
| `group` | `website` · `social` · `messaging` · `maps` · `delivery` · `payment` · `marketplace` · `apps` · `jobs` · `other` |
| `urlPattern` | Optional regex to validate links |
| `linkRequired` | `false` for platforms without a page to link to (payments, WeChat, delivery apps) |
| `order` | Display order in the grid |
| *(icons)* | The site shows one generic icon per platform **group** (Lucide). Brand logos are not used, to avoid trademark issues. |

**Starting list (26 platforms, seeded in Phase 2; please review — D10):**

| Group | Platforms |
| --- | --- |
| Website | Official website, Online store |
| Social | Facebook, Instagram, TikTok, YouTube, LinkedIn, X (Twitter) |
| Messaging | Telegram, WhatsApp, LINE, WeChat |
| Maps | Google Maps, Apple Maps |
| Delivery / ride | Grab, foodpanda, Nham24, WOWNOW, E-GetS *(all still mentioned by 2025–26 sources; confirm locally)* |
| Payment | KHQR, Card payments *(KHQR covers every Bakong member bank, so individual bank apps aren't listed separately)* |
| Marketplace | Khmer24 |
| Mobile apps | Android app, iPhone app |
| Jobs | CamHR, BongThom *(LinkedIn is under Social)* |

### 4.3 Category

`content/categories/cafe.yaml` — `name`, `nameKm`, `icon`, optional `parent` (for a simple two-level tree: e.g. *Food & Drink → Café*).

---

## 5. Hosting cost plan: free first, paid later

### 5.1 Free stage — target cost: **US$0/month** (domain optional ≈ US$10/year)

| Service | Free allowance (check current limits) | Our usage |
| --- | --- | --- |
| Cloudflare Workers (Free) | 100,000 requests/day, 10 ms CPU per request, 64 MiB Worker size, 20,000 static asset files per version | Site + Keystatic API (checked 2026-11-01, see [DEPLOYMENT.md](DEPLOYMENT.md#free-plan-limits-we-watch)) |
| Cloudflare static assets | Static asset requests are free and don't count as Worker requests | JS, CSS, images, search index |
| Cloudflare Web Analytics | Free | Visitor stats |
| GitHub (public repo) | Free repos, free Actions minutes for public repos | Code, content, CI |
| Keystatic (GitHub mode) | Free, open source | CMS |
| Domain | Free `*.workers.dev`; ~US$10/yr for `.org` | |

**How we stay free**

- Pre-render every listing page at build time; serve as static assets where possible.
- Ship a compact search index (only name, nameKm, type, categories, provinces, platform flags).
- Keep logos tiny (WebP, ≤ 50 KB); no runtime image resizing.
- No database, no paid search, no auth service.

### 5.2 Paid stage — upgrade only when a trigger is hit

| Trigger | Upgrade | Approx. cost |
| --- | --- | --- |
| > ~70k requests/day, or > ~18,000 static asset files (roughly 8,000+ listings in 2 languages) | Cloudflare Workers Paid (100,000 asset files) | ~US$5/month (includes millions of requests) |
| Repo too heavy with logos (> ~300 MB) | Move logos to Cloudflare R2 | Free up to 10 GB, then cents/GB |
| > ~5,000 listings: builds slow, search index too big | Move listings to Cloudflare D1 + server-side search; keep Keystatic for platforms/categories/pages | D1 free tier, then usage-based |
| Need typo-tolerant, multilingual hosted search | Meilisearch / Typesense / Algolia | Free tiers → ~US$0–30/month |
| Business owners want to claim listings (D11) | Auth (e.g. GitHub/Google OAuth via Auth.js) + D1 | Low, usage-based |
| More than a few CMS editors and want easier login | Keystatic Cloud (optional) | Check current pricing |

> Exact free-tier numbers change over time. Phase 1 includes a step to re-check current Cloudflare limits and record them here.

---

## 6. Development phases

Each phase is sized so it can be built and reviewed in one or a few sessions.
**MVP = Phases 0–5. Public launch = Phase 10.**

---

### Phase 0 — Project foundations

**Goal:** A clean, welcoming open-source repo with decisions written down.

**Tasks**
- [ ] Confirm decisions D1–D12 and record them in `docs/DECISIONS.md`.
- [ ] Add `README.md` (what, why, how to run, how to contribute).
- [ ] Add `LICENSE` (code) and `DATA_LICENSE` (content).
- [ ] Add `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, `SECURITY.md`.
- [ ] Add GitHub issue templates: bug report, feature request, *new listing*, *correction*.
- [ ] Add pull request template.
- [ ] Add `.editorconfig`, `.gitignore`, `.nvmrc` (Node LTS).

**Done when**
- Repo has all community files and a README a newcomer understands.

**Ask Claude**
> Start Phase 0 from docs/DEVELOPMENT_PHASES.md. My decisions: D1=…, D2=…, (or "use recommended defaults"). Create the community files, licenses, issue/PR templates and DECISIONS.md.

---

### Phase 1 — Scaffold + deploy "Hello Cambodia" to Cloudflare (technical spike)

**Goal:** Prove the full stack works end-to-end on Cloudflare's free plan **before** building features.

**Tasks**
- [x] Create Next.js app (App Router, TypeScript, Tailwind, ESLint, Prettier). *Next.js 16.4.*
- [x] Add OpenNext Cloudflare adapter, `wrangler.jsonc`, `open-next.config.ts` (read-only static assets cache, no R2 needed).
- [x] `/en` and `/km` routes with dictionaries and Kantumruy Pro Khmer font (D2).
- [x] Install Keystatic with one tiny test collection; confirm `/keystatic` loads (local mode, `npm run dev`).
- [x] Deploy to `*.workers.dev`: live at https://online-in-cambodia.horngfu.workers.dev (deployed with `npm run deploy`).
- [x] Auto-deploy on push via Cloudflare Workers Builds (first automatic deploy 2026-11-02).
- [x] **Check:** Worker size 5.8 MiB / 1.2 MiB gzipped versus the 64 MiB limit; pages served from the pre-rendered cache in local Workers runtime. The Keystatic API is disabled in production until Phase 5 (it needs GitHub mode to work without a filesystem).
- [x] Set up GitHub Actions CI: install, lint, typecheck, format, Cloudflare build, size + asset count check.
- [x] Re-check current Cloudflare free limits and update Section 5.
- [x] Write `docs/DEPLOYMENT.md`.

**Done when**
- A live URL shows the home page.
- Pushing to `main` redeploys automatically.
- Bundle size and Keystatic compatibility are confirmed (or fallback D6 → static export is chosen and documented).

**Ask Claude**
> Start Phase 1. Scaffold Next.js + Tailwind + Keystatic with OpenNext for Cloudflare Workers, set up CI, and walk me through deploying to workers.dev. Report the bundle size versus the free limit.

> 👤 **You will need to do:** create/log in to a Cloudflare account, connect the GitHub repo, and approve the deploy. Claude will give exact steps.

---

### Phase 2 — Content model in Keystatic (local mode) + sample data

**Goal:** Editors can create listings, platforms and categories in the Keystatic UI locally.

**Tasks**
- [x] Implement collections from [Section 4](#4-content-model): `listings`, `platforms`, `categories` (`keystatic.config.ts`).
- [x] Fixed lists: listing types, 25 provinces + nationwide (EN + KM), availability, statuses, platform groups (`src/lib/taxonomy.ts`). 👤 *Khmer labels need a native-speaker review.*
- [x] Content reader helpers in `src/lib/content.ts` (typed).
- [x] Validation script `scripts/validate-content.ts` (`npm run validate`), runs in CI.
- [x] Seed: 26 platforms, 25 categories, **28 real listings** (8 types, 6 provinces + nationwide). Every link was taken from the organization's own website; anything not found there is left as unknown.
- [x] Doc: [`docs/CONTENT_GUIDE.md`](CONTENT_GUIDE.md).
- [x] Seed files match Keystatic's own YAML formatting, so the first edit doesn't produce a noisy diff.

**Done when**
- `npm run dev` → `/keystatic` lets you add/edit all content types.
- CI fails on invalid content.

**Ask Claude**
> Start Phase 2. Build the Keystatic content model from Section 4, the validation script, and seed sample data. Use this platform list: … (or "use the suggested list").

---

### Phase 3 — Public site MVP

**Goal:** Visitors can browse and view listings with the platform availability grid.

**Pages**
- [x] **Home**: hero, browse by type/category/province, recently verified, quick stats. *(Search box arrives with Phase 4.)*
- [x] **Listings index** `/listings`: cards with name, type, provinces and platform-group icons. *(Logos once listings have them.)*
- [x] **Listing detail** `/listings/[slug]`: names (EN/KM), description, **platform grid grouped by platform group** (✅ / ❌ with links; unchecked platforms folded into an expandable list), details, last verified, sources, "Suggest an edit" and "Report a fake page" (pre-filled GitHub forms).
- [x] **Category** (index + `/categories/[slug]`, including subcategories), **Province** (index + `/provinces/[slug]`, with nationwide listings in their own section) and **Type** `/types/[type]`.
- [x] **Platform** (index + `/platforms/[slug]`): who is on it, who is not, and how many are unchecked.
- [x] **About**, **Contribute**, **Data & license** pages.
- [x] Bilingual 404, responsive layout, dark mode, availability shown with icons + text (never color only), skip link, language switch that keeps the current page.
- [x] Lighthouse (mobile, local Workers preview): home 93 / 100 / 100 / 100, listing 96 / 100 / 100 / 100, platform page 92 / 100 / 100 / 100 (performance / accessibility / best practices / SEO).

**Done when**
- All pages are statically generated and work on mobile.
- Lighthouse ≥ 90 for performance, accessibility, SEO on the detail page.

**Ask Claude**
> Start Phase 3. Build the public pages listed in Phase 3 using the content from Phase 2. Mobile-first design.

---

### Phase 4 — Search & filters

**Goal:** Find anything in a second, and answer "who is / isn't on platform X".

**Tasks**
- [x] Build-time search index `/search-index.json` (static, short keys). 28 listings = 6.6 KB, **1.5 KB gzipped** (~53 bytes per listing gzipped, so ~270 KB at 5,000 listings).
- [x] Client-side search in English and Khmer: normalized substring matching, so Khmer works without word breaks. Searches names first, then category, type and province names in both languages. No search library needed (`src/lib/search.ts`).
- [x] Filters: type, category (parents include subcategories), province (with an "include nationwide" toggle), **platform = is on / is not on (checked) / not checked yet**.
- [x] Filters live in the URL query string (shareable links, back button works). The home page search box submits to `/listings?q=…`.
- [x] Sort: best match, name, recently verified. *("Recently added" needs a created date, which listings don't have yet.)*
- [x] Empty state with "Can't find it? Suggest a listing".
- [x] Without JavaScript (or before the index loads) the full pre-rendered list is shown.
- [x] On phones, filters fold behind a "Filters" button showing how many are active.
- [x] Unit tests for search and filters (`npm test`, 14 tests incl. Khmer), run in CI.
- [x] Lighthouse: listings page 94 / 100 / 100 / 100; heading-order and language-button label issues fixed site-wide.

**Done when**
- Searching "coffee" or "កាហ្វេ" returns relevant results.
- "Shops in Phnom Penh not on Telegram" is two clicks away.
- Index size is recorded (watch for D7 threshold).

**Ask Claude**
> Start Phase 4. Add client-side search with Khmer support and the platform availability filters.

---

### Phase 5 — Keystatic GitHub mode in production (online editing)

**Goal:** Trusted editors edit content on the live site; every edit becomes a commit or PR.

**Tasks**
- [ ] Switch Keystatic storage to `github` in production, `local` in development.
- [ ] Create the Keystatic GitHub App and set secrets in Cloudflare (`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET`, `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`).
- [ ] Branch protection on `main`: editors work in branches → PR → CI validation → merge → auto deploy.
- [ ] Image upload path for logos with size guidance.
- [ ] Doc: `docs/EDITOR_GUIDE.md` with screenshots.

**Done when**
- An editor logs in at `/keystatic` with GitHub, adds a listing, opens a PR, merges it, and sees it live after deploy.

**Ask Claude**
> Start Phase 5. Configure Keystatic GitHub mode on Cloudflare and guide me through creating the GitHub App and secrets.

> 👤 **You will need to do:** create the GitHub App (Claude guides you) and paste secrets into Cloudflare. Never paste secrets into chat.

**🎉 MVP complete after Phase 5.**

---

### Phase 6 — Khmer / English (i18n)

*(D2 = "from day one" was chosen: the `/en` and `/km` routes, dictionaries and Khmer font were set up in Phase 1, and pages are built bilingual in Phases 2–3. This phase completes the translations and gets them reviewed by a native speaker.)*

**Goal:** Full site in English and Khmer.

**Tasks**
- [ ] `hreflang` alternate tags. *(Language switcher that keeps the current page was built in Phase 3.)*
- [ ] Complete and review UI strings (`src/i18n/dictionaries/en.json`, `km.json`).
- [ ] Khmer fonts with correct line-height; test long Khmer names in cards.
- [ ] Listing fields fall back to English when Khmer is missing.

**Done when**
- Every page works in both languages; a native Khmer speaker has reviewed UI text.

**Ask Claude**
> Start Phase 6. Finish and review the English/Khmer translations and add hreflang tags.

---

### Phase 7 — Community contributions (no coding needed)

**Goal:** Anyone can suggest a listing or correction in under a minute.

**Tasks**
- [ ] "Suggest a new listing" and "Suggest an edit" pages.
- [ ] Free option (start): pre-filled **GitHub Issue Forms** (link opens a form on GitHub).
- [ ] Optional: in-site form → Cloudflare Worker route → creates a GitHub Issue using a bot token (no GitHub account needed for the public), protected by **Cloudflare Turnstile** (free).
- [ ] Labels and triage workflow: `new-listing`, `correction`, `needs-verification`.
- [ ] "Report a fake / scam page" option.
- [ ] Contributors page / credits.

**Done when**
- A non-technical person can submit a suggestion, and an editor can turn it into a listing in Keystatic.

**Ask Claude**
> Start Phase 7. Build the suggestion flow using GitHub Issue Forms first, then the Turnstile-protected form.

---

### Phase 8 — SEO, sharing & analytics

**Goal:** Listings are found on Google and look good when shared on Facebook/Telegram.

**Tasks**
- [ ] Metadata per page; `sitemap.xml`, `robots.txt`.
- [ ] Open Graph images per listing (generated at build time).
- [ ] Structured data (schema.org `Organization` / `LocalBusiness` with `sameAs` links to platforms).
- [ ] Canonical URLs, `hreflang`.
- [ ] Cloudflare Web Analytics.
- [ ] Performance budget check in CI (bundle size).

**Done when**
- Google Search Console shows pages indexed; a shared link shows a proper preview card.

**Ask Claude**
> Start Phase 8. Add SEO metadata, sitemap, OG images, structured data and Cloudflare Web Analytics.

---

### Phase 9 — Data quality automation

**Goal:** Keep the directory trustworthy as it grows.

**Tasks**
- [ ] Scheduled GitHub Action: check all platform URLs weekly; open an issue listing broken links.
- [ ] "Stale" badge if `lastVerified` older than e.g. 12 months; a page listing stale entries for volunteers.
- [ ] Duplicate detection (similar names) in CI.
- [ ] Bulk import from CSV/Google Sheet → content files (for seeding hundreds of listings).
- [ ] Public **open data export**: `listings.json` and `listings.csv` downloads.

**Done when**
- Broken links are reported automatically; editors can import a CSV of 100+ listings.

**Ask Claude**
> Start Phase 9. Add the link checker, stale badges, CSV import script and open data export.

---

### Phase 10 — Public launch

**Goal:** Go live with enough data to be useful.

**Tasks**
- [ ] Final name & domain (D1, D8); connect domain in Cloudflare.
- [ ] Seed target: **≥ 300 verified listings** across all 25 provinces and main categories.
- [ ] Recruit 3–5 volunteer editors; run an editor onboarding session.
- [ ] Insights page: "% of listed businesses on each platform" (great for press).
- [ ] Launch checklist: privacy note, terms, contact, takedown/correction policy.
- [ ] Announce: Facebook, Telegram groups, local tech communities, universities, NGO networks.

**Done when**
- Site is live on its domain and accepting community suggestions.

**Ask Claude**
> Start Phase 10. Prepare the launch checklist, insights page and domain setup steps.

---

### Phase 11+ — Scale (paid, only when triggers in Section 5.2 are hit)

Pick items as needed — each can be its own mini-phase:

- **11a** Upgrade to Cloudflare Workers Paid.
- **11b** Move logos to Cloudflare R2.
- **11c** Move listings to Cloudflare D1 + server-side search API.
- **11d** Public read-only API (`/api/v1/listings`) with rate limiting.
- **11e** Business owners claim & verify their listing (D11).
- **11f** Map view (OpenStreetMap / MapLibre — free tiles options).
- **11g** Mobile PWA / offline mode.
- **11h** Partnerships: digital-skills NGOs, chambers of commerce, ministries.

**Ask Claude**
> Start Phase 11c (or another item). Our current numbers are: listings=…, requests/day=…, build time=….

---

## 7. Progress tracker

| Phase | Name | Status | Notes |
| --- | --- | --- | --- |
| 0 | Project foundations | ✅ Done | Defaults accepted, see [DECISIONS.md](DECISIONS.md) |
| 1 | Scaffold + Cloudflare deploy spike | ✅ Done | Live on workers.dev; auto-deploys from `main` |
| 2 | Content model + sample data | ✅ Done | 28 listings; Khmer labels awaiting native review |
| 3 | Public site MVP | ✅ Done | ~240 pre-rendered pages; Lighthouse ≥ 92 everywhere |
| 4 | Search & filters | ✅ Done | Index 1.5 KB gzipped; 14 unit tests |
| 5 | Keystatic GitHub mode (online editing) | ⬜ Not started | **MVP** |
| 6 | Khmer / English | ⬜ Not started | D2: i18n set up in Phases 1–3; this phase finishes and reviews translations |
| 7 | Community contributions | ⬜ Not started | |
| 8 | SEO, sharing & analytics | ⬜ Not started | |
| 9 | Data quality automation | ⬜ Not started | |
| 10 | Public launch | ⬜ Not started | **Launch** |
| 11+ | Scale (paid) | ⬜ Not started | |

Status legend: ⬜ Not started · 🟨 In progress · ✅ Done

---

## 8. Risks and how we handle them

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Too many static asset files for the free plan (20,000 per version) as listings grow | Deploy rejected | CI reports the count and fails at 18,000. Options: Workers Paid (100,000 files, ~US$5/month) or move listings to D1 (Phase 11c). *(Worker size was the original worry, but Cloudflare dropped the compressed limit; we use 5.8 of 64 MiB.)* |
| Keystatic API route incompatibility with Workers runtime | Online editing broken | Route bundles and runs on Workers (Phase 1); full GitHub-mode login is verified in Phase 5. Fallback: Keystatic local mode + PR workflow, or Keystatic Cloud. |
| Git-based content slows down at thousands of listings | Slow builds and CMS | Measure build time each phase; migrate listings to D1 at ~5,000 (Phase 11c). |
| Incorrect or outdated data | Loss of trust | `lastVerified`, sources, stale badges, link checker, "unknown" vs "not available" distinction. |
| Fake / impersonating pages listed | Users scammed | `isOfficial` flag, editor review on every change, report-a-fake flow. |
| Spam submissions | Editor workload | GitHub review + Cloudflare Turnstile + rate limiting. |
| Legal / takedown requests | Reputational | Only public info; clear correction & takedown policy; contact email. |
| Volunteer burnout | Data stops growing | Easy suggestion flow, CSV import, contributor credits, partner NGOs. |
