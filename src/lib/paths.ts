import type { Locale } from "@/i18n/config";

export const REPO_URL = "https://github.com/HorngFu/Online-in-Cambodia";

// Public address of the site; change here (or via env) when the domain moves.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://online-in-cambodia.horngfu.workers.dev";

export const paths = {
  home: (lang: Locale) => `/${lang}`,
  listings: (lang: Locale) => `/${lang}/listings`,
  listing: (lang: Locale, slug: string) => `/${lang}/listings/${slug}`,
  type: (lang: Locale, type: string) => `/${lang}/types/${type}`,
  categories: (lang: Locale) => `/${lang}/categories`,
  category: (lang: Locale, slug: string) => `/${lang}/categories/${slug}`,
  provinces: (lang: Locale) => `/${lang}/provinces`,
  province: (lang: Locale, slug: string) => `/${lang}/provinces/${slug}`,
  platforms: (lang: Locale) => `/${lang}/platforms`,
  platform: (lang: Locale, slug: string) => `/${lang}/platforms/${slug}`,
  about: (lang: Locale) => `/${lang}/about`,
  contribute: (lang: Locale) => `/${lang}/contribute`,
  data: (lang: Locale) => `/${lang}/data`,
};

// GitHub issue forms accept field values as query parameters (by field id).
function issueForm(template: string, fields: Record<string, string> = {}) {
  const params = new URLSearchParams({ template, ...fields });
  return `${REPO_URL}/issues/new?${params}`;
}

export const githubLinks = {
  newListing: () => issueForm("new-listing.yml"),
  correction: (listingUrl?: string) =>
    issueForm("correction.yml", listingUrl ? { listing: listingUrl } : {}),
  reportFake: (listingUrl?: string) =>
    issueForm("report-fake.yml", listingUrl ? { listing: listingUrl } : {}),
  contributing: () => `${REPO_URL}/blob/main/CONTRIBUTING.md`,
  editorRequest: () =>
    `${REPO_URL}/issues/new?${new URLSearchParams({ title: "Editor request" })}`,
  contentFolder: () => `${REPO_URL}/tree/main/content`,
};
