import { createReader, type Entry } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";
import { platformGroups, type PlatformGroup } from "./taxonomy";

// Reads content files from disk. Only call this from code that runs at build
// time (statically generated pages): the Cloudflare Worker has no filesystem.
export const reader = createReader(process.cwd(), keystaticConfig);

type Collections = (typeof keystaticConfig)["collections"];

export type Listing = Entry<Collections["listings"]> & { slug: string };
export type Platform = Entry<Collections["platforms"]> & { slug: string };
export type Category = Entry<Collections["categories"]> & { slug: string };

function withSlugs<T>(items: { slug: string; entry: T }[]) {
  return items.map(({ slug, entry }) => ({ ...entry, slug }));
}

export async function getListings(): Promise<Listing[]> {
  const listings = withSlugs(await reader.collections.listings.all());
  return listings.sort((a, b) => a.name.localeCompare(b.name));
}

export async function getListing(slug: string): Promise<Listing | null> {
  const entry = await reader.collections.listings.read(slug);
  return entry ? { ...entry, slug } : null;
}

/** Platforms sorted by group (taxonomy order), then `order`, then name. */
export async function getPlatforms(): Promise<Platform[]> {
  const groupIndex = new Map<string, number>(
    platformGroups.map((group, index) => [group.value, index]),
  );
  const platforms = withSlugs(await reader.collections.platforms.all());
  return platforms.sort(
    (a, b) =>
      (groupIndex.get(a.group) ?? 99) - (groupIndex.get(b.group) ?? 99) ||
      (a.order ?? 100) - (b.order ?? 100) ||
      a.name.localeCompare(b.name),
  );
}

export async function getCategories(): Promise<Category[]> {
  const categories = withSlugs(await reader.collections.categories.all());
  return categories.sort((a, b) => a.name.localeCompare(b.name));
}

/** Listings in a category or any of its subcategories. */
export function listingsInCategory(
  listings: Listing[],
  categories: Category[],
  slug: string,
): Listing[] {
  const slugs = new Set([
    slug,
    ...categories.filter((c) => c.parent === slug).map((c) => c.slug),
  ]);
  return listings.filter((listing) =>
    listing.categories.some((category) => slugs.has(category)),
  );
}

export type PlatformState = "available" | "not_available" | "unknown";

export type PlatformStatus = {
  platform: Platform;
  state: PlatformState;
  url: string | null;
  handle: string;
  isOfficial: boolean;
  note: string;
};

/** Every platform with its state for one listing; missing means unknown. */
export function platformStatuses(
  listing: Listing,
  platforms: Platform[],
): PlatformStatus[] {
  const entries = new Map(listing.platforms.map((p) => [p.platform, p]));
  return platforms.map((platform) => {
    const entry = entries.get(platform.slug);
    return {
      platform,
      state: entry ? entry.availability : "unknown",
      url: entry?.url ?? null,
      handle: entry?.handle ?? "",
      isOfficial: entry?.isOfficial ?? true,
      note: entry?.note ?? "",
    };
  });
}

export function countStates(statuses: PlatformStatus[]) {
  const counts = { available: 0, not_available: 0, unknown: 0 };
  for (const status of statuses) counts[status.state] += 1;
  return counts;
}

export function groupStatuses(statuses: PlatformStatus[]) {
  const groups = new Map<PlatformGroup, PlatformStatus[]>();
  for (const status of statuses) {
    const group = status.platform.group;
    groups.set(group, [...(groups.get(group) ?? []), status]);
  }
  return platformGroups
    .filter((group) => groups.has(group.value))
    .map((group) => ({ group, statuses: groups.get(group.value)! }));
}

export function availablePlatformSlugs(listing: Listing): string[] {
  return listing.platforms
    .filter((p) => p.availability === "available" && p.platform)
    .map((p) => p.platform!);
}
