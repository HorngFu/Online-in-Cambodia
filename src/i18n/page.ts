import { notFound } from "next/navigation";
import { hasLocale } from "./config";
import { getDictionary } from "./dictionaries";

/** Resolves the locale and dictionary for a page under /[lang]. */
export async function getPageContext(params: Promise<{ lang: string }>) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  return { lang, dict: await getDictionary(lang) };
}
