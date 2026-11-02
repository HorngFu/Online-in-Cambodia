import { Flag, Pencil } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { PlatformGrid } from "@/components/PlatformGrid";
import { format, formatDate, labelOf, localName } from "@/i18n/helpers";
import { getPageContext } from "@/i18n/page";
import {
  countStates,
  getCategories,
  getListing,
  getListings,
  getPlatforms,
  platformStatuses,
} from "@/lib/content";
import { githubLinks, paths, SITE_URL } from "@/lib/paths";
import { listingStatuses, listingTypes, provinces } from "@/lib/taxonomy";

export const dynamicParams = false;

export async function generateStaticParams() {
  const listings = await getListings();
  return listings.map((listing) => ({ slug: listing.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/listings/[slug]">): Promise<Metadata> {
  const { lang } = await getPageContext(params);
  const listing = await getListing((await params).slug);
  if (!listing) notFound();
  const description =
    lang === "km" && listing.descriptionKm
      ? listing.descriptionKm
      : listing.description;
  return {
    title: localName(listing, lang).primary,
    description: description || undefined,
  };
}

export default async function ListingPage({
  params,
}: PageProps<"/[lang]/listings/[slug]">) {
  const { lang, dict } = await getPageContext(params);
  const { slug } = await params;
  const [listing, platforms, categories] = await Promise.all([
    getListing(slug),
    getPlatforms(),
    getCategories(),
  ]);
  if (!listing) notFound();

  const name = localName(listing, lang);
  const description =
    lang === "km" && listing.descriptionKm
      ? listing.descriptionKm
      : listing.description;
  const statuses = platformStatuses(listing, platforms);
  const counts = countStates(statuses);
  // Absolute URL so the GitHub form links straight back to this listing.
  const listingUrl = `${SITE_URL}${paths.listing("en", slug)}`;
  const categoryBySlug = new Map(categories.map((c) => [c.slug, c]));

  return (
    <article>
      <PageHeader
        title={name.primary}
        subtitle={name.secondary}
        description={description}
        crumbs={[
          { href: paths.home(lang), label: dict.nav.home },
          { href: paths.listings(lang), label: dict.nav.listings },
        ]}
        crumbLabel={dict.nav.breadcrumb}
      >
        {listing.status !== "active" && (
          <p
            role="note"
            className="rounded-lg border border-border bg-surface px-3 py-2 text-sm"
          >
            {listing.status === "closed"
              ? dict.listing.closedNotice
              : dict.listing.unverifiedNotice}
          </p>
        )}
      </PageHeader>

      <div className="grid gap-10 lg:grid-cols-[1fr_16rem]">
        <section
          aria-labelledby="platforms-heading"
          className="flex flex-col gap-4"
        >
          <div>
            <h2 id="platforms-heading" className="text-xl font-semibold">
              {dict.listing.platforms}
            </h2>
            <p className="text-sm text-muted">
              {format(dict.listing.summary, {
                available: counts.available,
                notAvailable: counts.not_available,
                unknown: counts.unknown,
              })}
            </p>
          </div>
          <PlatformGrid statuses={statuses} lang={lang} dict={dict} />
        </section>

        <aside className="flex flex-col gap-6 text-sm">
          <section className="flex flex-col gap-3">
            <h2 className="font-semibold">{dict.listing.details}</h2>
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
              <dt className="text-muted">{dict.listing.type}</dt>
              <dd>
                <Link
                  href={paths.type(lang, listing.type)}
                  className="hover:underline"
                >
                  {labelOf(listingTypes, listing.type, lang)}
                </Link>
              </dd>
              <dt className="text-muted">{dict.listing.categories}</dt>
              <dd className="flex flex-col">
                {listing.categories.map((slug) => {
                  const category = categoryBySlug.get(slug);
                  return (
                    <Link
                      key={slug}
                      href={paths.category(lang, slug)}
                      className="hover:underline"
                    >
                      {category ? localName(category, lang).primary : slug}
                    </Link>
                  );
                })}
              </dd>
              {listing.provinces.length > 0 && (
                <>
                  <dt className="text-muted">{dict.listing.provinces}</dt>
                  <dd className="flex flex-col">
                    {listing.provinces.map((province) => (
                      <Link
                        key={province}
                        href={paths.province(lang, province)}
                        className="hover:underline"
                      >
                        {labelOf(provinces, province, lang)}
                      </Link>
                    ))}
                  </dd>
                </>
              )}
              <dt className="text-muted">{dict.listing.status}</dt>
              <dd>{labelOf(listingStatuses, listing.status, lang)}</dd>
              <dt className="text-muted">{dict.listing.lastVerified}</dt>
              <dd>
                <time dateTime={listing.lastVerified}>
                  {formatDate(listing.lastVerified, lang)}
                </time>
                {listing.verifiedBy &&
                  ` ${format(dict.listing.verifiedBy, { name: listing.verifiedBy })}`}
              </dd>
            </dl>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="font-semibold">{dict.listing.sources}</h2>
            <ul className="flex flex-col gap-1">
              {listing.sources.map((source) => (
                <li key={source} className="break-all">
                  <a
                    href={source}
                    rel="noopener nofollow"
                    className="text-accent hover:underline"
                  >
                    {source
                      .replace(/^https?:\/\/(www\.)?/, "")
                      .replace(/\/$/, "")}
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-2">
            <a
              href={githubLinks.correction(listingUrl)}
              className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2 font-medium text-accent-foreground hover:opacity-90"
            >
              <Pencil aria-hidden className="size-4" />
              {dict.listing.suggestEdit}
            </a>
            <a
              href={githubLinks.reportFake(listingUrl)}
              className="flex items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 hover:bg-surface"
            >
              <Flag aria-hidden className="size-4" />
              {dict.listing.reportFake}
            </a>
          </div>
        </aside>
      </div>
    </article>
  );
}
