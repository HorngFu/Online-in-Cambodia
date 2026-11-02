import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { listingCount } from "@/i18n/helpers";
import type { Listing, Platform } from "@/lib/content";
import { ListingCard } from "./ListingCard";

export function ListingGrid({
  listings,
  platforms,
  lang,
  dict,
  heading,
  showCount = true,
}: {
  listings: Listing[];
  platforms: Platform[];
  lang: Locale;
  dict: Dictionary;
  heading?: string;
  showCount?: boolean;
}) {
  return (
    <section className="flex flex-col gap-4 py-4">
      {(heading || showCount) && (
        <div className="flex items-baseline justify-between gap-4">
          {heading && <h2 className="text-xl font-semibold">{heading}</h2>}
          {showCount && (
            <p className="text-sm text-muted">
              {listingCount(dict, listings.length)}
            </p>
          )}
        </div>
      )}
      {listings.length === 0 ? (
        <p className="text-muted">{dict.listings.empty}</p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard
              key={listing.slug}
              listing={listing}
              platforms={platforms}
              lang={lang}
              dict={dict}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
