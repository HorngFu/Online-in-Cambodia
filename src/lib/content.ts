import { createReader, type Entry } from "@keystatic/core/reader";
import keystaticConfig from "../../keystatic.config";
import { platformGroups } from "./taxonomy";

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
