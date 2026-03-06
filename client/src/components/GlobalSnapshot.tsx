import { useMemo, useState } from "react";
import { Eye, LayoutGrid, List } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchSnapshot } from "@/lib/api";
import {
  buildArticlesByCountry,
  filterArticles,
  filterCountries,
} from "@/lib/snapshotFilters";
import type { SnapshotArticle, SnapshotCountry, SnapshotRegion } from "@/types/snapshot";
import RegionFilter from "./RegionFilter";
import ArticleCard from "./ArticleCard";
import CountryCard from "./CountryCard";
import ComparisonView from "./ComparisonView";

type ViewMode = "articles" | "countries";
const EMPTY_ARTICLES: SnapshotArticle[] = [];
const EMPTY_COUNTRIES: SnapshotCountry[] = [];
const EMPTY_REGIONS: SnapshotRegion[] = [];

const GlobalSnapshot = () => {
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("articles");
  const [comparisonCountries, setComparisonCountries] = useState<string[]>([]);

  const snapshotQuery = useQuery({
    queryKey: ["snapshot"],
    queryFn: () => fetchSnapshot(),
    refetchInterval: 5 * 60 * 1000,
  });

  const articles = snapshotQuery.data?.articles ?? EMPTY_ARTICLES;
  const countries = snapshotQuery.data?.countries ?? EMPTY_COUNTRIES;
  const regions = snapshotQuery.data?.regions ?? EMPTY_REGIONS;

  const filteredArticles = useMemo(
    () => filterArticles(articles, selectedRegion, selectedCountry, regions),
    [articles, selectedRegion, selectedCountry, regions],
  );

  const filteredCountries = useMemo(
    () => filterCountries(countries, selectedRegion, regions),
    [countries, selectedRegion, regions],
  );

  const articlesByCountry = useMemo(
    () => buildArticlesByCountry(articles),
    [articles],
  );

  const handleCountryClick = (countryCode: string) => {
    if (comparisonCountries.includes(countryCode)) {
      setComparisonCountries(comparisonCountries.filter((code) => code !== countryCode));
      return;
    }

    if (comparisonCountries.length < 2) {
      setComparisonCountries([...comparisonCountries, countryCode]);
    }
  };

  const handleRemoveFromComparison = (countryCode: string) => {
    setComparisonCountries(comparisonCountries.filter((code) => code !== countryCode));
  };

  const comparisonCountryData = countries.filter((country) =>
    comparisonCountries.includes(country.code),
  );

  if (snapshotQuery.isLoading) {
    return (
      <div className="container-wide py-8">
        <p className="text-muted-foreground">Loading latest snapshot...</p>
      </div>
    );
  }

  if (snapshotQuery.isError) {
    return (
      <div className="container-wide py-8">
        <p className="text-destructive">
          Failed to load snapshot: {(snapshotQuery.error as Error).message}
        </p>
      </div>
    );
  }

  return (
    <div className="container-wide py-8">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-semibold text-foreground mb-3">
          Today's Global Snapshot
        </h2>
        <p className="text-body max-w-2xl">
          How the world is covering Ukraine today. Browse by region or country to compare
          perspectives across international media.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-6 mb-8 pb-6 border-b border-border">
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            <strong className="text-foreground">{articles.length}</strong> articles from{" "}
            <strong className="text-foreground">{countries.length}</strong> countries
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <span className="text-sm text-muted-foreground mr-2">View:</span>
          <button
            onClick={() => setViewMode("articles")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "articles"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            aria-label="Article view"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode("countries")}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === "countries"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            }`}
            aria-label="Country view"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mb-8">
        <RegionFilter
          selectedRegion={selectedRegion}
          selectedCountry={selectedCountry}
          onRegionChange={setSelectedRegion}
          onCountryChange={setSelectedCountry}
          regions={regions}
          countries={countries}
        />
      </div>

      {comparisonCountries.length > 0 && (
        <ComparisonView
          countries={comparisonCountryData}
          articlesByCountry={articlesByCountry}
          onRemoveCountry={handleRemoveFromComparison}
          onClose={() => setComparisonCountries([])}
        />
      )}

      {viewMode === "articles" ? (
        <div className="space-y-4">
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No articles found for the selected filters.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCountries.map((country) => (
            <CountryCard
              key={country.code}
              country={country}
              onClick={() => handleCountryClick(country.code)}
              isSelected={comparisonCountries.includes(country.code)}
              latestHeadline={articlesByCountry[country.code]?.[0]?.headline}
            />
          ))}
        </div>
      )}

      {viewMode === "countries" && comparisonCountries.length === 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Click on countries to compare their coverage side by side
          </p>
        </div>
      )}
    </div>
  );
};

export default GlobalSnapshot;
