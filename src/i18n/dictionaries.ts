import type { Locale } from "./config";

const dictionaries = {
  en: () => import("./dictionaries/en.json").then((module) => module.default),
  km: () => import("./dictionaries/km.json").then((module) => module.default),
};

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["en"]>>;

export function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}
