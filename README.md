# Ukraine Digest - Global Media Snapshot MVP

Ukraine Digest is an MVP that shows how different countries cover news about Ukraine.

- MVP prototype was created with Lovable: https://ukrainedigest.lovable.app/
- Production deployment: https://ukrainedigest.netlify.app/

## Screenshots

**Homepage**
![Homepage](docs/screenshots/homepage.png)

**Country View**
![Country View](docs/screenshots/country-view.png)

## What this project does

- Aggregates real articles about Ukraine from 12 countries.
- Stores normalized article snapshots in PostgreSQL via Prisma.
- Exposes a snapshot API for frontend filters (region/country/date).
- Shows real external article URLs in UI (open original source).
- Updates data automatically on schedule (every 3 hours in Netlify).

## Core Features

- Real ingestion from NewsAPI (not mock-only flow).
- Quota-aware country selection for free plan usage.
- Country cards include empty states for countries with no articles.
- Comparison view for selected countries.
- Snapshot API contract with:
  - `articles[]`
  - `countries[]` (including `articleCount = 0`)
  - `regions[]`
  - `meta.generatedAt`

## Tech Stack

- Frontend: React + Vite + TypeScript + React Query + Tailwind.
- Backend: Node.js + Express.
- Database: PostgreSQL (Supabase is supported) + Prisma ORM.
- Deployment: Netlify (static frontend + serverless functions + scheduled function).

## Project Structure

```text
.
|- client/                    # Frontend (Vite/React)
|- server/                    # Backend (Express + Prisma + jobs)
|- netlify/functions/
|  |- api.js                  # Express API as Netlify Function
|  |- ingest-scheduled.js     # Scheduled trigger (every 3 hours)
|  |- ingest-background.js    # Background ingestion executor
|- netlify.toml               # Netlify build/functions config
|- NETLIFY_DEPLOY.md          # Additional Netlify notes
```

## Prerequisites

- Node.js 20+ (recommended)
- npm 10+
- PostgreSQL database
- NewsAPI key

## Environment Variables

Create `server/.env` (or update existing) using `server/.env.example`.

Required:

- `DATABASE_URL` - runtime DB connection string
- `DIRECT_URL` - direct DB URL for Prisma migrations
- `NEWS_API_KEY` - NewsAPI token

Recommended defaults:

- `NEWS_QUERY=ukraine`
- `INGEST_PAGE_SIZE=10`
- `INGEST_INTERVAL_MINUTES=180`
- `NEWS_API_DAILY_BUDGET=90`
- `INGEST_TRIGGER_SECRET=<long-random-secret>`

## Local Development

### 1. Install dependencies

From repository root:

```bash
npm install
npm run install:all
```

### 2. Generate Prisma client

```bash
npm run prisma:generate
```

### 3. Apply migrations

```bash
npm run prisma:migrate:deploy
```

### 4. Start frontend + backend together

```bash
npm run dev
```

- Frontend: `http://localhost:8080`
- API: `http://localhost:5001`

### 5. Force one ingestion cycle (optional)

```bash
npm run ingest:once
```

### 6. Run tests (optional)

```bash
npm run test --prefix server
npm run test --prefix client
```

## API Endpoints

- `GET /api/` - API health/info
- `GET /api/snapshot`
- `GET /api/snapshot?date=YYYY-MM-DD`
- `GET /api/snapshot?country=DE`
- `GET /api/snapshot?region=EUROPE`

## Netlify Deployment (Current Setup)

This repo is already configured for Netlify with `netlify.toml`.

### 1. Import project

- Branch: `main`

### 2. Set environment variables in Netlify

Add in Site settings -> Environment variables:

- `DATABASE_URL`
- `DIRECT_URL`
- `NEWS_API_KEY`
- `INGEST_TRIGGER_SECRET`

Optional:

- `NEWS_QUERY`
- `INGEST_PAGE_SIZE`
- `INGEST_INTERVAL_MINUTES`
- `NEWS_API_DAILY_BUDGET`

### 3. Deploy

- Trigger deploy (recommended: Clear cache and deploy site if config changed)

### 4. Verify after deploy

- Open `https://<your-site>.netlify.app/api/snapshot`
- Check Netlify Functions:
  - `api`
  - `ingest-scheduled`
  - `ingest-background`

### 5. Trigger first ingestion manually (recommended once)

```bash
curl -X POST "https://<your-site>.netlify.app/.netlify/functions/ingest-background" \
  -H "x-ingest-secret: <INGEST_TRIGGER_SECRET>"
```

## Notes

- Do not commit `.env` and secrets.
- If articles are missing, first check:
  - Netlify function logs
  - NewsAPI quota/limits
  - DB connection variables
- `seed` uses example data and is mostly for local bootstrap/testing.
