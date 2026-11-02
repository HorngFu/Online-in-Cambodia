import { Code, Flag, Pencil, Plus, UserPlus } from "lucide-react";
import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { getPageContext } from "@/i18n/page";
import { githubLinks, paths } from "@/lib/paths";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contribute">): Promise<Metadata> {
  const { dict } = await getPageContext(params);
  return { title: dict.contribute.title, description: dict.contribute.intro };
}

export default async function ContributePage({
  params,
}: PageProps<"/[lang]/contribute">) {
  const { lang, dict } = await getPageContext(params);
  const ways = [
    {
      icon: Plus,
      title: dict.contribute.suggestTitle,
      text: dict.contribute.suggestText,
      href: githubLinks.newListing(),
    },
    {
      icon: Pencil,
      title: dict.contribute.correctTitle,
      text: dict.contribute.correctText,
      href: githubLinks.correction(),
    },
    {
      icon: Flag,
      title: dict.contribute.fakeTitle,
      text: dict.contribute.fakeText,
      href: githubLinks.reportFake(),
    },
    {
      icon: UserPlus,
      title: dict.contribute.editorTitle,
      text: dict.contribute.editorText,
      href: githubLinks.editorRequest(),
    },
    {
      icon: Code,
      title: dict.contribute.codeTitle,
      text: dict.contribute.codeText,
      href: githubLinks.contributing(),
    },
  ];

  return (
    <>
      <PageHeader
        title={dict.contribute.title}
        description={dict.contribute.intro}
        crumbs={[{ href: paths.home(lang), label: dict.nav.home }]}
        crumbLabel={dict.nav.breadcrumb}
      />
      <ul className="grid gap-3 sm:grid-cols-2">
        {ways.map(({ icon: Icon, title, text, href }) => (
          <li key={title}>
            <a
              href={href}
              className="flex h-full gap-3 rounded-xl border border-border p-4 transition-colors hover:border-accent hover:bg-surface"
            >
              <Icon aria-hidden className="mt-1 size-5 shrink-0 text-accent" />
              <span>
                <span className="block font-semibold">{title}</span>
                <span className="block text-sm text-muted">{text}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-sm text-muted">{dict.contribute.githubNote}</p>
    </>
  );
}
