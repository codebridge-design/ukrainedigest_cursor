const NEWS_API_TOP_HEADLINES_URL = "https://newsapi.org/v2/top-headlines";
const NEWS_API_SOURCES_URL = "https://newsapi.org/v2/top-headlines/sources";
const NEWS_API_EVERYTHING_URL = "https://newsapi.org/v2/everything";
const SOURCE_CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const sourceIdsCache = new Map();

const COUNTRY_LANGUAGE_MAP = {
  AU: "en",
  BR: "pt",
  CA: "en",
  DE: "de",
  FR: "fr",
  GB: "en",
  IN: "en",
  JP: "jp",
  PL: "pl",
  TR: "tr",
  US: "en",
  ZA: "en",
};

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function sanitizeText(value) {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim();
}

function isValidHttpUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch (err) {
    return false;
  }
}

function extractDomain(url) {
  if (!isValidHttpUrl(url)) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch (err) {
    return null;
  }
}

function normalizeNewsApiArticle(rawArticle) {
  const url = sanitizeText(rawArticle?.url);
  const title = sanitizeText(rawArticle?.title);

  if (!url || !isValidHttpUrl(url) || !title) {
    return null;
  }

  const description = sanitizeText(rawArticle?.description);
  const content = sanitizeText(rawArticle?.content);
  const summary = description || content || "No summary available.";

  const sourceName =
    sanitizeText(rawArticle?.source?.name) ||
    extractDomain(url) ||
    "Unknown source";

  const publishedAt = new Date(rawArticle?.publishedAt || Date.now());

  return {
    title,
    summary,
    url,
    sourceName,
    domain: extractDomain(url),
    publishedAt: Number.isNaN(publishedAt.getTime())
      ? new Date().toISOString()
      : publishedAt.toISOString(),
    language: null,
  };
}

function dedupeArticlesByUrl(articles) {
  const seen = new Set();
  const deduped = [];

  for (const article of articles) {
    if (!article?.url || seen.has(article.url)) continue;
    seen.add(article.url);
    deduped.push(article);
  }

  return deduped;
}

function articleContainsQuery(article, query) {
  const normalizedQuery = sanitizeText(query).toLowerCase();
  if (!normalizedQuery) return true;

  const haystack = [
    sanitizeText(article?.title),
    sanitizeText(article?.description),
    sanitizeText(article?.content),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return haystack.includes(normalizedQuery);
}

function getCountryLanguage(countryIso2) {
  return COUNTRY_LANGUAGE_MAP[String(countryIso2 || "").toUpperCase()] || "en";
}

async function fetchNewsApiJson(url, apiKey, context) {
  const response = await fetch(url, {
    headers: {
      "X-Api-Key": apiKey,
    },
  });

  let payload;
  try {
    payload = await response.json();
  } catch (err) {
    throw new Error(`NewsAPI returned non-JSON response for ${context} (status ${response.status})`);
  }

  if (!response.ok || payload?.status !== "ok") {
    const message = payload?.message || response.statusText || "Unknown NewsAPI error";
    throw new Error(`NewsAPI request failed for ${context}: ${message}`);
  }

  return payload;
}

async function getCountrySourceIds(countryIso2, apiKey) {
  const countryCode = String(countryIso2 || "").toLowerCase();
  const cached = sourceIdsCache.get(countryCode);

  if (cached && cached.expiresAt > Date.now()) {
    return cached.sourceIds;
  }

  const sourcesUrl = new URL(NEWS_API_SOURCES_URL);
  sourcesUrl.searchParams.set("country", countryCode);

  const payload = await fetchNewsApiJson(sourcesUrl.toString(), apiKey, `sources:${countryIso2}`);
  const sourceIds = (payload.sources || [])
    .map((source) => sanitizeText(source?.id))
    .filter(Boolean);

  sourceIdsCache.set(countryCode, {
    sourceIds,
    expiresAt: Date.now() + SOURCE_CACHE_TTL_MS,
  });

  return sourceIds;
}

async function fetchCountryUkraineArticlesViaSources({
  countryIso2,
  apiKey,
  query,
  pageSize,
}) {
  const sourceIds = await getCountrySourceIds(countryIso2, apiKey);
  if (sourceIds.length === 0) return [];

  const language = getCountryLanguage(countryIso2);
  const everythingUrl = new URL(NEWS_API_EVERYTHING_URL);
  everythingUrl.searchParams.set("q", query);
  everythingUrl.searchParams.set("searchIn", "title,description");
  everythingUrl.searchParams.set("sortBy", "publishedAt");
  everythingUrl.searchParams.set("sources", sourceIds.join(","));
  everythingUrl.searchParams.set("language", language);
  everythingUrl.searchParams.set("from", new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString());
  everythingUrl.searchParams.set("pageSize", String(Math.min(100, pageSize * 3)));

  const payload = await fetchNewsApiJson(
    everythingUrl.toString(),
    apiKey,
    `everything:${countryIso2}`,
  );

  return payload.articles || [];
}

async function fetchFallbackTopHeadlines(countryIso2, apiKey, pageSize) {
  const topHeadlinesUrl = new URL(NEWS_API_TOP_HEADLINES_URL);
  topHeadlinesUrl.searchParams.set("country", String(countryIso2 || "").toLowerCase());
  topHeadlinesUrl.searchParams.set("pageSize", String(Math.min(100, pageSize * 3)));

  const payload = await fetchNewsApiJson(
    topHeadlinesUrl.toString(),
    apiKey,
    `top-headlines:${countryIso2}`,
  );

  return payload.articles || [];
}

async function fetchCountryHeadlines(countryIso2) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    throw new Error("NEWS_API_KEY is not configured");
  }

  const countryCode = String(countryIso2 || "").toUpperCase();
  if (!countryCode) {
    throw new Error("countryIso2 is required");
  }

  const query = sanitizeText(process.env.NEWS_QUERY) || "ukraine";
  const pageSize = parsePositiveInt(process.env.INGEST_PAGE_SIZE, 10);

  let rawArticles = await fetchCountryUkraineArticlesViaSources({
    countryIso2: countryCode,
    apiKey,
    query,
    pageSize,
  });

  // Fallback for countries with no configured sources in NewsAPI.
  if (rawArticles.length === 0) {
    rawArticles = (await fetchFallbackTopHeadlines(countryCode, apiKey, pageSize)).filter((article) =>
      articleContainsQuery(article, query),
    );
  }

  const normalized = rawArticles
    .map((article) => normalizeNewsApiArticle(article))
    .filter(Boolean);

  return dedupeArticlesByUrl(normalized).slice(0, pageSize);
}

module.exports = {
  fetchCountryHeadlines,
  normalizeNewsApiArticle,
  dedupeArticlesByUrl,
  extractDomain,
  isValidHttpUrl,
};
