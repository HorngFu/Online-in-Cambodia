import { MapPin } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { TileList } from "@/components/TileList";
import { listingCount } from "@/i18n/helpers";
import { getPageContext } from "@/i18n/page";
import { getListings } from "@/lib/content";
import { paths } from "@/lib/paths";
import { provinces } from "@/lib/taxonomy";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/provinces">): Promise<Metadata> {
  const { dict } = await getPageContext(params);
  return {
    title: dict.provinces.title,
    description: dict.provinces.description,
  };
}

export default async function ProvincesPage({
  params,
}: PageProps<"/[lang]/provinces">) {
  const { lang, dict } = await getPageContext(params);
  const listings = await getListings();

  return (
    <>
      <PageHeader
        title={dict.provinces.title}
        description={dict.provinces.description}
        crumbs={[{ href: paths.home(lang), label: dict.nav.home }]}
        crumbLabel={dict.nav.breadcrumb}
      />
      <TileList
        tiles={provinces.map((province) => ({
          href: paths.province(lang, province.value),
          label: lang === "km" ? province.labelKm : province.label,
          sublabel: lang === "km" ? province.label : province.labelKm,
          count: listingCount(
            dict,
            listings.filter((l) => l.provinces.includes(province.value)).length,
          ),
          icon: MapPin,
        }))}
        columns="sm:grid-cols-2 lg:grid-cols-3"
      />
      <p className="mt-6 text-sm text-muted">{dict.provinces.nationwideNote}</p>
    </>
  );
}
