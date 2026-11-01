import Link from "next/link";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { reader } from "@/lib/content";

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);
  const listings = await reader.collections.listings.list();
  const otherLang = lang === "en" ? "km" : "en";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center gap-8 px-4 py-16">
      <nav className="flex justify-end">
        <Link
          href={`/${otherLang}`}
          hrefLang={otherLang}
          className="rounded-full border border-current px-3 py-1 text-sm text-muted hover:text-foreground"
        >
          {dict.language.switchTo}
        </Link>
      </nav>

      <header className="flex flex-col gap-4">
        <h1 className="text-4xl font-bold tracking-tight">{dict.site.name}</h1>
        <p className="text-lg text-muted">{dict.site.tagline}</p>
      </header>

      <p>{dict.home.comingSoon}</p>

      <p className="text-sm text-muted">
        {dict.home.listingsCount}: <strong>{listings.length}</strong>
      </p>

      <a
        href="https://github.com/HorngFu/Online-in-Cambodia"
        className="self-start rounded-lg bg-accent px-4 py-2 font-medium text-background hover:opacity-90"
      >
        {dict.home.contribute}
      </a>
    </main>
  );
}
