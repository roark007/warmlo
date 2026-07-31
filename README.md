# Warmlo

> **Know what's wrong. Know what it should cost. Know who to call.**

Free consumer website for homeowners with heating/cooling problems. Phase 1 ships the skeleton: FixCode lookup (Goodman brand), route structure, legal pages, data validation, and CI.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Verification

```bash
npm run verify
```

Runs lint, typecheck, unit tests, data validation, production build, and post-build site checks.

## Environment

Copy `.env.example` to `.env.local` and fill in values when enabling lead storage (Phase 3):

- `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` — lead storage
- `RESEND_API_KEY` — email fallback
- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — analytics
- `NEXT_PUBLIC_SITE_URL` — canonical URLs and sitemap

## Pre-launch checklist

1. All JSON validates (`npm run verify` passes).
2. Spot-check 10 random code pages for accuracy against known code tables.
3. Legal pages live; disclosure in footer sitewide.
4. Lead form writes to Supabase; TCPA box enforced.
5. Sitemap submitted to Google Search Console.
6. Old repos archived.

## Project structure

- `data/` — JSON content (brands, codes, repairs, quote benchmarks)
- `src/app/` — Next.js App Router pages
- `src/components/` — UI components (FRONTEND_BRIEF.md tokens)
- `src/lib/` — schemas, data loaders, verdict engine
- `src/config/` — affiliates, featured repairs, job mapping
- `scripts/` — validate-data, check-site
- `tests/` — vitest unit tests

## Phase status

- **Phase 1 (current):** Skeleton — 1 brand (Goodman), 6 codes, all routes, legal, sitemap, CI
- **Phase 2:** FixCode at scale (17 brands, 200+ codes)
- **Phase 3:** QuoteCheck flow, `/api/lead`, affiliates
- **Phase 4:** Cost guides polish, Lighthouse pass

See `BUILD_BRIEF.md` for full specification.
