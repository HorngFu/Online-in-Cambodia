"use client";

import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { format } from "@/i18n/helpers";
import { toCardData } from "@/lib/card-data";
import { githubLinks } from "@/lib/paths";
import {
  applyFilters,
  defaultFilters,
  filtersFromSearch,
  filtersToSearch,
  hasActiveFilters,
  prepare,
  type Filters,
  type SearchEntry,
} from "@/lib/search";
import type { PlatformGroup } from "@/lib/taxonomy";
import { ListingCardView } from "./ListingCardView";

export type Option = { value: string; label: string };

export type Facets = {
  types: Option[];
  /** Subcategories have their label indented by the server. */
  categories: Option[];
  provinces: Option[];
  platforms: (Option & { group: PlatformGroup })[];
  /** Words a listing can also be found by: category/type/province names in both languages. */
  terms: {
    categories: Record<string, string>;
    types: Record<string, string>;
    provinces: Record<string, string>;
  };
};

const searchListeners = new Set<() => void>();

function subscribeToSearch(listener: () => void) {
  searchListeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    searchListeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

function setSearch(search: string) {
  const url = `${window.location.pathname}${search}`;
  window.history.replaceState(window.history.state, "", url);
  searchListeners.forEach((listener) => listener());
}

const fieldClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-accent focus:outline-none";

function Select({
  label,
  value,
  onChange,
  options,
  anyLabel,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  anyLabel?: string;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-muted">{label}</span>
      <select
        className={fieldClass}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {anyLabel !== undefined && <option value="">{anyLabel}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/**
 * Search box and filters for the listings page. Loads /search-index.json and
 * filters in the browser. Until it loads (or without JavaScript) the
 * server-rendered list passed as `children` is shown.
 */
export function ListingsExplorer({
  lang,
  dict,
  facets,
  children,
}: {
  lang: Locale;
  dict: Dictionary;
  facets: Facets;
  children: ReactNode;
}) {
  const t = dict.search;
  const [entries, setEntries] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);

  // The URL query string is the source of truth, so filtered views can be
  // shared and the back button works.
  const search = useSyncExternalStore(
    subscribeToSearch,
    () => window.location.search,
    () => "",
  );
  const filters = useMemo(() => filtersFromSearch(search), [search]);

  useEffect(() => {
    let cancelled = false;
    fetch("/search-index.json")
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json() as Promise<SearchEntry[]>;
      })
      .then((data) => !cancelled && setEntries(data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, []);

  const prepared = useMemo(
    () =>
      entries &&
      prepare(entries, (entry) => [
        ...entry.c.map((slug) => facets.terms.categories[slug] ?? ""),
        facets.terms.types[entry.t] ?? "",
        ...entry.p.map((slug) => facets.terms.provinces[slug] ?? ""),
      ]),
    [entries, facets.terms],
  );
  const results = useMemo(
    () => (prepared ? applyFilters(prepared, filters) : null),
    [prepared, filters],
  );
  const platformGroup = useMemo(
    () => new Map(facets.platforms.map((p) => [p.value, p.group])),
    [facets.platforms],
  );

  const [showFilters, setShowFilters] = useState(false);
  const activeCount = [
    filters.type,
    filters.category,
    filters.province,
    filters.platform,
  ].filter(Boolean).length;

  const setFilters = (next: Filters) => setSearch(filtersToSearch(next));
  const update = (patch: Partial<Filters>) =>
    setFilters({ ...filters, ...patch });
  const active = hasActiveFilters(filters);

  return (
    <div className="flex flex-col gap-4">
      <form
        role="search"
        action=""
        onSubmit={(event) => event.preventDefault()}
        className="flex flex-col gap-4 rounded-xl border border-border p-4"
      >
        <label className="relative block">
          <span className="sr-only">{t.label}</span>
          <Search
            aria-hidden
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          />
          <input
            type="search"
            name="q"
            value={filters.q}
            onChange={(event) => update({ q: event.target.value })}
            placeholder={t.placeholder}
            autoComplete="off"
            className={`${fieldClass} py-2.5 pl-9 text-base`}
          />
        </label>

        {/* On phones the filters fold away so results stay near the top. */}
        <button
          type="button"
          aria-expanded={showFilters}
          aria-controls="listing-filters"
          onClick={() => setShowFilters((open) => !open)}
          className="flex items-center gap-2 self-start rounded-lg border border-border px-3 py-1.5 text-sm sm:hidden"
        >
          <SlidersHorizontal aria-hidden className="size-4" />
          {t.filters}
          {activeCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-xs text-accent-foreground">
              {activeCount}
            </span>
          )}
        </button>

        <fieldset
          id="listing-filters"
          className={`${showFilters ? "grid" : "hidden"} gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-4`}
        >
          <legend className="sr-only">{t.filters}</legend>
          <Select
            label={t.type}
            value={filters.type}
            onChange={(type) => update({ type })}
            options={facets.types}
            anyLabel={t.anyType}
          />
          <Select
            label={t.category}
            value={filters.category}
            onChange={(category) => update({ category })}
            options={facets.categories}
            anyLabel={t.anyCategory}
          />
          <div className="flex flex-col gap-2">
            <Select
              label={t.province}
              value={filters.province}
              onChange={(province) => update({ province })}
              options={facets.provinces}
              anyLabel={t.anyProvince}
            />
            {filters.province && filters.province !== "nationwide" && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filters.nationwide}
                  onChange={(event) =>
                    update({ nationwide: event.target.checked })
                  }
                  className="size-4 accent-[var(--accent)]"
                />
                {t.includeNationwide}
              </label>
            )}
          </div>
          <Select
            label={t.sort}
            value={filters.sort}
            onChange={(sort) => update({ sort: sort as Filters["sort"] })}
            options={[
              { value: "relevance", label: t.sortRelevance },
              { value: "name", label: t.sortName },
              { value: "verified", label: t.sortVerified },
            ]}
          />
          <Select
            label={t.platform}
            value={filters.platform}
            onChange={(platform) => update({ platform })}
            options={facets.platforms}
            anyLabel={t.anyPlatform}
          />
          {filters.platform && (
            <Select
              label={t.platformState}
              value={filters.state}
              onChange={(state) => update({ state: state as Filters["state"] })}
              options={[
                { value: "available", label: t.isOn },
                { value: "not_available", label: t.isNotOn },
                { value: "unknown", label: t.notChecked },
              ]}
            />
          )}
        </fieldset>

        {active && (
          <button
            type="button"
            onClick={() => setFilters(defaultFilters)}
            className="flex items-center gap-1 self-start text-sm text-accent hover:underline"
          >
            <X aria-hidden className="size-4" />
            {t.clear}
          </button>
        )}
      </form>

      {/* A heading so the result cards (h3) follow the page h1 in order. */}
      <h2 aria-live="polite" className="text-sm font-normal text-muted">
        {results
          ? results.length === 1
            ? t.resultsOne
            : format(t.results, { count: results.length })
          : failed
            ? t.loadError
            : t.loading}
      </h2>

      {results === null ? (
        children
      ) : results.length === 0 ? (
        <div className="flex flex-col items-start gap-2 py-6">
          <p>{t.noResults}</p>
          <a
            href={githubLinks.newListing()}
            className="text-accent hover:underline"
          >
            {t.suggest}
          </a>
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((entry) => (
            <ListingCardView
              key={entry.s}
              {...toCardData(
                {
                  slug: entry.s,
                  name: entry.n,
                  nameKm: entry.k,
                  type: entry.t,
                  provinces: entry.p,
                  available: entry.a,
                },
                platformGroup,
                lang,
                dict,
              )}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
