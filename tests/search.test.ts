import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyFilters,
  defaultFilters,
  filtersFromSearch,
  filtersToSearch,
  normalize,
  prepare,
  type Filters,
  type SearchEntry,
} from "../src/lib/search";

const entry = (overrides: Partial<SearchEntry> & { s: string; n: string }) => ({
  t: "company",
  c: [],
  p: [],
  a: [],
  x: [],
  v: "2026-01-01",
  ...overrides,
});

const entries: SearchEntry[] = [
  entry({
    s: "cellcard",
    n: "Cellcard",
    k: "សែលកាត",
    c: ["telecommunications"],
    p: ["nationwide"],
    a: ["facebook", "telegram"],
    v: "2026-11-02",
  }),
  entry({
    s: "brown-coffee",
    n: "Brown Coffee",
    t: "shop",
    c: ["cafe", "food-and-drink"],
    p: ["phnom-penh"],
    a: ["facebook"],
    x: ["telegram"],
  }),
  entry({
    s: "phare-circus",
    n: "Phare, The Cambodian Circus",
    t: "place",
    c: ["arts-and-culture"],
    p: ["siem-reap"],
  }),
];

const categoryNames: Record<string, string> = {
  cafe: "Café ហាងកាហ្វេ",
  "food-and-drink": "Food & Drink អាហារ",
};
const prepared = prepare(entries, (e) =>
  e.c.map((c) => categoryNames[c] ?? ""),
);

const search = (patch: Partial<Filters>) =>
  applyFilters(prepared, { ...defaultFilters, ...patch }).map((e) => e.s);

describe("normalize", () => {
  it("lowercases and strips Latin accents and punctuation", () => {
    assert.equal(normalize("  Café, Brown!  "), "cafe brown");
  });

  it("keeps Khmer and removes zero-width spaces", () => {
    assert.equal(normalize("សែល​កាត"), "សែលកាត");
  });
});

describe("text search", () => {
  it("returns everything, sorted by name, for an empty query", () => {
    assert.deepEqual(search({}), ["brown-coffee", "cellcard", "phare-circus"]);
  });

  it("matches Khmer by substring, without word breaks", () => {
    assert.deepEqual(search({ q: "កាត" }), ["cellcard"]);
  });

  it("requires every word to match", () => {
    assert.deepEqual(search({ q: "brown coffee" }), ["brown-coffee"]);
    assert.deepEqual(search({ q: "brown circus" }), []);
  });

  it("finds listings by category names in either language", () => {
    assert.deepEqual(search({ q: "cafe" }), ["brown-coffee"]);
    assert.deepEqual(search({ q: "ហាងកាហ្វេ" }), ["brown-coffee"]);
  });

  it("ranks name matches above other matches", () => {
    const extra = prepare(
      [
        entry({ s: "a", n: "Zed Shop", c: ["cafe"] }),
        entry({ s: "b", n: "Cafe Amazon" }),
      ],
      (e) => e.c.map((c) => categoryNames[c] ?? ""),
    );
    const result = applyFilters(extra, { ...defaultFilters, q: "cafe" });
    assert.deepEqual(
      result.map((e) => e.s),
      ["b", "a"],
    );
  });
});

describe("filters", () => {
  it("filters by type and by parent category", () => {
    assert.deepEqual(search({ type: "shop" }), ["brown-coffee"]);
    assert.deepEqual(search({ category: "food-and-drink" }), ["brown-coffee"]);
  });

  it("includes nationwide listings in a province unless turned off", () => {
    assert.deepEqual(search({ province: "phnom-penh" }), [
      "brown-coffee",
      "cellcard",
    ]);
    assert.deepEqual(search({ province: "phnom-penh", nationwide: false }), [
      "brown-coffee",
    ]);
  });

  it("separates available, not available and unchecked platforms", () => {
    assert.deepEqual(search({ platform: "telegram", state: "available" }), [
      "cellcard",
    ]);
    assert.deepEqual(search({ platform: "telegram", state: "not_available" }), [
      "brown-coffee",
    ]);
    assert.deepEqual(search({ platform: "telegram", state: "unknown" }), [
      "phare-circus",
    ]);
  });

  it("sorts by most recently verified", () => {
    assert.equal(search({ sort: "verified" })[0], "cellcard");
  });
});

describe("URL round trip", () => {
  it("restores the same filters from the query string", () => {
    const filters: Filters = {
      ...defaultFilters,
      q: "brown ",
      province: "phnom-penh",
      nationwide: false,
      platform: "telegram",
      state: "not_available",
      sort: "name",
    };
    assert.deepEqual(filtersFromSearch(filtersToSearch(filters)), filters);
  });

  it("produces an empty query string for default filters", () => {
    assert.equal(filtersToSearch(defaultFilters), "");
  });

  it("ignores unknown values", () => {
    const filters = filtersFromSearch("?state=bogus&sort=bogus");
    assert.equal(filters.state, "available");
    assert.equal(filters.sort, "relevance");
  });
});
