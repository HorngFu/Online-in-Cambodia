"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n/config";

/** Links to the same page in the other language. */
export function LanguageSwitch({
  lang,
  text,
  label,
}: {
  lang: Locale;
  text: string;
  label: string;
}) {
  const pathname = usePathname() ?? `/${lang}`;
  const other: Locale = lang === "en" ? "km" : "en";
  const href = pathname.replace(/^\/(en|km)(?=\/|$)/, `/${other}`);

  return (
    <Link
      href={href}
      hrefLang={other}
      className="shrink-0 rounded-full border border-border px-3 py-1 text-sm hover:bg-surface"
    >
      {/* The visible text must be part of the accessible name. */}
      <span lang={other}>{text}</span>
      <span className="sr-only"> ({label})</span>
    </Link>
  );
}
