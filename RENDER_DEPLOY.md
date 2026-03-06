# Render Deployment Guide

This repo is prepared for Render Blueprint deployment via `render.yaml`.

## What will be created

- `ukrainedigest-web` (Static Site, from `client/`)
- `ukrainedigest-api` (Web Service, from `server/`)
- `ukrainedigest-ingest` (Cron Job, runs every 3 hours)

## 1. Push repository

Push this repository to GitHub/GitLab.

## 2. Create Blueprint in Render

1. In Render dashboard, click **New** -> **Blueprint**.
2. Select your repository.
3. Render reads `render.yaml` and shows 3 services.
4. Confirm creation.

## 3. Fill required environment variables

Set these on `ukrainedigest-api`:

- `DATABASE_URL` (runtime DB URL, can be Supabase pooler URL)
- `DIRECT_URL` (direct DB URL for Prisma migrate)
- `NEWS_API_KEY` (from newsapi.org)

Everything else is already defined in `render.yaml`.

`ukrainedigest-ingest` inherits DB and NewsAPI variables from `ukrainedigest-api`.

## 4. First deploy

`ukrainedigest-api` deploy will run:

- `npm ci && npx prisma generate --schema prisma/schema.prisma`
- `npx prisma migrate deploy --schema prisma/schema.prisma`
- `npm run start`

`ukrainedigest-ingest` runs `npm run ingest:once` every 3 hours (`0 */3 * * *`, UTC).

## 5. Verify

- API health: `https://<your-api-domain>/healthz`
- Snapshot API: `https://<your-api-domain>/api/snapshot`
- Frontend should load live data from API automatically.

## Notes

- Server-side in-process scheduler is disabled on Render by `SNAPSHOT_SCHEDULER_ENABLED=false`.
- Country bootstrap is automatic in ingestion if DB has no countries, so production does not require running `seed`.
