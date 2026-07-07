# Project X Tuning — Storefront

A curated automotive parts e-shop (Eventuri, Black Mamba, ZRP, and more) built with Next.js 16, Tailwind v4, and Stripe. Stripe is the **single source of truth** for the product catalogue — there is no local product database. Product data itself is scraped from `b2bmotorsport.com` and pushed into Stripe by a local script.

## How data flows

```
b2bmotorsport.com  →  scrape-b2b-catalog.mjs  →  src/data/*.generated.json  →  sync-stripe-catalog.mjs  →  Stripe Products/Prices
                                                                                                                     ↓
                                                                                            src/lib/products.ts reads + caches from Stripe
                                                                                                                     ↓
                                                                                                      Next.js pages render the storefront
```

- **Scraping** logs into b2bmotorsport.com and pulls images, prices, stock, and descriptions per brand.
- **Syncing** pushes that scraped data into Stripe as real `Product`/`Price` objects (SKU = Stripe Product id). Price changes create a new immutable `Price` and archive the old one. SKUs no longer in the scrape get archived (not deleted), so past orders still resolve.
- **The app** (`src/lib/products.ts`) only ever reads from Stripe, with a 5-minute cache (`unstable_cache`, tag `catalog`).
- **Checkout** uses real Stripe `Price` ids (never `price_data`) and Stripe's own hosted Checkout page.

## Getting started (local dev)

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill in:

- `B2B_MOTORSPORT_EMAIL` / `B2B_MOTORSPORT_PASSWORD` — only needed to run the scraper.
- `STRIPE_SECRET_KEY` — a **test-mode** (`sk_test_...`) key for local dev. Get one from the [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys).
- `STRIPE_WEBHOOK_SECRET` — run `stripe listen --forward-to localhost:3000/api/webhooks/stripe` and paste the `whsec_...` it prints.
- `NEXT_PUBLIC_SITE_URL` — `http://localhost:3000` locally.

Open [http://localhost:3000](http://localhost:3000).

## Refreshing the catalogue

Re-scrape a brand (only needed when prices/stock/new products change upstream):

```bash
npm run scrape:eventuri
npm run scrape:black-mamba
npm run scrape:zrp
```

Then push the result into Stripe test mode (safe to run anytime, idempotent):

```bash
npm run sync:stripe:test
```

Add `STRIPE_SECRET_KEY_TEST` / `STRIPE_SECRET_KEY_LIVE` to `.env.local` for these sync scripts (separate from the app's own `STRIPE_SECRET_KEY` — see `.env.example`). Test and live are entirely separate Stripe catalogues, so a sync only ever affects one at a time.

## Going live checklist — current status (as of 2026-07-07)

**TL;DR of where things stand:** code is deployed to Vercel and pointed at **live** Stripe mode, but the live Stripe catalogue is still **empty** — `npm run sync:stripe:live` has never been run, only `sync:stripe:test` has. That's why the deployed site currently shows no products. **The very next step is to run the live sync**, which needs the production URL (see step 3 below).

Repo: `https://github.com/angelos-c/pxshop` (pushed, `main` branch is current). Vercel project was created **manually** through the Vercel dashboard (not linked via the Vercel MCP — that was deferred, see "MCP" note at the bottom).

1. ~~Init git repo, push to GitHub~~ — done.
2. ~~Create Vercel project, link to the GitHub repo~~ — done (manually, via Vercel's web UI).
3. ~~Set `STRIPE_SECRET_KEY` in Vercel to the live key~~ — done. (There was one false start where the wrong value got pasted in — first deploy showed the Stripe Checkout "Sandbox" badge because of that; confirmed fixed by re-pasting the correct `sk_live_...` key and redeploying.)
4. **← NEXT STEP:** Run the live sync so the live Stripe catalogue actually has products in it:
   - Get the real production URL from the Vercel project dashboard (e.g. `https://pxshop-something.vercel.app`, or a custom domain if one's been attached).
   - Add `STRIPE_SECRET_KEY_LIVE=sk_live_...` to `.env.local` if it isn't already there (there's a commented-out `sk_live_...` value near the top of `.env.local` from earlier — confirm whether that's still the correct/current live secret key before reusing it).
   - Run the sync with the production URL, e.g.:
     ```bash
     NEXT_PUBLIC_SITE_URL=https://<production-domain> node --env-file=.env.local scripts/sync-stripe-catalog.mjs --mode=live
     ```
     (Don't permanently change `NEXT_PUBLIC_SITE_URL` in `.env.local` for this — that file's value should stay `http://localhost:3000` for local dev. Just override it inline for this one command, since the sync script needs it to build the absolute image URLs it stores on each Stripe Product.)
   - Confirm output ends with `failed=0`.
5. Reload the production site and confirm products now render (homepage brand showcases + `/shop`).
6. In the Stripe Dashboard, create a webhook endpoint pointing at `https://<production-domain>/api/webhooks/stripe`, then copy its signing secret into Vercel's `STRIPE_WEBHOOK_SECRET` (Production environment) and redeploy.
7. Do one real, small end-to-end test purchase in live mode (a real card, real charge) to confirm the whole flow works end-to-end with real money moving. (We already did a full end-to-end test in **test** mode locally with the `4242` test card — homepage → bag → Stripe Checkout → paid → order confirmation page — and it worked cleanly. Live mode just hasn't been verified yet.)

### Keeping the live catalogue in sync going forward

Whenever the scraper re-runs and prices/stock change, re-run the live sync the same way (with `NEXT_PUBLIC_SITE_URL` pointed at production) to push those changes to the live Stripe catalogue. The sync script is idempotent/safe to re-run anytime.

### Other pre-launch items (manual, no API for these — none started yet)

- Stripe Dashboard → Checkout branding: set brand red as primary, cream as secondary.
- Review MCC (currently 7538, consider 5533 — auto parts) and payout schedule (currently manual) in Stripe settings.
- Replace placeholder footer links (Shipping & Returns, Privacy Policy) with real pages.
- Re-login the local Stripe CLI (`stripe login`) to the Projectxtuning account if you want `stripe listen` for local webhook testing.

### Note on the Vercel MCP

There's a Vercel MCP server available for programmatic project management, but authenticating it (`mcp_auth`) errored out mid-session and the user opted to just create/configure the Vercel project manually through the dashboard instead. Revisit connecting it later if convenient, but it's not a blocker for anything above.

## Tech stack

- Next.js 16 (App Router, TypeScript, Turbopack)
- Tailwind v4 + shadcn/ui (heavily customized — cream background, brand red, zero radius, hairline rules)
- Stripe (Checkout, Products/Prices as catalogue, webhooks)
- Deployed on Vercel
