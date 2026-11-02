import type { Locale } from "./config";
import type { Dictionary } from "./dictionaries";
import type { Labelled } from "@/lib/taxonomy";

/** Replaces {name} placeholders: format("{count} listings", { count: 3 }). */
export function format(
  template: string,
  values: Record<string, string | number>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

/** The label of a taxonomy value (type, province...) in the given language. */
export function labelOf(
  items: readonly Labelled[],
  value: string,
  lang: Locale,
): string {
  const item = items.find((entry) => entry.value === value);
  if (!item) return value;
  return lang === "km" ? item.labelKm : item.label;
}

/**
 * Names in the page language first, with the other language as a subtitle.
 * Falls back to English when there is no Khmer name.
 */
export function localName(
  entity: { name: string; nameKm?: string | null },
  lang: Locale,
): { primary: string; secondary: string | null } {
  const km = entity.nameKm?.trim() || null;
  if (lang === "km" && km) return { primary: km, secondary: entity.name };
  return { primary: entity.name, secondary: km };
}

export function listingCount(dict: Dictionary, count: number): string {
  return count === 1
    ? dict.listings.countOne
    : format(dict.listings.count, { count });
}

const dateFormats: Record<Locale, string> = { en: "en-GB", km: "km-KH" };

/** "2 Nov 2026" / Khmer equivalent, for YYYY-MM-DD dates. */
export function formatDate(date: string, lang: Locale): string {
  return new Intl.DateTimeFormat(dateFormats[lang], {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}
