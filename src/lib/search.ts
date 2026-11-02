// Search and filtering shared by the search index route, the listings page
// and tests. Pure functions only: this file is bundled into the browser.

/** One listing in /search-index.json. Short keys keep the file small. */
export type SearchEntry = {
  /** slug */
  s: string;
  /** English name */
  n: string;
  /** Khmer name */
  k?: string;
  /** type */
  t: string;
  /** category slugs, including parents of subcategories */
  c: string[];
  /** province slugs */
  p: string[];
  /** platforms marked available */
  a: string[];
  /** platforms marked not available */
  x: string[];
  /** last verified, YYYY-MM-DD */
  v: string;
};

export type PlatformFilterState = "available" | "not_available" | "unknown";

export type Filters = {
  q: string;
  type: string;
  category: string;
  province: string;
  /** Also show nationwide listings when a province is chosen. */
  nationwide: boolean;
  platform: string;
  state: PlatformFilterState;
  sort: "relevance" | "name" | "verified";
};

export const defaultFilters: Filters = {
  q: "",
  type: "",
  category: "",
  province: "",
  nationwide: true,
  platform: "",
  state: "available",
  sort: "relevance",
};

const ZERO_WIDTH = /[​-‍﻿]/g;

/**
 * Lowercase, strip Latin accents and zero-width characters (common in Khmer
 * text), collapse whitespace. Khmer characters are kept as they are.
 */
export function normalize(text: string): string {
  return text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(ZERO_WIDTH, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
    .trim();
}

/** Text each listing is searched by, beyond its names. */
export type ExtraTerms = (entry: SearchEntry) => string[];

type Prepared = { entry: SearchEntry; names: string; extra: string };

export function prepare(
  entries: SearchEntry[],
  extraTerms: ExtraTerms = () => [],
): Prepared[] {
  return entries.map((entry) => ({
    entry,
    names: normalize(`${entry.n} ${entry.k ?? ""}`),
    extra: normalize(extraTerms(entry).join(" ")),
  }));
}

/**
 * Every query word must appear somewhere (substring match, so Khmer works
 * without word breaks). Higher scores for matches at the start of a name.
 * Returns 0 when the listing doesn't match.
 */
export function score(item: Prepared, query: string): number {
  const words = normalize(query).split(" ").filter(Boolean);
  if (words.length === 0) return 1;
  let total = 0;
  for (const word of words) {
    if (item.names.startsWith(word)) total += 4;
    else if (item.names.includes(` ${word}`)) total += 3;
    else if (item.names.includes(word)) total += 2;
    else if (item.extra.includes(word)) total += 1;
    else return 0;
  }
  return total;
}

function platformState(entry: SearchEntry, platform: string) {
  if (entry.a.includes(platform)) return "available";
  if (entry.x.includes(platform)) return "not_available";
  return "unknown";
}

export function applyFilters(
  items: Prepared[],
  filters: Filters,
): SearchEntry[] {
  const results: { entry: SearchEntry; score: number }[] = [];
  for (const item of items) {
    const { entry } = item;
    if (filters.type && entry.t !== filters.type) continue;
    if (filters.category && !entry.c.includes(filters.category)) continue;
    if (
      filters.province &&
      !entry.p.includes(filters.province) &&
      !(filters.nationwide && entry.p.includes("nationwide"))
    ) {
      continue;
    }
    if (
      filters.platform &&
      platformState(entry, filters.platform) !== filters.state
    ) {
      continue;
    }
    const value = score(item, filters.q);
    if (value > 0) results.push({ entry, score: value });
  }

  const byName = (a: SearchEntry, b: SearchEntry) => a.n.localeCompare(b.n);
  const sort =
    filters.sort === "relevance" && !filters.q.trim() ? "name" : filters.sort;
  results.sort((a, b) => {
    if (sort === "verified")
      return b.entry.v.localeCompare(a.entry.v) || byName(a.entry, b.entry);
    if (sort === "relevance")
      return b.score - a.score || byName(a.entry, b.entry);
    return byName(a.entry, b.entry);
  });
  return results.map((result) => result.entry);
}

// URL <-> filters, so filtered views can be shared as links.

const keys = {
  q: "q",
  type: "type",
  category: "category",
  province: "province",
  nationwide: "nationwide",
  platform: "platform",
  state: "state",
  sort: "sort",
} as const;

export function filtersFromSearch(search: string): Filters {
  const params = new URLSearchParams(search);
  const state = params.get(keys.state);
  const sort = params.get(keys.sort);
  return {
    q: params.get(keys.q) ?? "",
    type: params.get(keys.type) ?? "",
    category: params.get(keys.category) ?? "",
    province: params.get(keys.province) ?? "",
    nationwide: params.get(keys.nationwide) !== "0",
    platform: params.get(keys.platform) ?? "",
    state:
      state === "not_available" || state === "unknown" ? state : "available",
    sort: sort === "name" || sort === "verified" ? sort : "relevance",
  };
}

export function filtersToSearch(filters: Filters): string {
  const params = new URLSearchParams();
  // Keep the query untrimmed: it mirrors the search box while someone types
  // "brown coffee", including the space after "brown".
  if (filters.q.trim()) params.set(keys.q, filters.q);
  if (filters.type) params.set(keys.type, filters.type);
  if (filters.category) params.set(keys.category, filters.category);
  if (filters.province) {
    params.set(keys.province, filters.province);
    if (!filters.nationwide) params.set(keys.nationwide, "0");
  }
  if (filters.platform) {
    params.set(keys.platform, filters.platform);
    if (filters.state !== "available") params.set(keys.state, filters.state);
  }
  if (filters.sort !== "relevance") params.set(keys.sort, filters.sort);
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function hasActiveFilters(filters: Filters): boolean {
  return filtersToSearch({ ...filters, sort: "relevance" }) !== "";
}
