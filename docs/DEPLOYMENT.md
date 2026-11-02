# Deployment

The site runs on **Cloudflare Workers** using the [OpenNext Cloudflare adapter](https://opennext.js.org/cloudflare). Pages are pre-rendered at build time and served from Workers static assets, so the free plan is enough to start.

## Contents

1. [How it works](#how-it-works)
2. [Run locally](#run-locally)
3. [First deploy (one-time setup)](#first-deploy-one-time-setup)
4. [Everyday deploys](#everyday-deploys)
5. [Free-plan limits we watch](#free-plan-limits-we-watch)
6. [Troubleshooting](#troubleshooting)

## How it works

```
git push to main
   └─► Cloudflare Workers Builds
         ├─ npm ci
         ├─ npx opennextjs-cloudflare build   (next build + adapt for Workers)
         └─ npx opennextjs-cloudflare deploy  (copy pre-rendered pages, upload Worker)
```

| File | Purpose |
| --- | --- |
| `wrangler.jsonc` | Worker name, compatibility date, static assets binding |
| `open-next.config.ts` | Uses the read-only **static assets cache**: pages are served exactly as built, no R2 bucket needed |
| `public/_headers` | Long browser caching for hashed `/_next/static/*` files |
| `next.config.ts` | Redirects `/` to `/en` without running code |

Content changes are commits, and every commit triggers a rebuild, so the site never needs to regenerate pages at runtime.

## Run locally

Requires Node.js 24 (see `.nvmrc`).

```bash
npm install
```

| Command | What it does | URL |
| --- | --- | --- |
| `npm run dev` | Next.js dev server with hot reload and the Keystatic editor | http://localhost:3000 and `/keystatic` |
| `npm run preview` | Production build running in Cloudflare's local runtime (closest to the live site) | http://localhost:8787 |
| `npm run lint` / `npm run typecheck` / `npm run format:check` | The same checks CI runs | |

> Use `npm run preview`, not plain `npx wrangler dev`. The preview command also copies pre-rendered pages into the Worker's cache; without that step, pages are rendered at runtime, where the content files can't be read.

## First deploy (one-time setup)

**Live site:** https://online-in-cambodia.horngfu.workers.dev. Workers Builds is connected, so every push to `main` deploys automatically (Option B below).

### Option A: deploy from your computer

Useful for the very first deploy or a quick manual release.

```bash
npx wrangler login
```

```bash
npm run deploy
```

`npm run deploy` builds the site, copies the pre-rendered pages and uploads the Worker named in `wrangler.jsonc`.

### Option B: deploy automatically on every push (recommended)

We use **Workers Builds**, Cloudflare's built-in Git integration. It is free (3,000 build minutes/month) and no API token has to be stored in GitHub. This can only be set up in the dashboard.

1. Open the [Cloudflare dashboard](https://dash.cloudflare.com/) → **Workers & Pages** → **online-in-cambodia** → **Settings** → **Build**.
2. Click **Connect** next to Git repository, authorize the Cloudflare GitHub app, and allow access to `HorngFu/Online-in-Cambodia` only.
3. Fill in the build settings:

   | Setting | Value |
   | --- | --- |
   | Git branch (production) | `main` |
   | Build command | `npm run cf:build` |
   | Deploy command | `npx opennextjs-cloudflare deploy` |
   | Previews Base → Build command | `npm run cf:build` |
   | Previews Base → Preview command | `npx opennextjs-cloudflare populateCache local && npx wrangler preview` |
   | Root directory | `/` |

4. Under **Build variables**, add `NODE_VERSION` = `24`.
5. Save. The next push to `main` deploys automatically; check progress under the Worker's **Deployments** tab.

> Setting up a brand-new account instead? Use **Workers & Pages** → **Create** → **Import a repository** with the same settings. The Worker name must be `online-in-cambodia` to match `wrangler.jsonc`.

> Never paste API tokens or secrets into chat or commit them. Secrets go into the Cloudflare dashboard (**Settings → Variables and Secrets**).

## Everyday deploys

- **Push or merge to `main`** → Cloudflare builds and deploys production automatically.
- **Push a branch / open a pull request** → GitHub Actions runs CI (lint, typecheck, format, content validation, tests, Cloudflare build, size check), and Workers Builds creates a **Worker Preview** for the branch at `https://<branch-name>-online-in-cambodia.horngfu.workers.dev` (for example `content/add-cafes` → `content-add-cafes-online-in-cambodia…`). Cloudflare comments the link on the pull request.
  - Previews need the `"previews": {}` block in `wrangler.jsonc`.
  - Each branch's preview copies the **Previews Base** settings when it's first built. If you change those settings, existing branches keep the old ones: delete the preview (`npx wrangler preview delete --name <branch>`) or use a new branch.
  - Previews don't have the production secrets, so `/keystatic` only works on the live site.
- **Roll back**: Cloudflare dashboard → the Worker → **Deployments** → pick an earlier version → **Rollback**.

## Free-plan limits we watch

Checked on 2026-11-01 against https://developers.cloudflare.com/workers/platform/limits/.

| Limit (Workers Free) | Value | Our status |
| --- | --- | --- |
| Requests per day | 100,000 | Static assets (JS, CSS, fonts, images) don't count, and pre-rendered pages are cheap |
| CPU time per request | 10 ms | Pre-rendered pages are served from cache in a few ms |
| Worker size (uncompressed) | 64 MiB | 6.6 MiB (1.3 MiB gzipped) in Phase 3 |
| Static asset files per version | 20,000 | 274 in Phase 3 (about 240 pre-rendered pages). Each listing adds 1 cache file per language, so with 2 languages we reach the limit at roughly 8,000–9,000 listings |
| Subrequests per request | 50 | Not a concern for static pages |
| Workers Builds | 3,000 min/month, 1 concurrent build, 20 min timeout | Builds take a few minutes |

CI writes the Worker size and asset count to each run's summary and fails before either gets close to a limit.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `OpenNext is not fully compatible with Windows` warning | Builds and local preview worked on Windows 11 during Phase 1. If you hit strange errors, run the commands in WSL. Production builds run on Linux in Cloudflare, so they are unaffected. |
| PR preview build fails with "needs a `previews` block" or "name … must match the name of your Worker" | The preview command must be `npx opennextjs-cloudflare populateCache local && npx wrangler preview` (Settings → Build → **Previews Base**), and `wrangler.jsonc` must contain `"previews": {}`. Branches whose preview was created with older settings keep them; see Everyday deploys. |
| Push to `main` doesn't deploy | In **Settings → Build**, check the repository is connected, the branch is `main`, and the commands match the table above exactly (a typo such as `px` instead of `npx` makes every build fail). Build logs are under **Deployments → View build history**. |
| Local preview shows a different website | Another `wrangler dev` (from another project) is already on port 8787. Stop it, or run `npx wrangler dev --port 8799`. |
| Home page shows **0** listings in preview | Pre-rendered pages weren't copied into the cache. Use `npm run preview` (or run `npx opennextjs-cloudflare populateCache local` before `wrangler dev`). |
| `/keystatic` works locally but not on the live site | Expected until Phase 5. The live site has no filesystem, so the editor's API is switched off until GitHub mode is configured. |
| Build fails: `Missing required config in Keystatic API setup` | `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` is set but the other GitHub secrets aren't. Set all four (Phase 5) or remove it. |
