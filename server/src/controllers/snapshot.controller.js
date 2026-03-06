const { prisma } = require("../config/prisma");

const REGION_NAME = {
  UNKNOWN: "Unknown",
  EUROPE: "Europe",
  NORTH_AMERICA: "North America",
  SOUTH_AMERICA: "South America",
  AFRICA: "Africa",
  ASIA: "Asia",
  OCEANIA: "Oceania",
};

function regionToId(region) {
  return String(region || "UNKNOWN").toLowerCase().replace(/_/g, "-");
}

function isValidDateString(dateStr) {
  return typeof dateStr === "string" && /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
}

function normalizeRegionName(region) {
  return REGION_NAME[region] || REGION_NAME.UNKNOWN;
}

function buildRegions(countries) {
  const byRegion = new Map();

  for (const country of countries) {
    const region = country.region || "UNKNOWN";
    if (!byRegion.has(region)) {
      byRegion.set(region, {
        id: regionToId(region),
        name: normalizeRegionName(region),
        countries: [],
      });
    }

    byRegion.get(region).countries.push(country.iso2);
  }

  return Array.from(byRegion.values())
    .map((region) => ({
      ...region,
      countries: region.countries.sort((a, b) => a.localeCompare(b)),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function getSnapshot(req, res, next) {
  try {
    const { date, country, region } = req.query;

    let snapshot;
    if (date) {
      if (!isValidDateString(date)) {
        return res
          .status(400)
          .json({ ok: false, error: "Invalid date format. Use YYYY-MM-DD." });
      }
      snapshot = await prisma.snapshot.findUnique({ where: { date } });
    } else {
      snapshot = await prisma.snapshot.findFirst({
        orderBy: { date: "desc" },
      });
    }

    if (!snapshot) {
      return res.status(404).json({ ok: false, error: "Snapshot not found." });
    }

    const whereArticle = {};
    if (region) whereArticle.region = region;
    if (country) whereArticle.country = { iso2: country };

    const [items, allItemsForCounts, countryRows] = await Promise.all([
      prisma.snapshotItem.findMany({
        where: {
          snapshotId: snapshot.id,
          article: Object.keys(whereArticle).length ? whereArticle : undefined,
        },
        include: {
          article: {
            include: {
              source: true,
              country: true,
            },
          },
        },
        orderBy: [{ rank: "asc" }, { createdAt: "asc" }],
        take: 500,
      }),
      prisma.snapshotItem.findMany({
        where: {
          snapshotId: snapshot.id,
        },
        select: {
          article: {
            select: {
              countryId: true,
            },
          },
        },
      }),
      prisma.country.findMany({
        where: {
          isEnabled: true,
          iso2: {
            not: "ZZ",
          },
        },
        orderBy: [{ name: "asc" }],
      }),
    ]);

    const countryCountById = allItemsForCounts.reduce((acc, item) => {
      const countryId = item.article?.countryId;
      if (!countryId) return acc;
      acc.set(countryId, (acc.get(countryId) || 0) + 1);
      return acc;
    }, new Map());

    const countries = countryRows.map((countryRow) => ({
      code: countryRow.iso2,
      name: countryRow.name,
      region: normalizeRegionName(countryRow.region),
      articleCount: countryCountById.get(countryRow.id) || 0,
    }));

    const regions = buildRegions(countryRows);

    const articles = items.map((item) => ({
      id: String(item.article.id),
      headline: item.article.title,
      summary: item.article.summary,
      source: item.article.source?.name || "Unknown source",
      country: item.article.country?.name || "Unknown",
      countryCode: item.article.country?.iso2 || null,
      region: normalizeRegionName(item.article.region),
      publishedAt: item.article.publishedAt,
      url: item.article.url,
    }));

    return res.json({
      ok: true,
      date: snapshot.date,
      total: articles.length,
      articles,
      countries,
      regions,
      meta: {
        generatedAt: snapshot.updatedAt || snapshot.createdAt,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getSnapshot };
