import { X } from "lucide-react";
import type { SnapshotArticle, SnapshotCountry } from "@/types/snapshot";
import ArticleCard from "./ArticleCard";

interface ComparisonViewProps {
  countries: SnapshotCountry[];
  articlesByCountry: Record<string, SnapshotArticle[]>;
  onRemoveCountry: (countryCode: string) => void;
  onClose: () => void;
}

const ComparisonView = ({
  countries,
  articlesByCountry,
  onRemoveCountry,
  onClose,
}: ComparisonViewProps) => {
  if (countries.length === 0) return null;

  return (
    <div className="bg-card border border-border rounded-xl p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Country Comparison</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          aria-label="Close comparison"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <div className={`grid gap-6 ${countries.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
        {countries.map((country) => {
          const articles = articlesByCountry[country.code] || [];

          return (
            <div key={country.code} className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{country.name}</h3>
                  <p className="text-sm text-muted-foreground">{articles.length} articles today</p>
                </div>
                {countries.length > 1 && (
                  <button
                    onClick={() => onRemoveCountry(country.code)}
                    className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {articles.slice(0, 4).map((article) => (
                  <ArticleCard key={article.id} article={article} showCountry={false} />
                ))}

                {articles.length === 0 && (
                  <p className="text-muted-foreground text-center py-8">No articles available</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {countries.length < 2 && (
        <p className="text-sm text-muted-foreground text-center mt-4 pt-4 border-t border-border">
          Select another country to compare coverage
        </p>
      )}
    </div>
  );
};

export default ComparisonView;
