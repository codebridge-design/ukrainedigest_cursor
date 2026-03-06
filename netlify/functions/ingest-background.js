const { prisma } = require("../../server/src/config/prisma");
const { runDailySnapshotJob } = require("../../server/src/jobs/dailySnapshot.job");

function getHeader(headers, key) {
  if (!headers) return null;
  const lowerKey = String(key || "").toLowerCase();
  for (const headerName of Object.keys(headers)) {
    if (headerName.toLowerCase() === lowerKey) {
      return headers[headerName];
    }
  }
  return null;
}

exports.handler = async (event) => {
  const expectedSecret = String(process.env.INGEST_TRIGGER_SECRET || "").trim();
  const providedSecret = String(getHeader(event?.headers, "x-ingest-secret") || "").trim();

  if (!expectedSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: "INGEST_TRIGGER_SECRET is not configured" }),
    };
  }

  if (!providedSecret || providedSecret !== expectedSecret) {
    return {
      statusCode: 401,
      body: JSON.stringify({ ok: false, error: "Unauthorized" }),
    };
  }

  try {
    const result = await runDailySnapshotJob();
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, result }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: error?.message || "Ingestion failed" }),
    };
  } finally {
    await prisma.$disconnect();
  }
};
