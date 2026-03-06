export interface SnapshotArticle {
  id: string;
  headline: string;
  summary: string;
  source: string;
  country: string;
  countryCode: string | null;
  region: string;
  publishedAt: string;
  url: string;
}

export interface SnapshotCountry {
  code: string;
  name: string;
  region: string;
  articleCount: number;
}

export interface SnapshotRegion {
  id: string;
  name: string;
  countries: string[];
}

export interface SnapshotResponse {
  ok: boolean;
  date: string;
  total: number;
  articles: SnapshotArticle[];
  countries: SnapshotCountry[];
  regions: SnapshotRegion[];
  meta: {
    generatedAt: string | null;
  };
}
