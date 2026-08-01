# Warmlo

> **Know what's wrong. Know what it should cost. Know who to call.**

Free consumer website for homeowners with heating/cooling problems. FixCode error lookup, repair cost guides, and QuoteCheck quote verification.

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

### Lighthouse (Phase 4 gate)

After a production build, check mobile performance on the primary code page:

```bash
npm run build
npm run start
# In another terminal:
npx lighthouse http://localhost:3000/fix/goodman/e4 --only-categories=performance --form-factor=mobile --chrome-flags=--headless
```

Target: **Performance ≥ 95** on `/fix/goodman/e4` (measured **99** mobile after StaticLink + inlineCss optimizations; commit `d7e2f29`).

## Environment

Copy `.env.example` to `.env.local`. For the lead form (QuoteCheck), use **Supabase free tier** — separate from Resend, no credit card for the free plan.

### Lead storage (Supabase — recommended)

1. Create a free project at [supabase.com](https://supabase.com).
2. Run the SQL from `scripts/supabase-leads.sql` in **SQL Editor**.
3. Get credentials (Supabase updated their dashboard in 2026):
   - Open your project → **Connect** (top of the page) → copy **Project URL**
   - Or: **Project Settings** (gear) → **API Keys**
   - Copy a **Secret** key (`sb_secret_...`) from the **API Keys** tab  
     — or, on the **Legacy API Keys** tab, copy **service_role** (long `eyJ...` string)
4. Add to Vercel / `.env.local`:
   - `SUPABASE_URL` — the Project URL (`https://xxxxx.supabase.co`)
   - `SUPABASE_SERVICE_KEY` — the **Secret** or **service_role** key (server-only, never in the browser)
5. **Redeploy** on Vercel after adding env vars.

### Email alerts (Brevo — recommended)

When someone submits the lead form, Supabase stores the row. For **instant email alerts**:

1. Create a free account at [brevo.com](https://brevo.com).
2. Verify a sender email under **Senders & IP**.
3. Add to Vercel / `.env.local`:
   - `BREVO_API_KEY` — from Brevo → SMTP & API → API keys
   - `LEAD_ALERT_EMAIL` — your inbox (e.g. `you@example.com`)
   - `BREVO_SENDER_EMAIL` — optional; must match a verified sender (defaults to `noreply@warmlo.com`)

Alerts are best-effort; the lead is still saved if the alert fails.

### Webhook alerts (optional)

Set `LEAD_ALERT_WEBHOOK_URL` for Discord, Slack, or Zapier notifications in addition to (or instead of) email.

### Optional webhook fallback

If Supabase is not configured, set `LEAD_WEBHOOK_URL` to a Slack, Discord, or Zapier catch URL. The API POSTs lead JSON via `fetch` (no extra dependencies).

### Other env vars

- `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` — analytics (Plausible, preferred when set)
- `NEXT_PUBLIC_GA_ID` — GA4 measurement ID (`G-…`), free fallback when Plausible is not configured
- `NEXT_PUBLIC_SITE_URL` — canonical URLs and sitemap

## Pre-launch checklist

1. All JSON validates (`npm run verify` passes).
2. Spot-check 10 random code pages for accuracy against known code tables.
3. Legal pages live; disclosure in footer sitewide.
4. Lead form writes to Supabase; TCPA box enforced.
5. Sitemap submitted to Google Search Console.
6. Old repos archived.

## Project structure

- `data/` — JSON content (brands, codes, repairs, quote benchmarks, quote index, symptoms)
- `src/app/` — Next.js App Router pages
- `src/components/` — UI components (FRONTEND_BRIEF.md tokens)
- `src/lib/` — schemas, data loaders, verdict engine
- `src/config/` — affiliates, featured repairs/codes, job mapping
- `scripts/` — validate-data, check-site, aggregate-quotes

### Quote Index (SEO Phase S3)

The **Warmlo HVAC Quote Index** lives at `/data/hvac-quote-index`. Fair ranges come from `data/quote-benchmarks.json`; submission statistics are written to `data/quote-index.json`.

**Refresh submission stats** (owner, after QuoteCheck volume grows):

```bash
# Requires SUPABASE_URL + SUPABASE_SERVICE_KEY in env (same as lead form)
npx tsx scripts/aggregate-quotes.ts
npm run verify
# commit data/quote-index.json and deploy
```

- Requires **≥20 quotes per job type** before median / %‑above‑fair stats publish.
- No PII is written to `quote-index.json` — only aggregates.
- Re-run after seasonal pushes or quarterly; see `SEO_BRIEF.md` §S4 cold-snap playbook.

**Initial / benchmark-only baseline:**

```bash
npx tsx scripts/seed-quote-index.ts
```

## SEO operations (Phase S4)

### Quarterly query mining (Google Search Console)

Run every ~3 months once Search Console has 8+ weeks of data:

1. Open [Google Search Console](https://search.google.com/search-console) → **Performance** → **Search results**.
2. Export queries with **Impressions ≥ 100** (last 3 months).
3. Sort into buckets:
   - **Missing code** → add object to `data/codes/{brand}.json` (see `HANDOFF_ADDING_CONTENT.md`).
   - **Missing symptom** → add to `data/symptoms.json` (proven demand only).
   - **Missing cost topic** → add to `data/repairs.json`.
   - **Junk** (city names, “near me”, unrelated) → ignore.
4. Add winners only — target **+20–40 validated pages per quarter**, never speculative bulk generation.
5. Run `npm run verify`, commit, deploy.

Never add city/ZIP/“near me” pages. One accurate JSON object beats fifty doorway pages.

### Seasonal calendar

| When | Owner actions |
|------|----------------|
| **September** (before first frost) | Re-verify cost data; update `dataUpdated` in `quote-benchmarks.json` + `quote-index.json`. Copy `septemberFurnaceFeaturedCodes` from `src/config/seasonalFeaturedCodes.ts` into `src/config/featuredCodes.ts`. Confirm GSC coverage has zero errors. |
| **First cold snap** | Run `npx tsx scripts/aggregate-quotes.ts` if QuoteCheck volume exists. Optional: pitch Quote Index stats to local news / HVAC newsletters (one email, ~10 sends). |
| **June** (before AC season) | Rotate home featured codes using `juneAcFeaturedCodes` in `seasonalFeaturedCodes.ts`. Consider featuring AC symptom pages on home when symptom module exists. Refresh benchmarks if prices shifted. |
| **Quarterly** | Query mining loop (above). |

Featured code rotation is manual: edit `src/config/featuredCodes.ts`, run verify, deploy.

### Owner checklist (one-time / ongoing)

- [x] Google Search Console verified, sitemap submitted (`https://warmlo.com/sitemap.xml`)
- [x] GA4 live (`NEXT_PUBLIC_GA_ID` on Vercel)
- [ ] Affiliate network approvals (Networx, Profitise, CJ) — edit `src/config/affiliates.ts` when approved
- [ ] Spot-check ~10 code pages + ~10 symptom pages for accuracy
- [ ] Delete test lead row in Supabase (`TEST - please ignore`)

- `tests/` — vitest unit tests

## Phase status

- **Build phases 1–4:** Complete (FixCode, QuoteCheck, cost guides, CI)
- **SEO S1:** Snippet answers, HowTo JSON-LD, llms.txt
- **SEO S2:** 30 symptom pages
- **SEO S3:** HVAC Quote Index
- **SEO S4:** About page, ops docs (this section)

See `BUILD_BRIEF.md` and `SEO_BRIEF.md` for full specification.
