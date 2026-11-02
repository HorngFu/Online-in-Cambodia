import { getCategories, getListings } from "@/lib/content";
import type { SearchEntry } from "@/lib/search";

// Built once at build time and served as a static file.
export const dynamic = "force-static";

export async function GET() {
  const [listings, categories] = await Promise.all([
    getListings(),
    getCategories(),
  ]);
  const parentOf = new Map(categories.map((c) => [c.slug, c.parent]));

  const entries: SearchEntry[] = listings.map((listing) => {
    // Include parent categories so filtering by "Food & Drink" finds cafés.
    const categorySlugs = new Set<string>();
    for (const slug of listing.categories) {
      categorySlugs.add(slug);
      const parent = parentOf.get(slug);
      if (parent) categorySlugs.add(parent);
    }
    const byState = (state: "available" | "not_available") =>
      listing.platforms
        .filter((p) => p.availability === state && p.platform)
        .map((p) => p.platform!);

    const entry: SearchEntry = {
      s: listing.slug,
      n: listing.name,
      t: listing.type,
      c: [...categorySlugs],
      p: [...listing.provinces],
      a: byState("available"),
      x: byState("not_available"),
      v: listing.lastVerified,
    };
    if (listing.nameKm) entry.k = listing.nameKm;
    return entry;
  });

  return Response.json(entries, {
    headers: { "Cache-Control": "public, max-age=300, must-revalidate" },
  });
}
