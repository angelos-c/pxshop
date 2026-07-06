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

## Going live checklist

Nothing here needs to happen until you're actually ready to launch — don't run the live sync or set live keys prematurely, since nothing reads from the live catalogue until the site is deployed and pointed at it.

1. Re-run the scraper if it's been a while, so prices/stock are current.
2. Add `STRIPE_SECRET_KEY_LIVE=sk_live_...` to `.env.local`.
3. Run `npm run sync:stripe:live`.
4. In Vercel's project settings (production environment), set:
   - `STRIPE_SECRET_KEY` = the live key (`sk_live_...`)
   - `NEXT_PUBLIC_SITE_URL` = the real production domain
5. Deploy.
6. In the Stripe Dashboard, create a webhook endpoint pointing at `https://<domain>/api/webhooks/stripe`, then copy its signing secret into Vercel's `STRIPE_WEBHOOK_SECRET`.
7. Do one real, small end-to-end test purchase in live mode to confirm everything works with real money moving.

### Other pre-launch items (manual, no API for these)

- Stripe Dashboard → Checkout branding: set brand red as primary, cream as secondary.
- Review MCC (currently 7538, consider 5533 — auto parts) and payout schedule (currently manual) in Stripe settings.
- Replace placeholder footer links (Shipping & Returns, Privacy Policy) with real pages.
- Re-login the local Stripe CLI (`stripe login`) to the Projectxtuning account if you want `stripe listen` for local webhook testing.

## Tech stack

- Next.js 16 (App Router, TypeScript, Turbopack)
- Tailwind v4 + shadcn/ui (heavily customized — cream background, brand red, zero radius, hairline rules)
- Stripe (Checkout, Products/Prices as catalogue, webhooks)
- Deployed on Vercel
