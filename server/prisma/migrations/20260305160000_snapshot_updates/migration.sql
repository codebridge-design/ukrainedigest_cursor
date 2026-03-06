-- Add updatedAt to Snapshot
ALTER TABLE "Snapshot"
ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Replace unique URL constraint with composite unique (url, countryId)
DROP INDEX IF EXISTS "Article_url_key";
CREATE UNIQUE INDEX "Article_url_countryId_key" ON "Article"("url", "countryId");
