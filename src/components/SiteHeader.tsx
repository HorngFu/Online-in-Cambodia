import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { paths } from "@/lib/paths";
import { LanguageSwitch } from "./LanguageSwitch";

export function SiteHeader({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const links = [
    { href: paths.listings(lang), label: dict.nav.listings },
    { href: paths.categories(lang), label: dict.nav.categories },
    { href: paths.provinces(lang), label: dict.nav.provinces },
    { href: paths.platforms(lang), label: dict.nav.platforms },
    { href: paths.contribute(lang), label: dict.nav.contribute },
  ];

  return (
    <header className="border-b border-border">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-10 focus:rounded focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
      >
        {dict.nav.skipToContent}
      </a>
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
        <Link href={paths.home(lang)} className="font-bold tracking-tight">
          {dict.site.name}
        </Link>
        <LanguageSwitch
          lang={lang}
          text={dict.language.switchTo}
          label={dict.language.switchLabel}
        />
      </div>
      <nav aria-label={dict.nav.mainNav} className="mx-auto max-w-5xl px-4">
        <ul className="-mb-px flex flex-wrap gap-x-5 text-sm text-muted">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="inline-block border-b-2 border-transparent pb-2 hover:border-current hover:text-foreground"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
