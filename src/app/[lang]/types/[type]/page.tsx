import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingGrid } from "@/components/ListingGrid";
import { PageHeader } from "@/components/PageHeader";
import { labelOf } from "@/i18n/helpers";
import { getPageContext } from "@/i18n/page";
import { getListings, getPlatforms } from "@/lib/content";
import { paths } from "@/lib/paths";
import { listingTypes } from "@/lib/taxonomy";

export const dynamicParams = false;

export function generateStaticParams() {
  return listingTypes.map((type) => ({ type: type.value }));
}

function isListingType(value: string) {
  return listingTypes.some((type) => type.value === value);
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/types/[type]">): Promise<Metadata> {
  const { lang } = await getPageContext(params);
  const { type } = await params;
  if (!isListingType(type)) notFound();
  return { title: labelOf(listingTypes, type, lang) };
}

export default async function TypePage({
  params,
}: PageProps<"/[lang]/types/[type]">) {
  const { lang, dict } = await getPageContext(params);
  const { type } = await params;
  if (!isListingType(type)) notFound();

  const [listings, platforms] = await Promise.all([
    getListings(),
    getPlatforms(),
  ]);

  return (
    <>
      <PageHeader
        title={labelOf(listingTypes, type, lang)}
        crumbs={[
          { href: paths.home(lang), label: dict.nav.home },
          { href: paths.listings(lang), label: dict.nav.listings },
        ]}
        crumbLabel={dict.nav.breadcrumb}
      />
      <ListingGrid
        listings={listings.filter((listing) => listing.type === type)}
        platforms={platforms}
        lang={lang}
        dict={dict}
      />
    </>
  );
}
