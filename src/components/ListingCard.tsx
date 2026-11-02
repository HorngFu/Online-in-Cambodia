import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { toCardData } from "@/lib/card-data";
import {
  availablePlatformSlugs,
  type Listing,
  type Platform,
} from "@/lib/content";
import { ListingCardView } from "./ListingCardView";

export function ListingCard({
  listing,
  platforms,
  lang,
  dict,
}: {
  listing: Listing;
  platforms: Platform[];
  lang: Locale;
  dict: Dictionary;
}) {
  const platformGroup = new Map(platforms.map((p) => [p.slug, p.group]));
  return (
    <ListingCardView
      {...toCardData(
        {
          slug: listing.slug,
          name: listing.name,
          nameKm: listing.nameKm,
          type: listing.type,
          provinces: listing.provinces,
          available: availablePlatformSlugs(listing),
        },
        platformGroup,
        lang,
        dict,
      )}
    />
  );
}
