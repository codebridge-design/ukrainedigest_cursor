# Ukraine Digest — Server

Express + Prisma backend for the Ukraine Digest frontend.

## Features

- `GET /api/snapshot` — returns the latest snapshot with:
  - `articles[]` (real article URLs and metadata)
  - `countries[]` (including countries with `articleCount = 0`)
  - `regions[]` (for frontend filters)
- Scheduled ingestion from NewsAPI every `INGEST_INTERVAL_MINUTES` (default 180).
- Quota-aware country rotation for NewsAPI free plan.

## Required env

```bash
PORT=5001
FRONTEND_URL=http://localhost:8080
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEWS_API_KEY=...
NEWS_QUERY=ukraine
INGEST_PAGE_SIZE=10
INGEST_INTERVAL_MINUTES=180
NEWS_API_DAILY_BUDGET=90
SNAPSHOT_SCHEDULER_ENABLED=true
```

## Quick start

```bash
cd server
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```
