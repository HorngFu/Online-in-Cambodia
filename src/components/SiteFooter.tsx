import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { paths, REPO_URL } from "@/lib/paths";

export function SiteFooter({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  return (
    <footer className="mt-16 border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <p>{dict.footer.community}</p>
        <ul className="flex flex-wrap gap-x-5 gap-y-2">
          <li>
            <Link href={paths.about(lang)} className="hover:text-foreground">
              {dict.footer.about}
            </Link>
          </li>
          <li>
            <Link href={paths.data(lang)} className="hover:text-foreground">
              {dict.footer.data}
            </Link>
          </li>
          <li>
            <a href={REPO_URL} className="hover:text-foreground">
              {dict.footer.github}
            </a>
          </li>
          <li>{dict.footer.license}</li>
        </ul>
      </div>
    </footer>
  );
}
