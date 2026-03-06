require("dotenv").config();
const { app } = require("./app");
const { runDailySnapshotJob } = require("./jobs/dailySnapshot.job");

const PORT = Number(process.env.PORT || 5001);

function parseBoolean(value, fallback = true) {
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  return !["0", "false", "no", "off"].includes(normalized);
}

function parsePositiveInt(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

function scheduleSnapshotJob() {
  if (!parseBoolean(process.env.SNAPSHOT_SCHEDULER_ENABLED, true)) {
    console.log("[info] Snapshot scheduler is disabled by SNAPSHOT_SCHEDULER_ENABLED");
    return;
  }

  const intervalMinutes = parsePositiveInt(process.env.INGEST_INTERVAL_MINUTES, 180);
  const intervalMs = intervalMinutes * 60 * 1000;

  if (!process.env.NEWS_API_KEY) {
    console.warn("[warn] NEWS_API_KEY is missing. Snapshot scheduler is disabled.");
    return;
  }

  const runJob = async () => {
    try {
      await runDailySnapshotJob();
    } catch (err) {
      console.error("[error] Snapshot scheduler cycle failed", err);
    }
  };

  runJob();
  setInterval(runJob, intervalMs);

  console.log(`[info] Snapshot scheduler started. Interval: ${intervalMinutes} minutes`);
}

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
  scheduleSnapshotJob();
});
