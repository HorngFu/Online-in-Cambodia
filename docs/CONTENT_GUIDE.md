# Content Guide

How to add and verify listings in Online in Cambodia. Read the [data rules](../CONTRIBUTING.md#data-rules) first.

## Contents

1. [Where content lives](#where-content-lives)
2. [Open the editor](#open-the-editor)
3. [Add a listing](#add-a-listing)
4. [Platforms: available, not available, unknown](#platforms-available-not-available-unknown)
5. [Verify a listing](#verify-a-listing)
6. [Add a platform or category](#add-a-platform-or-category)
7. [Check your work](#check-your-work)
8. [Field reference](#field-reference)

## Where content lives

All content is YAML files in this repository, edited through Keystatic:

| Folder | One file per… | Example |
| --- | --- | --- |
| `content/listings/` | organization, business, place or brand | `cellcard.yaml` |
| `content/platforms/` | online platform (Facebook, Telegram, KHQR…) | `telegram.yaml` |
| `content/categories/` | category, up to two levels deep | `cafe.yaml` (parent: `food-and-drink`) |
| `public/logos/` | listing logo (uploaded through the editor) | |

Fixed lists (listing types, the 25 provinces, statuses, platform groups) live in [`src/lib/taxonomy.ts`](../src/lib/taxonomy.ts), with English and Khmer labels.

## Open the editor

```bash
npm run dev
```

Then open http://localhost:3000/keystatic. Changes are saved straight to the files on your computer; commit them and open a pull request as usual.

> Editors can also work online at https://online-in-cambodia.horngfu.workers.dev/keystatic, see the [editor guide](EDITOR_GUIDE.md).

## Add a listing

1. **Search first.** Check `content/listings/` (or the editor's search) so you don't create a duplicate.
2. **Listings → Add.**
3. Fill in:
   - **Name (English)**: the official name, as the organization writes it.
   - **Name (Khmer)**: only if you know the correct spelling. Leave it empty rather than guess.
   - **Type**, **Categories** (at least one) and **Provinces** (choose *Nationwide / online only* for national organizations).
   - **Description**: 1–3 neutral sentences about what it is. No slogans, prices or opinions.
4. Add **Platforms** (see below).
5. Add at least one **Source**: the page where you checked the information, usually the official website.
6. Set **Last verified** to today and **Verified by** to your GitHub username.
7. **Save**, then run `npm run validate`.

## Platforms: available, not available, unknown

Every platform in the grid has one of three states:

| State | How to record it | When |
| --- | --- | --- |
| ✅ **Available** | Add the platform, set *Available*, paste the link | You found the organization's own account or page |
| ❌ **Not available** | Add the platform, set *Not available*, no link | You checked and are sure it isn't there (e.g. their website says "we're only on Facebook") |
| ❔ **Unknown** | Don't add the platform at all | You haven't checked, or you aren't sure |

Tips:

- **Best source of links: the organization's own website.** Social links in its header or footer are official. Searching a platform directly is more likely to find fan pages or fakes.
- **Untick "Official account"** for accounts that clearly belong to the organization but aren't run by it (rare; add a note).
- **KHQR, card payments, WeChat and delivery apps** don't need a link. Add one if there is a stable page (for example a Grab store link).
- One entry per platform. If an organization has several Telegram channels, link the main one and mention others in the note.

## Verify a listing

Listings older than 12 months get a warning in `npm run validate` (and a "stale" badge on the site, from Phase 9). To re-verify:

1. Open each link and check it still works and still belongs to the organization.
2. Look for new platforms on the official website.
3. Update **Last verified** and **Verified by**, then save.
4. If the organization has closed, set **Status** to *Closed* instead of deleting it.

## Add a platform or category

Platforms and categories are in the editor under **Settings**.

**New platform:**

| Field | Notes |
| --- | --- |
| Name / Name (Khmer) | Brand names usually stay in Latin script |
| Group | Decides where it appears in the grid |
| Link pattern | Regular expression every link must match, e.g. `^https://t\.me/`. Leave empty if links vary |
| Link required | Untick for things without a page, such as payment methods |
| Display order | Lower numbers show first within the group |

**New category:** give it an English and Khmer name, and optionally a parent. Only two levels are allowed (*Food & Drink → Café*).

> Don't rename or delete platform or category files that listings use: the listings refer to them by file name. `npm run validate` will report any broken references.

## Check your work

```bash
npm run validate
```

This runs in CI on every pull request and fails if, for example:

- a category or platform doesn't exist
- an *Available* platform has no link (when one is required), or a link doesn't match the platform's pattern
- a *Not available* platform has a link
- the same platform appears twice, or two listings have the same name
- a date is in the future or a logo file is missing

Warnings (stale listings, logos over 50 KB) don't fail the build but should be fixed.

## Field reference

**Listing** (`content/listings/<slug>.yaml`)

| Field | Required | Notes |
| --- | --- | --- |
| `name` | ✅ | English name; the file name (slug) is generated from it |
| `nameKm` | | Khmer name |
| `type` | ✅ | `ngo`, `company`, `shop`, `place`, `brand`, `government`, `school`, `other` |
| `categories` | ✅ | One or more category slugs |
| `provinces` | | Province slugs, or `nationwide` |
| `description`, `descriptionKm` | | 1–3 neutral sentences |
| `logo` | | Uploaded to `public/logos/`, 50 KB or less |
| `platforms[]` | | `platform`, `availability` (`available` / `not_available`), `url`, `handle`, `isOfficial`, `note` |
| `sources[]` | ✅ | At least one URL |
| `lastVerified` | ✅ | `YYYY-MM-DD` |
| `verifiedBy` | | GitHub username |
| `status` | ✅ | `active`, `unverified`, `closed` |

**Platform** (`content/platforms/<slug>.yaml`): `name`, `nameKm`, `group`, `urlPattern`, `linkRequired`, `order`.

**Category** (`content/categories/<slug>.yaml`): `name`, `nameKm`, `parent`.
