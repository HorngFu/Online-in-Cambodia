import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { getPageContext } from "@/i18n/page";
import { githubLinks, paths } from "@/lib/paths";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/data">): Promise<Metadata> {
  const { dict } = await getPageContext(params);
  return { title: dict.data.title, description: dict.data.intro };
}

export default async function DataPage({ params }: PageProps<"/[lang]/data">) {
  const { lang, dict } = await getPageContext(params);

  return (
    <>
      <PageHeader
        title={dict.data.title}
        description={dict.data.intro}
        crumbs={[{ href: paths.home(lang), label: dict.nav.home }]}
        crumbLabel={dict.nav.breadcrumb}
      />
      <div className="flex max-w-2xl flex-col gap-8">
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">{dict.data.creditTitle}</h2>
          <p className="rounded-lg bg-surface px-4 py-3 font-mono text-sm">
            {dict.data.credit}
          </p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">{dict.data.downloadTitle}</h2>
          <p>{dict.data.download}</p>
          <a
            href={githubLinks.contentFolder()}
            className="self-start text-accent hover:underline"
          >
            github.com/HorngFu/Online-in-Cambodia/tree/main/content
          </a>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">{dict.data.logosTitle}</h2>
          <p>{dict.data.logos}</p>
        </section>
        <section className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">
            {dict.data.correctionsTitle}
          </h2>
          <p>{dict.data.corrections}</p>
          <a
            href={githubLinks.correction()}
            className="self-start text-accent hover:underline"
          >
            {dict.listing.suggestEdit}
          </a>
        </section>
      </div>
    </>
  );
}
