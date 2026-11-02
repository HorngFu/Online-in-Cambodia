import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { TileList } from "@/components/TileList";
import { listingCount, localName } from "@/i18n/helpers";
import { getPageContext } from "@/i18n/page";
import { getCategories, getListings, listingsInCategory } from "@/lib/content";
import { paths } from "@/lib/paths";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/categories">): Promise<Metadata> {
  const { dict } = await getPageContext(params);
  return {
    title: dict.categories.title,
    description: dict.categories.description,
  };
}

export default async function CategoriesPage({
  params,
}: PageProps<"/[lang]/categories">) {
  const { lang, dict } = await getPageContext(params);
  const [categories, listings] = await Promise.all([
    getCategories(),
    getListings(),
  ]);
  const topLevel = categories.filter((category) => !category.parent);

  return (
    <>
      <PageHeader
        title={dict.categories.title}
        description={dict.categories.description}
        crumbs={[{ href: paths.home(lang), label: dict.nav.home }]}
        crumbLabel={dict.nav.breadcrumb}
      />
      <div className="flex flex-col gap-8">
        {topLevel.map((parent) => {
          const children = categories.filter((c) => c.parent === parent.slug);
          const tile = (slug: string, name: ReturnType<typeof localName>) => ({
            href: paths.category(lang, slug),
            label: name.primary,
            sublabel: name.secondary,
            count: listingCount(
              dict,
              listingsInCategory(listings, categories, slug).length,
            ),
          });
          return (
            <section key={parent.slug} className="flex flex-col gap-3">
              <TileList
                tiles={[tile(parent.slug, localName(parent, lang))]}
                columns=""
              />
              {children.length > 0 && (
                <div className="ml-4 border-l border-border pl-4">
                  <TileList
                    tiles={children.map((child) =>
                      tile(child.slug, localName(child, lang)),
                    )}
                    columns="sm:grid-cols-2 lg:grid-cols-3"
                  />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </>
  );
}
