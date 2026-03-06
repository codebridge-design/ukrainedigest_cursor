/* server/prisma/seed.js (v2 schema) */
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

function todayISODate() {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

async function main() {
  const snapshotDate = todayISODate();
  console.log(`Seeding Ukraine Digest (v2) for date: ${snapshotDate}`);

  const unknownCountry = await prisma.country.upsert({
    where: { iso2: "ZZ" },
    update: { name: "Unknown", region: "UNKNOWN", tier: 3, isEnabled: true },
    create: { iso2: "ZZ", name: "Unknown", region: "UNKNOWN", tier: 3, isEnabled: true },
  });

  const countries = [
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

  for (const country of countries) {
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

  const countryRows = await prisma.country.findMany({
    where: { iso2: { in: ["ZZ", ...countries.map((country) => country.iso2)] } },
  });
  const countryByIso2 = new Map(countryRows.map((country) => [country.iso2, country]));

  const sources = [
    { iso2: "US", name: "Example US Outlet", domain: "example-us.com", homepageUrl: "https://example-us.com" },
    { iso2: "CA", name: "Example Canada Outlet", domain: "example-ca.ca", homepageUrl: "https://example-ca.ca" },
    { iso2: "GB", name: "Example UK Outlet", domain: "example-uk.co.uk", homepageUrl: "https://example-uk.co.uk" },
    { iso2: "DE", name: "Example Germany Outlet", domain: "example-de.de", homepageUrl: "https://example-de.de" },
    { iso2: "FR", name: "Example France Outlet", domain: "example-fr.fr", homepageUrl: "https://example-fr.fr" },
    { iso2: "PL", name: "Example Poland Outlet", domain: "example-pl.pl", homepageUrl: "https://example-pl.pl" },
    { iso2: "TR", name: "Example Turkey Outlet", domain: "example-tr.com", homepageUrl: "https://example-tr.com" },
    { iso2: "IN", name: "Example India Outlet", domain: "example-in.in", homepageUrl: "https://example-in.in" },
    { iso2: "JP", name: "Example Japan Outlet", domain: "example-jp.jp", homepageUrl: "https://example-jp.jp" },
    { iso2: "AU", name: "Example Australia Outlet", domain: "example-au.com.au", homepageUrl: "https://example-au.com.au" },
    { iso2: "BR", name: "Example Brazil Outlet", domain: "example-br.com.br", homepageUrl: "https://example-br.com.br" },
    { iso2: "ZA", name: "Example South Africa Outlet", domain: "example-za.co.za", homepageUrl: "https://example-za.co.za" },
    { iso2: "ZZ", name: "Unknown Source", domain: "unknown.local", homepageUrl: null },
  ];

  for (const source of sources) {
    const country = countryByIso2.get(source.iso2) || unknownCountry;
    await prisma.source.upsert({
      where: { domain: source.domain },
      update: {
        name: source.name,
        homepageUrl: source.homepageUrl,
        isEnabled: true,
        countryId: country.id,
        region: country.region ?? "UNKNOWN",
      },
      create: {
        name: source.name,
        domain: source.domain,
        homepageUrl: source.homepageUrl,
        isEnabled: true,
        countryId: country.id,
        region: country.region ?? "UNKNOWN",
      },
    });
  }

  const sourceRows = await prisma.source.findMany({
    where: { domain: { in: sources.map((source) => source.domain) } },
  });
  const sourceByDomain = new Map(sourceRows.map((source) => [source.domain, source]));

  const snapshot = await prisma.snapshot.upsert({
    where: { date: snapshotDate },
    update: { status: "success" },
    create: { date: snapshotDate, status: "success", totalArticles: 0 },
  });

  await prisma.snapshotItem.deleteMany({ where: { snapshotId: snapshot.id } });

  const now = new Date();

  const articles = [
    {
      iso2: "US",
      sourceDomain: "example-us.com",
      title: "Ukraine: daily overview from the US perspective",
      summary: "Concise snapshot focusing on policy framing and strategic context.",
      url: "https://example-us.com/ukraine-digest-us",
      hoursAgo: 2,
    },
    {
      iso2: "GB",
      sourceDomain: "example-uk.co.uk",
      title: "European security discussions around Ukraine continue",
      summary: "Coverage emphasizes regional security, alliances, and diplomatic positions.",
      url: "https://example-uk.co.uk/ukraine-digest-uk",
      hoursAgo: 3,
    },
    {
      iso2: "DE",
      sourceDomain: "example-de.de",
      title: "Germany: economic and energy angles in Ukraine coverage",
      summary: "Reports highlight economic implications, aid, and energy market effects.",
      url: "https://example-de.de/ukraine-digest-de",
      hoursAgo: 4,
    },
    {
      iso2: "FR",
      sourceDomain: "example-fr.fr",
      title: "France: diplomatic framing and EU coordination",
      summary: "Focus on diplomatic initiatives and broader EU alignment.",
      url: "https://example-fr.fr/ukraine-digest-fr",
      hoursAgo: 5,
    },
    {
      iso2: "PL",
      sourceDomain: "example-pl.pl",
      title: "Poland: regional proximity and security concerns",
      summary: "Emphasis on regional stability and security preparedness.",
      url: "https://example-pl.pl/ukraine-digest-pl",
      hoursAgo: 6,
    },
    {
      iso2: "IN",
      sourceDomain: "example-in.in",
      title: "India: international positioning and global markets",
      summary: "Narrative centers on international stance, trade and market signals.",
      url: "https://example-in.in/ukraine-digest-in",
      hoursAgo: 7,
    },
    {
      iso2: "JP",
      sourceDomain: "example-jp.jp",
      title: "Japan: sanctions and regional security considerations",
      summary: "Coverage references sanctions, international cooperation, and security context.",
      url: "https://example-jp.jp/ukraine-digest-jp",
      hoursAgo: 8,
    },
    {
      iso2: "TR",
      sourceDomain: "example-tr.com",
      title: "Turkey: mediation narrative and regional diplomacy",
      summary: "Focus on diplomacy, mediation roles, and regional dynamics.",
      url: "https://example-tr.com/ukraine-digest-tr",
      hoursAgo: 9,
    },
    {
      iso2: "AU",
      sourceDomain: "example-au.com.au",
      title: "Australia: international support and security alignment",
      summary: "Narrative emphasizes international support and security partnerships.",
      url: "https://example-au.com.au/ukraine-digest-au",
      hoursAgo: 10,
    },
    {
      iso2: "BR",
      sourceDomain: "example-br.com.br",
      title: "Brazil: global south framing and diplomatic balance",
      summary: "Coverage highlights diplomatic balance and global south perspectives.",
      url: "https://example-br.com.br/ukraine-digest-br",
      hoursAgo: 11,
    },
    {
      iso2: "ZA",
      sourceDomain: "example-za.co.za",
      title: "South Africa: geopolitical context and international reactions",
      summary: "Focus on geopolitical context and international responses.",
      url: "https://example-za.co.za/ukraine-digest-za",
      hoursAgo: 12,
    },
    {
      iso2: "CA",
      sourceDomain: "example-ca.ca",
      title: "Canada: allied perspective and humanitarian angle",
      summary: "Reports emphasize allied coordination and humanitarian context.",
      url: "https://example-ca.ca/ukraine-digest-ca",
      hoursAgo: 13,
    },
  ];

  const createdArticles = [];
  for (const article of articles) {
    const country = countryByIso2.get(article.iso2) || unknownCountry;
    const source = sourceByDomain.get(article.sourceDomain);

    if (!source) throw new Error(`Missing source for domain=${article.sourceDomain}`);

    const publishedAt = new Date(now.getTime() - article.hoursAgo * 60 * 60 * 1000);

    const dbArticle = await prisma.article.upsert({
      where: {
        url_countryId: {
          url: article.url,
          countryId: country.id,
        },
      },
      update: {
        title: article.title,
        summary: article.summary,
        countryId: country.id,
        sourceId: source.id,
        region: country.region ?? "UNKNOWN",
        publishedAt,
        language: "en",
      },
      create: {
        title: article.title,
        summary: article.summary,
        url: article.url,
        countryId: country.id,
        sourceId: source.id,
        region: country.region ?? "UNKNOWN",
        publishedAt,
        language: "en",
      },
    });

    createdArticles.push(dbArticle);
  }

  let rank = 1;
  for (const article of createdArticles) {
    await prisma.snapshotItem.upsert({
      where: {
        snapshotId_articleId: { snapshotId: snapshot.id, articleId: article.id },
      },
      update: { rank },
      create: { snapshotId: snapshot.id, articleId: article.id, rank },
    });
    rank += 1;
  }

  const total = await prisma.snapshotItem.count({ where: { snapshotId: snapshot.id } });
  await prisma.snapshot.update({
    where: { id: snapshot.id },
    data: { totalArticles: total, status: "success" },
  });

  console.log(`✅ Seed complete. Snapshot ${snapshotDate} has ${total} articles.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
