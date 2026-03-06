export interface Article {
  id: string;
  headline: string;
  summary: string;
  source: string;
  country: string;
  countryCode: string;
  region: string;
  publishedAt: string;
  url: string;
}

export interface Country {
  code: string;
  name: string;
  region: string;
  articleCount: number;
}

export interface Region {
  id: string;
  name: string;
  countries: string[];
}

export const regions: Region[] = [
  { id: "north-america", name: "North America", countries: ["US", "CA"] },
  { id: "europe", name: "Europe", countries: ["GB", "DE", "FR", "PL", "IT"] },
  { id: "asia", name: "Asia", countries: ["JP", "IN", "CN", "KR"] },
  { id: "middle-east", name: "Middle East", countries: ["IL", "TR", "SA"] },
];

export const countries: Country[] = [
  { code: "US", name: "United States", region: "North America", articleCount: 12 },
  { code: "GB", name: "United Kingdom", region: "Europe", articleCount: 8 },
  { code: "DE", name: "Germany", region: "Europe", articleCount: 9 },
  { code: "FR", name: "France", region: "Europe", articleCount: 6 },
  { code: "PL", name: "Poland", region: "Europe", articleCount: 11 },
  { code: "JP", name: "Japan", region: "Asia", articleCount: 4 },
  { code: "IN", name: "India", region: "Asia", articleCount: 5 },
  { code: "IL", name: "Israel", region: "Middle East", articleCount: 3 },
  { code: "TR", name: "Turkey", region: "Middle East", articleCount: 4 },
  { code: "CA", name: "Canada", region: "North America", articleCount: 3 },
  { code: "IT", name: "Italy", region: "Europe", articleCount: 4 },
  { code: "KR", name: "South Korea", region: "Asia", articleCount: 3 },
];

export const articles: Article[] = [
  {
    id: "1",
    headline: "Ukraine Receives New Air Defense Systems Amid Ongoing Conflict",
    summary: "Western allies have delivered additional air defense capabilities to Ukraine as the country continues to defend against aerial attacks. The new systems are expected to strengthen protection for critical infrastructure.",
    source: "The New York Times",
    country: "United States",
    countryCode: "US",
    region: "North America",
    publishedAt: "2025-01-15T08:30:00Z",
    url: "#",
  },
  {
    id: "2",
    headline: "European Leaders Discuss Long-Term Support for Ukraine",
    summary: "EU officials met in Brussels to outline a multi-year assistance package, emphasizing the importance of sustained support for Ukraine's defense and reconstruction efforts.",
    source: "BBC News",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    publishedAt: "2025-01-15T09:15:00Z",
    url: "#",
  },
  {
    id: "3",
    headline: "Germany Announces New Military Aid Package Worth €1.5 Billion",
    summary: "The German government has approved a substantial new military aid package for Ukraine, including tanks, artillery systems, and ammunition supplies.",
    source: "Deutsche Welle",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
    publishedAt: "2025-01-15T07:45:00Z",
    url: "#",
  },
  {
    id: "4",
    headline: "Poland Strengthens Border Security Amid Regional Tensions",
    summary: "Polish authorities have increased patrols along the eastern border, citing ongoing security concerns related to the conflict in neighboring Ukraine.",
    source: "Gazeta Wyborcza",
    country: "Poland",
    countryCode: "PL",
    region: "Europe",
    publishedAt: "2025-01-15T10:00:00Z",
    url: "#",
  },
  {
    id: "5",
    headline: "Japan Pledges Continued Humanitarian Support for Ukraine",
    summary: "Japanese officials announced additional humanitarian aid packages and infrastructure reconstruction support during a bilateral meeting with Ukrainian representatives.",
    source: "The Japan Times",
    country: "Japan",
    countryCode: "JP",
    region: "Asia",
    publishedAt: "2025-01-15T06:30:00Z",
    url: "#",
  },
  {
    id: "6",
    headline: "France Proposes New Diplomatic Initiative for Peace Talks",
    summary: "The French government has put forward a new framework for potential peace negotiations, calling for international participation and security guarantees.",
    source: "Le Monde",
    country: "France",
    countryCode: "FR",
    region: "Europe",
    publishedAt: "2025-01-15T11:20:00Z",
    url: "#",
  },
  {
    id: "7",
    headline: "India Balances Relations Amid Global Pressure on Ukraine Stance",
    summary: "Indian diplomats continue to navigate complex international relationships while maintaining their position of calling for dialogue and peaceful resolution.",
    source: "The Hindu",
    country: "India",
    countryCode: "IN",
    region: "Asia",
    publishedAt: "2025-01-15T05:15:00Z",
    url: "#",
  },
  {
    id: "8",
    headline: "US Congress Debates Next Phase of Ukraine Assistance",
    summary: "Lawmakers on Capitol Hill are discussing the scope and conditions of future aid packages as the conflict enters a new phase.",
    source: "The Washington Post",
    country: "United States",
    countryCode: "US",
    region: "North America",
    publishedAt: "2025-01-15T12:00:00Z",
    url: "#",
  },
  {
    id: "9",
    headline: "Turkey Hosts Talks on Black Sea Grain Corridor Extension",
    summary: "Turkish officials are mediating discussions to extend the grain export agreement, emphasizing the importance of food security for global markets.",
    source: "Daily Sabah",
    country: "Turkey",
    countryCode: "TR",
    region: "Middle East",
    publishedAt: "2025-01-15T08:00:00Z",
    url: "#",
  },
  {
    id: "10",
    headline: "Canadian Defense Minister Visits Kyiv to Reaffirm Support",
    summary: "Canada's defense minister made an unannounced visit to Ukraine, announcing new training programs for Ukrainian military personnel.",
    source: "The Globe and Mail",
    country: "Canada",
    countryCode: "CA",
    region: "North America",
    publishedAt: "2025-01-15T14:30:00Z",
    url: "#",
  },
  {
    id: "11",
    headline: "Italian Parliament Approves Continued Weapons Deliveries",
    summary: "Despite internal political debate, Italy's parliament voted to extend military support for Ukraine through the end of the year.",
    source: "La Repubblica",
    country: "Italy",
    countryCode: "IT",
    region: "Europe",
    publishedAt: "2025-01-15T09:45:00Z",
    url: "#",
  },
  {
    id: "12",
    headline: "South Korea Considers Expanded Role in Ukraine Reconstruction",
    summary: "Seoul is exploring opportunities to contribute to Ukraine's post-conflict rebuilding, focusing on infrastructure and technology sectors.",
    source: "Korea Herald",
    country: "South Korea",
    countryCode: "KR",
    region: "Asia",
    publishedAt: "2025-01-15T07:00:00Z",
    url: "#",
  },
  {
    id: "13",
    headline: "UK Foreign Secretary Outlines Vision for Post-War Ukraine",
    summary: "British officials presented a comprehensive plan for supporting Ukraine's European integration and economic recovery after the conflict.",
    source: "The Guardian",
    country: "United Kingdom",
    countryCode: "GB",
    region: "Europe",
    publishedAt: "2025-01-15T10:30:00Z",
    url: "#",
  },
  {
    id: "14",
    headline: "German Industry Leaders Discuss Ukraine Investment Opportunities",
    summary: "Major German corporations are evaluating long-term investment plans in Ukraine, signaling confidence in the country's economic future.",
    source: "Frankfurter Allgemeine",
    country: "Germany",
    countryCode: "DE",
    region: "Europe",
    publishedAt: "2025-01-15T13:15:00Z",
    url: "#",
  },
  {
    id: "15",
    headline: "Polish Farmers Protest Ukraine Grain Imports",
    summary: "Agricultural workers in Poland have organized demonstrations calling for protective measures against what they describe as unfair competition from Ukrainian grain.",
    source: "Rzeczpospolita",
    country: "Poland",
    countryCode: "PL",
    region: "Europe",
    publishedAt: "2025-01-15T11:00:00Z",
    url: "#",
  },
];

export const getArticlesByCountry = (countryCode: string): Article[] => {
  return articles.filter((article) => article.countryCode === countryCode);
};

export const getArticlesByRegion = (regionId: string): Article[] => {
  const region = regions.find((r) => r.id === regionId);
  if (!region) return [];
  return articles.filter((article) => region.countries.includes(article.countryCode));
};

export const getCountriesByRegion = (regionId: string): Country[] => {
  const region = regions.find((r) => r.id === regionId);
  if (!region) return [];
  return countries.filter((country) => region.countries.includes(country.code));
};

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
