import type { Metadata } from "next";
import { groupIcons } from "@/components/icons";
import { PageHeader } from "@/components/PageHeader";
import { TileList } from "@/components/TileList";
import { labelOf, listingCount, localName } from "@/i18n/helpers";
import { getPageContext } from "@/i18n/page";
import { getListings, getPlatforms } from "@/lib/content";
import { paths } from "@/lib/paths";
import { platformGroups } from "@/lib/taxonomy";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/platforms">): Promise<Metadata> {
  const { dict } = await getPageContext(params);
  return {
    title: dict.platforms.title,
    description: dict.platforms.description,
  };
}

export default async function PlatformsPage({
  params,
}: PageProps<"/[lang]/platforms">) {
  const { lang, dict } = await getPageContext(params);
  const [platforms, listings] = await Promise.all([
    getPlatforms(),
    getListings(),
  ]);

  const availableOn = (slug: string) =>
    listings.filter((listing) =>
      listing.platforms.some(
        (p) => p.platform === slug && p.availability === "available",
      ),
    ).length;

  return (
    <>
      <PageHeader
        title={dict.platforms.title}
        description={dict.platforms.description}
        crumbs={[{ href: paths.home(lang), label: dict.nav.home }]}
        crumbLabel={dict.nav.breadcrumb}
      />
      <div className="flex flex-col gap-8">
        {platformGroups.map((group) => {
          const inGroup = platforms.filter((p) => p.group === group.value);
          if (inGroup.length === 0) return null;
          return (
            <section key={group.value} className="flex flex-col gap-3">
              <h2 className="text-lg font-semibold">
                {labelOf(platformGroups, group.value, lang)}
              </h2>
              <TileList
                tiles={inGroup.map((platform) => ({
                  href: paths.platform(lang, platform.slug),
                  label: localName(platform, lang).primary,
                  count: listingCount(dict, availableOn(platform.slug)),
                  icon: groupIcons[platform.group],
                }))}
              />
            </section>
          );
        })}
      </div>
    </>
  );
}
