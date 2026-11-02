# Editor Guide

How trusted editors add and update listings **online**, from any browser, without installing anything. For what to write in each field, see the [content guide](CONTENT_GUIDE.md).

## Contents

1. [How online editing works](#how-online-editing-works)
2. [Get access](#get-access)
3. [Sign in](#sign-in)
4. [Make a change](#make-a-change)
5. [Publish it (pull request)](#publish-it-pull-request)
6. [Maintainers: setup and secrets](#maintainers-setup-and-secrets)
7. [Troubleshooting](#troubleshooting)

## How online editing works

```
Editor → /keystatic on the live site → signs in with GitHub
       → edits on a content/… branch (each save is a commit)
       → opens a pull request into main
       → CI checks it (validation, tests, build)
       → a maintainer merges → Cloudflare rebuilds → change is live (3–5 min)
```

- Nothing goes live until a pull request is merged into `main`.
- Every change is recorded in Git history, so anything can be undone.
- Keystatic only creates branches that start with `content/`.

## Get access

1. Create a free GitHub account if you don't have one.
2. Ask a maintainer to add you as a **collaborator** on [HorngFu/Online-in-Cambodia](https://github.com/HorngFu/Online-in-Cambodia) with **Write** access (repo **Settings → Collaborators**), or open an issue titled "Editor request".
3. Accept the invitation email from GitHub.

## Sign in

1. Go to **https://online-in-cambodia.horngfu.workers.dev/keystatic**.
2. Click **Log in with GitHub**.
3. The first time, GitHub asks you to authorize **online-in-cambodia-keystatic**. It can only read and write this repository's content, on your behalf.

## Make a change

1. In the top-left branch menu, choose **New branch**. Give it a short name, e.g. `content/add-kampot-cafes` (the `content/` prefix is added for you).
2. Open **Listings**, then **Add** (new listing) or pick an existing one.
3. Fill in the fields as described in the [content guide](CONTENT_GUIDE.md): names, type, categories, provinces, platforms, at least one source, last verified date, and your GitHub username.
4. Click **Save**. Each save is a commit on your branch. Save as often as you like.

> Don't edit on `main` directly. Always use a `content/…` branch so changes are reviewed first.

## Publish it (pull request)

1. When you're done, open the branch menu and choose **Create pull request** (or go to the repository on GitHub, where a banner offers to open one).
2. Describe what you changed and where you checked it.
3. Wait for the checks to turn green. If `Validate content` fails, open the check's log: it lists the exact file and problem (for example a link that doesn't match its platform).
4. A maintainer reviews and merges. The site updates a few minutes later.

## Maintainers: setup and secrets

Already done for this project in Phase 5; this is the reference if it ever needs redoing.

| What | Where | Value |
| --- | --- | --- |
| GitHub App | https://github.com/apps/online-in-cambodia-keystatic | Created through `/keystatic/setup`; installed on this repository only |
| Callback URLs | GitHub App settings | `https://online-in-cambodia.horngfu.workers.dev/api/keystatic/github/oauth/callback` and `http://127.0.0.1:3300/api/keystatic/github/oauth/callback` (local) |
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Built in: production builds default to `online-in-cambodia-keystatic` (`next.config.ts`) | Only set it (Cloudflare → Settings → **Build** → variables) to use a different app, e.g. in a fork |
| `KEYSTATIC_GITHUB_CLIENT_ID` | Cloudflare → Worker → Settings → **Variables and Secrets** (Secret) | From the GitHub App |
| `KEYSTATIC_GITHUB_CLIENT_SECRET` | same (Secret) | From the GitHub App |
| `KEYSTATIC_SECRET` | same (Secret) | Long random string, used to sign session cookies |

**Local development in GitHub mode:** keep the same four values in a git-ignored `.env` file (see `.env.example`) and run `npx next dev -p 3300`, then open http://127.0.0.1:3300/keystatic. Without the slug in `.env`, Keystatic uses local mode and edits files on disk.

**When the domain changes (Phase 10):** add the new callback URL in the GitHub App settings, and update `SITE_URL` in `src/lib/paths.ts`.

**Rotating secrets:** in the GitHub App settings, generate a new client secret; update `KEYSTATIC_GITHUB_CLIENT_SECRET` in Cloudflare and in local `.env` files. To sign everyone out, change `KEYSTATIC_SECRET`.

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `/keystatic` shows a "Keystatic Setup" page on the live site | The three secrets aren't set on the Worker. Check **Variables and Secrets**. |
| `/keystatic` on the live site shows nothing or "Not found" errors | The site was built in local mode. Check that `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` isn't set to an empty value under **Build** variables, and that `next.config.ts` still has the production default. |
| GitHub says "The redirect_uri is not associated with this application" | Add the site's callback URL in the GitHub App settings (see table above). |
| "Not Found" or permission errors after signing in | You aren't a collaborator with Write access, or the app isn't installed on this repository. |
| Saved, but the live site didn't change | Changes only go live after the pull request is merged into `main`. |
