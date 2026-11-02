import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingGrid } from "@/components/ListingGrid";
import { PageHeader, type Crumb } from "@/components/PageHeader";
import { TileList } from "@/components/TileList";
import { listingCount, localName } from "@/i18n/helpers";
import { getPageContext } from "@/i18n/page";
import {
  getCategories,
  getListings,
  getPlatforms,
  listingsInCategory,
} from "@/lib/content";
import { paths } from "@/lib/paths";

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/categories/[slug]">): Promise<Metadata> {
  const { lang } = await getPageContext(params);
  const { slug } = await params;
  const category = (await getCategories()).find((c) => c.slug === slug);
  if (!category) notFound();
  return { title: localName(category, lang).primary };
}

export default async function CategoryPage({
  params,
}: PageProps<"/[lang]/categories/[slug]">) {
  const { lang, dict } = await getPageContext(params);
  const { slug } = await params;
  const [categories, listings, platforms] = await Promise.all([
    getCategories(),
    getListings(),
    getPlatforms(),
  ]);
  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const name = localName(category, lang);
  const parent = categories.find((c) => c.slug === category.parent);
  const children = categories.filter((c) => c.parent === slug);
  const crumbs: Crumb[] = [
    { href: paths.home(lang), label: dict.nav.home },
    { href: paths.categories(lang), label: dict.nav.categories },
  ];
  if (parent) {
    crumbs.push({
      href: paths.category(lang, parent.slug),
      label: localName(parent, lang).primary,
    });
  }

  return (
    <>
      <PageHeader
        title={name.primary}
        subtitle={name.secondary}
        crumbs={crumbs}
        crumbLabel={dict.nav.breadcrumb}
      />
      {children.length > 0 && (
        <section className="flex flex-col gap-3 pb-4">
          <h2 className="text-sm font-semibold text-muted">
            {dict.categories.subcategories}
          </h2>
          <TileList
            tiles={children.map((child) => {
              const childName = localName(child, lang);
              return {
                href: paths.category(lang, child.slug),
                label: childName.primary,
                sublabel: childName.secondary,
                count: listingCount(
                  dict,
                  listingsInCategory(listings, categories, child.slug).length,
                ),
              };
            })}
          />
        </section>
      )}
      <ListingGrid
        listings={listingsInCategory(listings, categories, slug)}
        platforms={platforms}
        lang={lang}
        dict={dict}
      />
    </>
  );
}
