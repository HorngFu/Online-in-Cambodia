import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { format, labelOf, localName } from "@/i18n/helpers";
import {
  availablePlatformSlugs,
  type Listing,
  type Platform,
} from "@/lib/content";
import { paths } from "@/lib/paths";
import { listingTypes, provinces } from "@/lib/taxonomy";
import { groupIcons } from "./icons";

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
  const name = localName(listing, lang);
  const available = new Set(availablePlatformSlugs(listing));
  // One icon per platform group the listing is present in.
  const groups = [
    ...new Set(
      platforms.filter((p) => available.has(p.slug)).map((p) => p.group),
    ),
  ];
  const place = listing.provinces
    .slice(0, 2)
    .map((p) => labelOf(provinces, p, lang))
    .join(", ");

  return (
    <li>
      <Link
        href={paths.listing(lang, listing.slug)}
        className="flex h-full flex-col gap-3 rounded-xl border border-border p-4 transition-colors hover:border-accent hover:bg-surface"
      >
        <div>
          <h3 className="font-semibold">{name.primary}</h3>
          {name.secondary && (
            <p className="text-sm text-muted">{name.secondary}</p>
          )}
        </div>
        <p className="text-sm text-muted">
          {labelOf(listingTypes, listing.type, lang)}
          {place && ` · ${place}`}
          {listing.provinces.length > 2 && " …"}
        </p>
        <div className="mt-auto flex items-center gap-2 text-sm">
          <span className="flex gap-1 text-available" aria-hidden>
            {groups.map((group) => {
              const Icon = groupIcons[group];
              return <Icon key={group} className="size-4" />;
            })}
          </span>
          <span className="text-muted">
            {format(dict.listing.availableCount, { count: available.size })}
          </span>
        </div>
      </Link>
    </li>
  );
}
