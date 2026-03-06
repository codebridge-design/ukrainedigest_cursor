const test = require("node:test");
const assert = require("node:assert/strict");

const {
  normalizeNewsApiArticle,
  dedupeArticlesByUrl,
} = require("./newsApi.service");

test("normalizeNewsApiArticle trims text and keeps valid URL", () => {
  const normalized = normalizeNewsApiArticle({
    title: "  Example title  ",
    description: "  Example summary   ",
    url: "https://example.com/article",
    source: { name: "  Example Source " },
    publishedAt: "2026-03-05T09:00:00.000Z",
  });

  assert.ok(normalized);
  assert.equal(normalized.title, "Example title");
  assert.equal(normalized.summary, "Example summary");
  assert.equal(normalized.sourceName, "Example Source");
  assert.equal(normalized.domain, "example.com");
});

test("normalizeNewsApiArticle rejects invalid URL and dedupes by URL", () => {
  const invalid = normalizeNewsApiArticle({
    title: "No URL",
    url: "javascript:alert(1)",
  });

  assert.equal(invalid, null);

  const deduped = dedupeArticlesByUrl([
    { url: "https://example.com/a" },
    { url: "https://example.com/a" },
    { url: "https://example.com/b" },
  ]);

  assert.equal(deduped.length, 2);
});
