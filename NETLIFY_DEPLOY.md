# Netlify Deployment Guide

This repository is configured for Netlify via [`netlify.toml`](/home/max/Sites/ukrainedigest/netlify.toml).

## What is deployed

- Frontend: `client/dist` static site
- API: Express app via Netlify Function `netlify/functions/api.js`
- Ingestion scheduler:
  - Scheduled function: `netlify/functions/ingest-scheduled.js` (every 3 hours)
  - Background function: `netlify/functions/ingest-background.js`

## Required Netlify environment variables

Add these in **Site settings -> Environment variables**:

- `DATABASE_URL` (runtime URL, pooler is fine)
- `DIRECT_URL` (direct URL for Prisma migrate)
- `NEWS_API_KEY`
- `INGEST_TRIGGER_SECRET` (any long random secret, e.g. 32+ chars)

Optional (defaults are in code/config):

- `NEWS_QUERY` (`ukraine`)
- `INGEST_PAGE_SIZE` (`10`)
- `INGEST_INTERVAL_MINUTES` (`180`)
- `NEWS_API_DAILY_BUDGET` (`90`)
- `SNAPSHOT_SCHEDULER_ENABLED` (`false` on Netlify, because scheduler is external)

## Deploy steps

1. Netlify -> **Add new site** -> **Import an existing project**.
2. Pick repo: `maxkukish8/ukrainedigest-server`.
3. Leave Build settings from `netlify.toml` (auto-detected).
4. Add required environment variables listed above.
5. Deploy.

## Verify

- API health: `https://<your-site>.netlify.app/api/`
- Snapshot: `https://<your-site>.netlify.app/api/snapshot`
- Scheduler:
  - Netlify -> **Functions** -> `ingest-scheduled`
  - Trigger manually once from UI to seed first snapshot immediately
