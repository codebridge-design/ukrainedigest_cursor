import type { SnapshotArticle, SnapshotCountry, SnapshotRegion } from "@/types/snapshot";

function getTimestamp(value: string) {
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? 0 : ts;
}

export function filterArticles(
  articles: SnapshotArticle[],
  selectedRegion: string | null,
  selectedCountry: string | null,
  regions: SnapshotRegion[],
): SnapshotArticle[] {
  if (selectedCountry) {
    return articles.filter((article) => article.countryCode === selectedCountry);
  }

  if (selectedRegion) {
    const region = regions.find((item) => item.id === selectedRegion);
    if (!region) return [];
    return articles.filter((article) =>
      article.countryCode ? region.countries.includes(article.countryCode) : false,
    );
  }

  return articles;
}

export function filterCountries(
  countries: SnapshotCountry[],
  selectedRegion: string | null,
  regions: SnapshotRegion[],
): SnapshotCountry[] {
  if (!selectedRegion) return countries;

  const region = regions.find((item) => item.id === selectedRegion);
  if (!region) return [];

  return countries.filter((country) => region.countries.includes(country.code));
}

export function buildArticlesByCountry(
  articles: SnapshotArticle[],
): Record<string, SnapshotArticle[]> {
  const sorted = [...articles].sort(
    (a, b) => getTimestamp(b.publishedAt) - getTimestamp(a.publishedAt),
  );

  return sorted.reduce((acc, article) => {
    if (!article.countryCode) return acc;
    if (!acc[article.countryCode]) acc[article.countryCode] = [];
    acc[article.countryCode].push(article);
    return acc;
  }, {} as Record<string, SnapshotArticle[]>);
}
