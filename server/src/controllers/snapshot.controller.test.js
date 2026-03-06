const test = require("node:test");
const assert = require("node:assert/strict");

const { prisma } = require("../config/prisma");
const { getSnapshot } = require("./snapshot.controller");

function createResponseMock() {
  return {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function mockPrismaForSnapshot() {
  const originals = {
    findFirst: prisma.snapshot.findFirst,
    findUnique: prisma.snapshot.findUnique,
    snapshotItemFindMany: prisma.snapshotItem.findMany,
    countryFindMany: prisma.country.findMany,
  };

  prisma.snapshot.findFirst = async () => ({
    id: 1,
    date: "2026-03-05",
    createdAt: new Date("2026-03-05T08:00:00.000Z"),
    updatedAt: new Date("2026-03-05T09:00:00.000Z"),
  });

  prisma.snapshot.findUnique = async () => null;

  prisma.snapshotItem.findMany = async (args) => {
    if (args.include) {
      return [
        {
          article: {
            id: 101,
            title: "Germany coverage headline",
            summary: "Summary",
            url: "https://example.com/de-1",
            region: "EUROPE",
            publishedAt: new Date("2026-03-05T09:00:00.000Z"),
            source: { name: "Example Source" },
            country: { name: "Germany", iso2: "DE" },
          },
        },
      ];
    }

    return [{ article: { countryId: 10 } }];
  };

  prisma.country.findMany = async () => [
    { id: 10, iso2: "DE", name: "Germany", region: "EUROPE" },
    { id: 11, iso2: "FR", name: "France", region: "EUROPE" },
  ];

  return () => {
    prisma.snapshot.findFirst = originals.findFirst;
    prisma.snapshot.findUnique = originals.findUnique;
    prisma.snapshotItem.findMany = originals.snapshotItemFindMany;
    prisma.country.findMany = originals.countryFindMany;
  };
}

test("getSnapshot returns frontend contract with countries and regions", async () => {
  const restore = mockPrismaForSnapshot();

  try {
    const req = { query: {} };
    const res = createResponseMock();

    await getSnapshot(req, res, (err) => {
      throw err;
    });

    assert.equal(res.statusCode, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.date, "2026-03-05");
    assert.equal(res.body.articles[0].headline, "Germany coverage headline");
    assert.equal(res.body.articles[0].countryCode, "DE");
    assert.equal(res.body.articles[0].url, "https://example.com/de-1");

    const germany = res.body.countries.find((country) => country.code === "DE");
    const france = res.body.countries.find((country) => country.code === "FR");

    assert.equal(germany.articleCount, 1);
    assert.equal(france.articleCount, 0);
    assert.equal(res.body.regions[0].id, "europe");
    assert.ok(res.body.meta.generatedAt);
  } finally {
    restore();
  }
});
