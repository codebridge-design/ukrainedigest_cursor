import { cn } from "@/lib/utils";
import type { SnapshotCountry, SnapshotRegion } from "@/types/snapshot";

interface RegionFilterProps {
  selectedRegion: string | null;
  selectedCountry: string | null;
  onRegionChange: (regionId: string | null) => void;
  onCountryChange: (countryCode: string | null) => void;
  regions: SnapshotRegion[];
  countries: SnapshotCountry[];
}

const RegionFilter = ({
  selectedRegion,
  selectedCountry,
  onRegionChange,
  onCountryChange,
  regions,
  countries,
}: RegionFilterProps) => {
  const filteredCountries = selectedRegion
    ? countries.filter((country) => {
        const region = regions.find((item) => item.id === selectedRegion);
        return region?.countries.includes(country.code);
      })
    : countries;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            onRegionChange(null);
            onCountryChange(null);
          }}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
            !selectedRegion
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
          )}
        >
          All Regions
        </button>

        {regions.map((region) => (
          <button
            key={region.id}
            onClick={() => {
              onRegionChange(region.id);
              onCountryChange(null);
            }}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
              selectedRegion === region.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            )}
          >
            {region.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCountryChange(null)}
          className={cn(
            "px-3 py-1.5 rounded-lg text-sm transition-colors",
            !selectedCountry
              ? "bg-slate-700 text-slate-50"
              : "bg-slate-100 text-slate-700 hover:bg-slate-200",
          )}
        >
          All Countries
        </button>

        {filteredCountries.map((country) => (
          <button
            key={country.code}
            onClick={() => onCountryChange(country.code)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center gap-2",
              selectedCountry === country.code
                ? "bg-slate-700 text-slate-50"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200",
            )}
          >
            <span>{country.name}</span>
            <span className="text-xs opacity-70">({country.articleCount})</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RegionFilter;
