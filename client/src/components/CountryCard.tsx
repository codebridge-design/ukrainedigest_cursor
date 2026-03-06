import { ChevronRight } from "lucide-react";
import type { SnapshotCountry } from "@/types/snapshot";

interface CountryCardProps {
  country: SnapshotCountry;
  onClick: () => void;
  isSelected?: boolean;
  latestHeadline?: string;
}

const CountryCard = ({ country, onClick, isSelected, latestHeadline }: CountryCardProps) => {
  const headline = latestHeadline || "No recent coverage";

  return (
    <button
      onClick={onClick}
      className={`card-interactive w-full text-left transition-all ${
        isSelected ? "ring-2 ring-primary border-primary" : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-foreground">{country.name}</h3>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs">
              {country.articleCount} articles
            </span>
          </div>
          <p className="text-caption mb-2">{country.region}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{headline}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-1" />
      </div>
    </button>
  );
};

export default CountryCard;
