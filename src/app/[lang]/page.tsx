import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";
import { typeIcons } from "@/components/icons";
import { ListingGrid } from "@/components/ListingGrid";
import { TileList } from "@/components/TileList";
import { labelOf, listingCount, localName } from "@/i18n/helpers";
import { getPageContext } from "@/i18n/page";
import {
  getCategories,
  getListings,
  getPlatforms,
  listingsInCategory,
} from "@/lib/content";
import { githubLinks, paths } from "@/lib/paths";
import { listingTypes, provinces } from "@/lib/taxonomy";

function SectionHeading({
  title,
  href,
  linkLabel,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {href && (
        <Link
          href={href}
          className="flex items-center gap-1 text-sm text-accent hover:underline"
        >
          {linkLabel}
          <ArrowRight aria-hidden className="size-3.5" />
        </Link>
      )}
    </div>
  );
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang, dict } = await getPageContext(params);
  const [listings, platforms, categories] = await Promise.all([
    getListings(),
    getPlatforms(),
    getCategories(),
  ]);

  const provinceCounts = provinces
    .map((province) => ({
      province,
      count: listings.filter((l) => l.provinces.includes(province.value))
        .length,
    }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count);
  const coveredProvinces = provinceCounts.filter(
    ({ province }) => province.value !== "nationwide",
  ).length;
  const recentlyVerified = [...listings]
    .sort(
      (a, b) =>
        b.lastVerified.localeCompare(a.lastVerified) ||
        a.name.localeCompare(b.name),
    )
    .slice(0, 6);

  const stats = [
    { value: listings.length, label: dict.home.statListings },
    { value: platforms.length, label: dict.home.statPlatforms },
    { value: categories.length, label: dict.home.statCategories },
    { value: coveredProvinces, label: dict.home.statProvinces },
  ];

  return (
    <div className="flex flex-col gap-12 pb-4">
      <section className="flex flex-col gap-6 pt-12 sm:pt-16">
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
          {dict.home.heroTitle}
        </h1>
        <p className="max-w-2xl text-lg text-muted">{dict.home.heroText}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href={paths.listings(lang)}
            className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-foreground hover:opacity-90"
          >
            {dict.home.browseListings}
            <ArrowRight aria-hidden className="size-4" />
          </Link>
          <a
            href={githubLinks.newListing()}
            className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 font-medium hover:bg-surface"
          >
            <Plus aria-hidden className="size-4" />
            {dict.home.howToHelp}
          </a>
        </div>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col-reverse rounded-xl bg-surface px-4 py-3"
            >
              <dt className="text-sm text-muted">{stat.label}</dt>
              <dd className="text-2xl font-bold">{stat.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading title={dict.home.browseByType} />
        <TileList
          tiles={listingTypes
            .map((type) => ({
              type,
              count: listings.filter((l) => l.type === type.value).length,
            }))
            .filter(({ count }) => count > 0)
            .map(({ type, count }) => ({
              href: paths.type(lang, type.value),
              label: labelOf(listingTypes, type.value, lang),
              count: String(count),
              icon: typeIcons[type.value],
            }))}
        />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading
          title={dict.home.browseByCategory}
          href={paths.categories(lang)}
          linkLabel={dict.home.viewAll}
        />
        <TileList
          tiles={categories
            .filter((category) => !category.parent)
            .map((category) => ({
              category,
              count: listingsInCategory(listings, categories, category.slug)
                .length,
            }))
            .filter(({ count }) => count > 0)
            .map(({ category, count }) => ({
              href: paths.category(lang, category.slug),
              label: localName(category, lang).primary,
              count: String(count),
            }))}
        />
      </section>

      <section className="flex flex-col gap-4">
        <SectionHeading
          title={dict.home.browseByProvince}
          href={paths.provinces(lang)}
          linkLabel={dict.home.viewAll}
        />
        <TileList
          tiles={provinceCounts.slice(0, 8).map(({ province, count }) => ({
            href: paths.province(lang, province.value),
            label: lang === "km" ? province.labelKm : province.label,
            count: listingCount(dict, count),
          }))}
        />
      </section>

      <section className="flex flex-col gap-2">
        <SectionHeading
          title={dict.home.recentlyVerified}
          href={paths.listings(lang)}
          linkLabel={dict.home.viewAll}
        />
        <ListingGrid
          listings={recentlyVerified}
          platforms={platforms}
          lang={lang}
          dict={dict}
          showCount={false}
        />
      </section>

      <section className="flex flex-col items-start gap-3 rounded-2xl bg-surface p-6 sm:p-8">
        <h2 className="text-2xl font-bold">{dict.home.ctaTitle}</h2>
        <p className="text-muted">{dict.home.ctaText}</p>
        <a
          href={githubLinks.newListing()}
          className="flex items-center gap-2 rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-foreground hover:opacity-90"
        >
          <Plus aria-hidden className="size-4" />
          {dict.home.ctaButton}
        </a>
      </section>
    </div>
  );
}
