require("dotenv").config();

const { prisma } = require("../config/prisma");
const { runDailySnapshotJob } = require("../jobs/dailySnapshot.job");

async function main() {
  const result = await runDailySnapshotJob();

  if (!result) {
    console.log("Snapshot ingestion was skipped (check NEWS_API_KEY and enabled countries).");
    return;
  }

  console.log("Snapshot ingestion finished:", result);
}

main()
  .catch((error) => {
    console.error("Snapshot ingestion failed:", error?.message || error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
