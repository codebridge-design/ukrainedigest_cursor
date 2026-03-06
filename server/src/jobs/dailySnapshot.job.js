const { prisma } = require("../config/prisma");
const { fetchCountryHeadlines } = require("../services/ingestion/newsApi.service");
const logger = require("../utils/logger");

let rotationCursor = 0;
let isRunning = false;

const DEFAULT_COUNTRIES = [
  { iso2: "US", name: "United States", region: "NORTH_AMERICA", tier: 1 },
  { iso2: "CA", name: "Canada", region: "NORTH_AMERICA", tier: 2 },
  { iso2: "GB", name: "United Kingdom", region: "EUROPE", tier: 1 },
  { iso2: "DE", name: "Germany", region: "EUROPE", tier: 1 },
  { iso2: "FR", name: "France", region: "EUROPE", tier: 1 },
  { iso2: "PL", name: "Poland", region: "EUROPE", tier: 1 },
  { iso2: "TR", name: "Turkey", region: "ASIA", tier: 2 },
  { iso2: "IN", name: "India", region: "ASIA", tier: 2 },
  { iso2: "JP", name: "Japan", region: "ASIA", tier: 2 },
  { iso2: "AU", name: "Australia", region: "OCEANIA", tier: 2 },
  { iso2: "BR", name: "Brazil", region: "SOUTH_AMERICA", tier: 2 },
  { iso2: "ZA", name: "South Africa", region: "AFRICA", tier: 2 },
];

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function todayISODate() {
  const date = new Date();
  const yyyy = String(date.getFullYear());
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function getCycleBudget(intervalMinutes, dailyBudget, totalCountries) {
  const safeInterval = parsePositiveInt(intervalMinutes, 180);
  const safeBudget = parsePositiveInt(dailyBudget, 90);

  const cyclesPerDay = Math.max(1, Math.floor((24 * 60) / safeInterval));
  const perCycle = Math.max(1, Math.floor(safeBudget / cyclesPerDay));

  return Math.min(perCycle, Math.max(1, totalCountries));
}

async function ensureDefaultCountries() {
  const existing = await prisma.country.count({
    where: {
      iso2: {
        not: "ZZ",
      },
    },
  });

  if (existing > 0) {
    return;
  }

  await prisma.country.upsert({
    where: { iso2: "ZZ" },
    update: {
      name: "Unknown",
      region: "UNKNOWN",
      tier: 3,
      isEnabled: true,
    },
    create: {
      iso2: "ZZ",
      name: "Unknown",
      region: "UNKNOWN",
      tier: 3,
      isEnabled: true,
    },
  });

  for (const country of DEFAULT_COUNTRIES) {
    await prisma.country.upsert({
      where: { iso2: country.iso2 },
      update: {
        name: country.name,
        region: country.region,
        tier: country.tier,
        isEnabled: true,
      },
      create: {
        iso2: country.iso2,
        name: country.name,
        region: country.region,
        tier: country.tier,
        isEnabled: true,
      },
    });
  }

  logger.info("Default countries initialized", { countries: DEFAULT_COUNTRIES.length });
}

function computeCountrySelection(countries, options = {}) {
  if (!Array.isArray(countries) || countries.length === 0) {
    return {
      selectedCountries: [],
      nextRotationCursor: options.rotationCursor || 0,
      maxCountriesPerCycle: 0,
    };
  }

  const intervalMinutes = parsePositiveInt(options.intervalMinutes, 180);
  const dailyBudget = parsePositiveInt(options.dailyBudget, 90);
  const maxCountriesPerCycle = getCycleBudget(
    intervalMinutes,
    dailyBudget,
    countries.length,
  );

  const sorted = [...countries].sort((a, b) => {
    if ((a.tier || 999) !== (b.tier || 999)) return (a.tier || 999) - (b.tier || 999);
    return a.iso2.localeCompare(b.iso2);
  });

  const priorityCountries = sorted.filter((country) => (country.tier || 999) <= 1);
  const rotatingCountries = sorted.filter((country) => (country.tier || 999) > 1);

  const selected = priorityCountries.slice(0, maxCountriesPerCycle);
  let nextRotationCursor = options.rotationCursor || 0;

  const remainingSlots = maxCountriesPerCycle - selected.length;
  if (remainingSlots > 0 && rotatingCountries.length > 0) {
    const start = ((options.rotationCursor || 0) % rotatingCountries.length + rotatingCountries.length) % rotatingCountries.length;
    for (let index = 0; index < remainingSlots; index += 1) {
      const country = rotatingCountries[(start + index) % rotatingCountries.length];
      selected.push(country);
    }
    nextRotationCursor = (start + remainingSlots) % rotatingCountries.length;
  }

  return {
    selectedCountries: selected,
    nextRotationCursor,
    maxCountriesPerCycle,
  };
}

async function upsertSource(tx, country, article) {
  const domain = article.domain || `${country.iso2.toLowerCase()}.unknown.local`;
  const homepageUrl = `https://${domain}`;

  return tx.source.upsert({
    where: { domain },
    update: {
      name: article.sourceName,
      homepageUrl,
      countryId: country.id,
      region: country.region,
      isEnabled: true,
    },
    create: {
      name: article.sourceName,
      domain,
      homepageUrl,
      countryId: country.id,
      region: country.region,
      isEnabled: true,
    },
  });
}

async function replaceCountrySnapshotItems(snapshotId, country, normalizedArticles) {
  await prisma.$transaction(async (tx) => {
    await tx.snapshotItem.deleteMany({
      where: {
        snapshotId,
        article: {
          countryId: country.id,
        },
      },
    });

    for (const article of normalizedArticles) {
      const source = await upsertSource(tx, country, article);

      const dbArticle = await tx.article.upsert({
        where: {
          url_countryId: {
            url: article.url,
            countryId: country.id,
          },
        },
        update: {
          title: article.title,
          summary: article.summary,
          sourceId: source.id,
          region: country.region,
          publishedAt: new Date(article.publishedAt),
          language: article.language,
        },
        create: {
          title: article.title,
          summary: article.summary,
          url: article.url,
          sourceId: source.id,
          countryId: country.id,
          region: country.region,
          publishedAt: new Date(article.publishedAt),
          language: article.language,
        },
      });

      await tx.snapshotItem.upsert({
        where: {
          snapshotId_articleId: {
            snapshotId,
            articleId: dbArticle.id,
          },
        },
        update: {
          rank: 0,
        },
        create: {
          snapshotId,
          articleId: dbArticle.id,
          rank: 0,
        },
      });
    }
  });
}

async function recalculateSnapshotRanks(snapshotId) {
  const items = await prisma.snapshotItem.findMany({
    where: { snapshotId },
    include: {
      article: {
        select: {
          publishedAt: true,
        },
      },
    },
  });

  const ordered = [...items].sort((a, b) => {
    const timeA = new Date(a.article.publishedAt).getTime();
    const timeB = new Date(b.article.publishedAt).getTime();
    if (timeA !== timeB) return timeB - timeA;
    return a.id - b.id;
  });

  await prisma.$transaction(
    ordered.map((item, index) =>
      prisma.snapshotItem.update({
        where: { id: item.id },
        data: { rank: index + 1 },
      }),
    ),
  );
}

async function runDailySnapshotJob() {
  if (isRunning) {
    logger.info("Daily snapshot job is already running; skipping overlap");
    return null;
  }

  if (!process.env.NEWS_API_KEY) {
    logger.info("Daily snapshot job skipped: NEWS_API_KEY is not configured");
    return null;
  }

  isRunning = true;

  try {
    const intervalMinutes = parsePositiveInt(process.env.INGEST_INTERVAL_MINUTES, 180);
    const dailyBudget = parsePositiveInt(process.env.NEWS_API_DAILY_BUDGET, 90);

    await ensureDefaultCountries();

    const countries = await prisma.country.findMany({
      where: {
        isEnabled: true,
        iso2: {
          not: "ZZ",
        },
      },
      orderBy: [{ tier: "asc" }, { iso2: "asc" }],
    });

    if (countries.length === 0) {
      logger.info("Daily snapshot job skipped: no enabled countries");
      return null;
    }

    const { selectedCountries, nextRotationCursor, maxCountriesPerCycle } =
      computeCountrySelection(countries, {
        intervalMinutes,
        dailyBudget,
        rotationCursor,
      });

    rotationCursor = nextRotationCursor;

    const snapshotDate = todayISODate();

    const snapshot = await prisma.snapshot.upsert({
      where: { date: snapshotDate },
      update: {
        status: "partial",
      },
      create: {
        date: snapshotDate,
        status: "partial",
        totalArticles: 0,
      },
    });

    let succeededCountries = 0;
    let failedCountries = 0;

    for (const country of selectedCountries) {
      try {
        const normalizedArticles = await fetchCountryHeadlines(country.iso2);
        await replaceCountrySnapshotItems(snapshot.id, country, normalizedArticles);
        succeededCountries += 1;

        logger.info("Country snapshot refreshed", {
          country: country.iso2,
          articles: normalizedArticles.length,
        });
      } catch (err) {
        failedCountries += 1;
        logger.error("Country ingestion failed", {
          country: country.iso2,
          error: err?.message || String(err),
        });
      }
    }

    await recalculateSnapshotRanks(snapshot.id);

    const totalArticles = await prisma.snapshotItem.count({
      where: { snapshotId: snapshot.id },
    });

    const status =
      succeededCountries === 0
        ? "failed"
        : failedCountries > 0
        ? "partial"
        : "success";

    await prisma.snapshot.update({
      where: { id: snapshot.id },
      data: {
        totalArticles,
        status,
      },
    });

    const result = {
      date: snapshotDate,
      totalArticles,
      status,
      selectedCountries: selectedCountries.map((country) => country.iso2),
      maxCountriesPerCycle,
      succeededCountries,
      failedCountries,
    };

    logger.info("Daily snapshot generated", result);
    return result;
  } catch (err) {
    logger.error("Daily snapshot job failed", err);
    throw err;
  } finally {
    isRunning = false;
  }
}

module.exports = {
  runDailySnapshotJob,
  computeCountrySelection,
  todayISODate,
};
