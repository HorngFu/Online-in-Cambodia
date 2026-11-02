/**
 * Checks everything in content/ against rules the Keystatic schema can't
 * express (links match their platform, relationships exist, no duplicates...).
 *
 * Run: npm run validate
 * Exits with code 1 when there are errors; warnings never fail the build.
 */
import { statSync } from "node:fs";
import path from "node:path";
import { createReader } from "@keystatic/core/reader";
import keystaticConfig from "../keystatic.config";

const STALE_AFTER_MONTHS = 12;
const MAX_LOGO_BYTES = 50 * 1024;

const reader = createReader(process.cwd(), keystaticConfig);
const errors: string[] = [];
const warnings: string[] = [];

const error = (file: string, message: string) =>
  errors.push(`${file}: ${message}`);
const warn = (file: string, message: string) =>
  warnings.push(`${file}: ${message}`);

/** Reads every entry one by one so a broken file is reported, not fatal. */
async function readAll<T>(
  collection: {
    list(): Promise<string[]>;
    read(slug: string): Promise<T | null>;
  },
  dir: string,
) {
  const entries: { slug: string; file: string; entry: T }[] = [];
  for (const slug of await collection.list()) {
    const file = `content/${dir}/${slug}.yaml`;
    try {
      const entry = await collection.read(slug);
      if (entry) entries.push({ slug, file, entry });
    } catch (e) {
      error(file, `does not match the schema: ${(e as Error).message}`);
    }
  }
  return entries;
}

const normalizeName = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9ក-៿]+/g, "")
    .trim();

async function main() {
  const platforms = await readAll(reader.collections.platforms, "platforms");
  const categories = await readAll(reader.collections.categories, "categories");
  const listings = await readAll(reader.collections.listings, "listings");

  // Platforms: link patterns must be valid regular expressions.
  const platformPatterns = new Map<string, RegExp | null>();
  const linkRequired = new Map<string, boolean>();
  for (const { slug, file, entry } of platforms) {
    linkRequired.set(slug, entry.linkRequired);
    let pattern: RegExp | null = null;
    if (entry.urlPattern) {
      try {
        pattern = new RegExp(entry.urlPattern);
      } catch {
        error(file, `urlPattern is not a valid regular expression`);
      }
    }
    platformPatterns.set(slug, pattern);
  }

  // Categories: parent exists, no self-reference, at most two levels.
  const categoryParents = new Map(
    categories.map(({ slug, entry }) => [slug, entry.parent]),
  );
  for (const { slug, file, entry } of categories) {
    if (!entry.parent) continue;
    if (entry.parent === slug) error(file, "category is its own parent");
    else if (!categoryParents.has(entry.parent))
      error(file, `parent "${entry.parent}" does not exist`);
    else if (categoryParents.get(entry.parent))
      error(
        file,
        `parent "${entry.parent}" already has a parent (max 2 levels)`,
      );
  }

  // Listings.
  // CI runs in UTC while editors are in Cambodia (UTC+7), so "today" for an
  // editor can be tomorrow in UTC. Allow one day of leeway.
  const latestAllowed = new Date(Date.now() + 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const staleBefore = new Date();
  staleBefore.setMonth(staleBefore.getMonth() - STALE_AFTER_MONTHS);
  const seenNames = new Map<string, string>();

  for (const { file, entry } of listings) {
    const key = normalizeName(entry.name);
    const duplicateOf = seenNames.get(key);
    if (duplicateOf) error(file, `same name as ${duplicateOf}`);
    else seenNames.set(key, file);

    for (const category of entry.categories) {
      if (!categoryParents.has(category))
        error(file, `category "${category}" does not exist`);
    }

    const seenPlatforms = new Set<string>();
    for (const item of entry.platforms) {
      const label = `platform "${item.platform}"`;
      if (!item.platform) {
        error(file, "a platform entry has no platform selected");
        continue;
      }
      if (!platformPatterns.has(item.platform)) {
        error(file, `${label} does not exist`);
        continue;
      }
      if (seenPlatforms.has(item.platform))
        error(file, `${label} is listed more than once`);
      seenPlatforms.add(item.platform);

      if (item.availability === "available") {
        if (!item.url) {
          if (linkRequired.get(item.platform))
            error(file, `${label} is available but has no link`);
        } else {
          const pattern = platformPatterns.get(item.platform);
          if (pattern && !pattern.test(item.url))
            error(file, `${label} link ${item.url} doesn't match ${pattern}`);
        }
      } else if (item.url) {
        error(file, `${label} is not available but has a link`);
      }
    }

    if (entry.sources.length === 0) error(file, "needs at least one source");

    if (entry.lastVerified > latestAllowed)
      error(file, `lastVerified ${entry.lastVerified} is in the future`);
    else if (new Date(entry.lastVerified) < staleBefore)
      warn(
        file,
        `last verified ${entry.lastVerified}, older than ${STALE_AFTER_MONTHS} months`,
      );

    if (entry.logo) {
      const logoPath = path.join("public", entry.logo);
      try {
        const { size } = statSync(logoPath);
        if (size > MAX_LOGO_BYTES)
          warn(file, `logo is ${Math.round(size / 1024)} KB (max 50 KB)`);
      } catch {
        error(file, `logo ${logoPath} not found`);
      }
    }
  }

  for (const message of warnings) console.warn(`⚠️  ${message}`);
  for (const message of errors) console.error(`❌ ${message}`);
  console.log(
    `\nChecked ${listings.length} listings, ${platforms.length} platforms, ${categories.length} categories: ` +
      `${errors.length} error(s), ${warnings.length} warning(s).`,
  );
  if (errors.length > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
