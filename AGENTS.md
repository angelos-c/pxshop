<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single product: `pxshop`, a Next.js 16 (App Router, Turbopack) + Tailwind v4 + Stripe storefront. Package manager is **npm** (only `package-lock.json`). Dependencies are installed by the startup update script (`npm install`); standard scripts (`dev`, `build`, `start`, `lint`, `scrape:*`, `sync:stripe:*`) live in `package.json`, and dev/env details are in `README.md`.

Non-obvious caveats for running it:

- **Stripe is the single source of truth for the catalogue — there is no local product DB.** `src/lib/stripe.ts` throws at import time if `STRIPE_SECRET_KEY` is missing, so any page that reads the catalogue (home `/`, `/shop`, `/shop/[slug]`, `/checkout/success`, and the `/api/checkout` + `/api/webhooks/stripe` routes) returns 500 without it. To run the storefront you must create `.env.local` (gitignored; there is **no** committed `.env.example` despite the README referencing one) with at least `STRIPE_SECRET_KEY=sk_test_...` (test mode) and `NEXT_PUBLIC_SITE_URL=http://localhost:3000`.
- A syntactically-valid-but-wrong key still boots Next but every catalogue page 500s with a Stripe `401`. A real test-mode key is required for the storefront to render.
- Even with a valid test key, the storefront shows **nothing** until the Stripe *test* catalogue actually contains products. Populate it with `npm run sync:stripe:test`, which reads `src/data/*.generated.json` (gitignored, produced by the `scrape:*` scripts that need `b2bmotorsport.com` credentials) — so a first-time env has an empty catalogue until those are run or products are seeded in Stripe directly.
- The cart is client-side only (`localStorage`); `/bag` renders fully without any Stripe key, which is the easiest smoke test that the dev server is up.
- `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (Stripe CLI) is only needed to test the post-payment webhook path; browsing and checkout work without it.
