import type { Metadata } from "next";
import { ListingGrid } from "@/components/ListingGrid";
import { PageHeader } from "@/components/PageHeader";
import { getPageContext } from "@/i18n/page";
import { getListings, getPlatforms } from "@/lib/content";
import { paths } from "@/lib/paths";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/listings">): Promise<Metadata> {
  const { dict } = await getPageContext(params);
  return { title: dict.listings.title, description: dict.listings.description };
}

export default async function ListingsPage({
  params,
}: PageProps<"/[lang]/listings">) {
  const { lang, dict } = await getPageContext(params);
  const [listings, platforms] = await Promise.all([
    getListings(),
    getPlatforms(),
  ]);

  return (
    <>
      <PageHeader
        title={dict.listings.title}
        description={dict.listings.description}
        crumbs={[{ href: paths.home(lang), label: dict.nav.home }]}
        crumbLabel={dict.nav.breadcrumb}
      />
      <ListingGrid
        listings={listings}
        platforms={platforms}
        lang={lang}
        dict={dict}
      />
    </>
  );
}
