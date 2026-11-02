import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingGrid } from "@/components/ListingGrid";
import { PageHeader } from "@/components/PageHeader";
import { format } from "@/i18n/helpers";
import { getPageContext } from "@/i18n/page";
import { getListings, getPlatforms } from "@/lib/content";
import { paths } from "@/lib/paths";
import { provinces } from "@/lib/taxonomy";

export const dynamicParams = false;

export function generateStaticParams() {
  return provinces.map((province) => ({ slug: province.value }));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/provinces/[slug]">): Promise<Metadata> {
  const { lang } = await getPageContext(params);
  const { slug } = await params;
  const province = provinces.find((p) => p.value === slug);
  if (!province) notFound();
  return { title: lang === "km" ? province.labelKm : province.label };
}

export default async function ProvincePage({
  params,
}: PageProps<"/[lang]/provinces/[slug]">) {
  const { lang, dict } = await getPageContext(params);
  const { slug } = await params;
  const province = provinces.find((p) => p.value === slug);
  if (!province) notFound();

  const [listings, platforms] = await Promise.all([
    getListings(),
    getPlatforms(),
  ]);
  const title = lang === "km" ? province.labelKm : province.label;
  const local = listings.filter((l) => l.provinces.includes(province.value));
  const nationwide =
    slug === "nationwide"
      ? []
      : listings.filter(
          (l) =>
            l.provinces.includes("nationwide") &&
            !l.provinces.includes(province.value),
        );

  return (
    <>
      <PageHeader
        title={title}
        subtitle={lang === "km" ? province.label : province.labelKm}
        crumbs={[
          { href: paths.home(lang), label: dict.nav.home },
          { href: paths.provinces(lang), label: dict.nav.provinces },
        ]}
        crumbLabel={dict.nav.breadcrumb}
      />
      <ListingGrid
        heading={
          slug === "nationwide"
            ? undefined
            : format(dict.provinces.local, { province: title })
        }
        listings={local}
        platforms={platforms}
        lang={lang}
        dict={dict}
      />
      {nationwide.length > 0 && (
        <ListingGrid
          heading={dict.provinces.nationwide}
          listings={nationwide}
          platforms={platforms}
          lang={lang}
          dict={dict}
        />
      )}
    </>
  );
}
