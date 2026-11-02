import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StateIcon } from "@/components/icons";
import { ListingGrid } from "@/components/ListingGrid";
import { PageHeader } from "@/components/PageHeader";
import { format, labelOf, localName } from "@/i18n/helpers";
import { getPageContext } from "@/i18n/page";
import { getListings, getPlatforms } from "@/lib/content";
import { paths } from "@/lib/paths";
import { platformGroups } from "@/lib/taxonomy";

export const dynamicParams = false;

export async function generateStaticParams() {
  const platforms = await getPlatforms();
  return platforms.map((platform) => ({ slug: platform.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/platforms/[slug]">): Promise<Metadata> {
  const { lang, dict } = await getPageContext(params);
  const { slug } = await params;
  const platform = (await getPlatforms()).find((p) => p.slug === slug);
  if (!platform) notFound();
  const name = localName(platform, lang).primary;
  return {
    title: name,
    description: format(dict.platforms.onPlatform, { platform: name }),
  };
}

export default async function PlatformPage({
  params,
}: PageProps<"/[lang]/platforms/[slug]">) {
  const { lang, dict } = await getPageContext(params);
  const { slug } = await params;
  const [platforms, listings] = await Promise.all([
    getPlatforms(),
    getListings(),
  ]);
  const platform = platforms.find((p) => p.slug === slug);
  if (!platform) notFound();

  const name = localName(platform, lang).primary;
  const stateOf = (listing: (typeof listings)[number]) =>
    listing.platforms.find((p) => p.platform === slug)?.availability;
  const onPlatform = listings.filter((l) => stateOf(l) === "available");
  const notOnPlatform = listings.filter((l) => stateOf(l) === "not_available");
  const unknownCount =
    listings.length - onPlatform.length - notOnPlatform.length;

  return (
    <>
      <PageHeader
        title={name}
        subtitle={labelOf(platformGroups, platform.group, lang)}
        crumbs={[
          { href: paths.home(lang), label: dict.nav.home },
          { href: paths.platforms(lang), label: dict.nav.platforms },
        ]}
        crumbLabel={dict.nav.breadcrumb}
      >
        {!platform.linkRequired && (
          <p className="text-sm text-muted">{dict.platforms.linkOptional}</p>
        )}
      </PageHeader>

      <ListingGrid
        heading={format(dict.platforms.onPlatform, { platform: name })}
        listings={onPlatform}
        platforms={platforms}
        lang={lang}
        dict={dict}
      />
      <ListingGrid
        heading={format(dict.platforms.notOnPlatform, { platform: name })}
        listings={notOnPlatform}
        platforms={platforms}
        lang={lang}
        dict={dict}
      />
      {unknownCount > 0 && (
        <p className="mt-2 flex items-center gap-2 text-sm text-muted">
          <StateIcon state="unknown" />
          {format(dict.platforms.unknownCount, {
            count: unknownCount,
            platform: name,
          })}
        </p>
      )}
    </>
  );
}
