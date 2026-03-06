import { describe, it, expect } from "vitest";
import {
  buildArticlesByCountry,
  filterArticles,
  filterCountries,
} from "@/lib/snapshotFilters";
import type { SnapshotArticle, SnapshotCountry, SnapshotRegion } from "@/types/snapshot";

const regions: SnapshotRegion[] = [
  { id: "europe", name: "Europe", countries: ["DE", "FR"] },
  { id: "asia", name: "Asia", countries: ["JP"] },
];

const countries: SnapshotCountry[] = [
  { code: "DE", name: "Germany", region: "Europe", articleCount: 2 },
  { code: "FR", name: "France", region: "Europe", articleCount: 0 },
  { code: "JP", name: "Japan", region: "Asia", articleCount: 1 },
];

const articles: SnapshotArticle[] = [
  {
    id: "1",
    headline: "DE latest",
    summary: "s",
    source: "A",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
    publishedAt: "2026-03-05T10:00:00.000Z",
    url: "https://example.com/de-1",
  },
  {
    id: "2",
    headline: "DE older",
    summary: "s",
    source: "A",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
    publishedAt: "2026-03-05T08:00:00.000Z",
    url: "https://example.com/de-2",
  },
  {
    id: "3",
    headline: "JP latest",
    summary: "s",
    source: "B",
    country: "Japan",
    countryCode: "JP",
    region: "Asia",
    publishedAt: "2026-03-05T11:00:00.000Z",
    url: "https://example.com/jp-1",
  },
];

describe("snapshot filters", () => {
  it("filters articles by country", () => {
    const result = filterArticles(articles, null, "DE", regions);
    expect(result).toHaveLength(2);
    expect(result.every((article) => article.countryCode === "DE")).toBe(true);
  });

  it("filters countries by region", () => {
    const result = filterCountries(countries, "asia", regions);
    expect(result).toEqual([
      { code: "JP", name: "Japan", region: "Asia", articleCount: 1 },
    ]);
  });

  it("builds country map sorted by published date", () => {
    const byCountry = buildArticlesByCountry(articles);
    expect(byCountry.DE).toHaveLength(2);
    expect(byCountry.DE[0].headline).toBe("DE latest");
    expect(byCountry.JP[0].headline).toBe("JP latest");
  });
});
