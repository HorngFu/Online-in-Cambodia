import type { Metadata } from "next";
import { ListingGrid } from "@/components/ListingGrid";
import { ListingsExplorer, type Facets } from "@/components/ListingsExplorer";
import { PageHeader } from "@/components/PageHeader";
import { localName } from "@/i18n/helpers";
import { getPageContext } from "@/i18n/page";
import { getCategories, getListings, getPlatforms } from "@/lib/content";
import { paths } from "@/lib/paths";
import { listingTypes, provinces } from "@/lib/taxonomy";

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
  const [listings, platforms, categories] = await Promise.all([
    getListings(),
    getPlatforms(),
    getCategories(),
  ]);

  const both = (en: string, km?: string | null) => `${en} ${km ?? ""}`;
  // Parents first, each followed by its indented subcategories.
  const categoryOptions = categories
    .filter((category) => !category.parent)
    .flatMap((parent) => [
      { value: parent.slug, label: localName(parent, lang).primary },
      ...categories
        .filter((child) => child.parent === parent.slug)
        .map((child) => ({
          value: child.slug,
          label: `   ${localName(child, lang).primary}`,
        })),
    ]);

  const facets: Facets = {
    types: listingTypes.map((type) => ({
      value: type.value,
      label: lang === "km" ? type.labelKm : type.label,
    })),
    categories: categoryOptions,
    provinces: provinces.map((province) => ({
      value: province.value,
      label: lang === "km" ? province.labelKm : province.label,
    })),
    platforms: platforms.map((platform) => ({
      value: platform.slug,
      label: localName(platform, lang).primary,
      group: platform.group,
    })),
    terms: {
      categories: Object.fromEntries(
        categories.map((c) => [c.slug, both(c.name, c.nameKm)]),
      ),
      types: Object.fromEntries(
        listingTypes.map((t) => [t.value, both(t.label, t.labelKm)]),
      ),
      provinces: Object.fromEntries(
        provinces.map((p) => [p.value, both(p.label, p.labelKm)]),
      ),
    },
  };

  return (
    <>
      <PageHeader
        title={dict.listings.title}
        description={dict.listings.description}
        crumbs={[{ href: paths.home(lang), label: dict.nav.home }]}
        crumbLabel={dict.nav.breadcrumb}
      />
      <ListingsExplorer lang={lang} dict={dict} facets={facets}>
        <ListingGrid
          listings={listings}
          platforms={platforms}
          lang={lang}
          dict={dict}
          showCount={false}
        />
      </ListingsExplorer>
    </>
  );
}
