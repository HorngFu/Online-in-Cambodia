import type { ListingCardData } from "@/components/ListingCardView";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { format, labelOf, localName } from "@/i18n/helpers";
import { paths } from "./paths";
import { listingTypes, provinces, type PlatformGroup } from "./taxonomy";

/** The minimum a card needs; satisfied by both a Listing and a search entry. */
export type CardSource = {
  slug: string;
  name: string;
  nameKm?: string | null;
  type: string;
  provinces: readonly string[];
  available: readonly string[];
};

/** Builds card props. Pure, so it runs on the server and in the browser. */
export function toCardData(
  source: CardSource,
  platformGroup: Map<string, PlatformGroup>,
  lang: Locale,
  dict: Dictionary,
): ListingCardData {
  const name = localName(source, lang);
  const groups = [
    ...new Set(
      source.available
        .map((slug) => platformGroup.get(slug))
        .filter((group): group is PlatformGroup => Boolean(group)),
    ),
  ];
  const place = source.provinces
    .slice(0, 2)
    .map((p) => labelOf(provinces, p, lang))
    .join(", ");
  const meta = [
    labelOf(listingTypes, source.type, lang),
    place && `${place}${source.provinces.length > 2 ? " …" : ""}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    href: paths.listing(lang, source.slug),
    primary: name.primary,
    secondary: name.secondary,
    meta,
    groups,
    availableLabel: format(dict.listing.availableCount, {
      count: source.available.length,
    }),
  };
}
