import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import { getPageContext } from "@/i18n/page";
import { paths, REPO_URL } from "@/lib/paths";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/about">): Promise<Metadata> {
  const { dict } = await getPageContext(params);
  return { title: dict.about.title, description: dict.about.intro };
}

export default async function AboutPage({
  params,
}: PageProps<"/[lang]/about">) {
  const { lang, dict } = await getPageContext(params);
  const sections = [
    { title: dict.about.whyTitle, text: dict.about.why },
    { title: dict.about.howTitle, text: dict.about.how },
    { title: dict.about.openTitle, text: dict.about.open },
  ];

  return (
    <>
      <PageHeader
        title={dict.about.title}
        description={dict.about.intro}
        crumbs={[{ href: paths.home(lang), label: dict.nav.home }]}
        crumbLabel={dict.nav.breadcrumb}
      />
      <div className="flex max-w-2xl flex-col gap-8">
        {sections.map((section) => (
          <section key={section.title} className="flex flex-col gap-2">
            <h2 className="text-xl font-semibold">{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}
        <p className="flex flex-wrap gap-x-4 gap-y-2">
          <Link
            href={paths.contribute(lang)}
            className="text-accent hover:underline"
          >
            {dict.nav.contribute}
          </Link>
          <Link href={paths.data(lang)} className="text-accent hover:underline">
            {dict.footer.data}
          </Link>
          <a href={REPO_URL} className="text-accent hover:underline">
            {dict.footer.github}
          </a>
        </p>
      </div>
    </>
  );
}
