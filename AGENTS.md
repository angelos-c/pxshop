<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Cursor Cloud specific instructions

Single product: `pxshop`, a Next.js 16 (App Router, Turbopack) + Tailwind v4 + Stripe storefront. Package manager is **npm** (only `package-lock.json`). Dependencies are installed by the startup update script (`npm install`); standard scripts (`dev`, `build`, `start`, `lint`, `scrape:*`, `sync:stripe:*`) live in `package.json`, and dev/env details are in `README.md`.

Non-obvious caveats for running it:

- **Stripe is the single source of truth for the catalogue — there is no local product DB.** `src/lib/stripe.ts` throws at import time if `STRIPE_SECRET_KEY` is missing, so any page that reads the catalogue (home `/`, `/shop`, `/shop/[slug]`, `/checkout/success`, and the `/api/checkout` + `/api/webhooks/stripe` routes) returns 500 without it. The app reads `STRIPE_SECRET_KEY` straight from the environment.
- In Cursor Cloud, `STRIPE_SECRET_KEY` is provided as an **injected secret** (present in the VM env at boot), so you do **not** need a `.env.local` to run the storefront — just `npm run dev`. (`.env.local` is gitignored and there is **no** committed `.env.example` despite the README referencing one; it's only needed for the `scrape:*` / `sync:stripe:*` scripts, which load it via `node --env-file=.env.local`.)
- **The injected `STRIPE_SECRET_KEY` is a LIVE key (`sk_live_...`).** Do NOT initiate Stripe Checkout or any payment during testing — a completed checkout is a real charge. Browsing, catalogue rendering, and adding to the (client-side) bag are safe; stop before `/api/checkout`. The catalogue is already populated, so the storefront renders products out of the box.
- A syntactically-valid-but-wrong key still boots Next but every catalogue page 500s with a Stripe `401`. With no products in the account, the storefront renders but shows empty brand showcases; populate via `npm run sync:stripe:test` (reads `src/data/*.generated.json`, produced by the `scrape:*` scripts that need `b2bmotorsport.com` credentials).
- The cart is client-side only (`localStorage`); `/bag` renders fully without any Stripe key, which is the easiest smoke test that the dev server is up.
- `stripe listen --forward-to localhost:3000/api/webhooks/stripe` (Stripe CLI) is only needed to test the post-payment webhook path; browsing and checkout work without it.
