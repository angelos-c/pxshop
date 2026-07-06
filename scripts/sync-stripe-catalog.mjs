#!/usr/bin/env node
/**
 * Pushes the locally scraped catalogues (src/data/*.generated.json) into
 * Stripe as real Product + Price objects, so Stripe is the single runtime
 * source of truth for the storefront (see src/lib/products.ts) — this script
 * is the *only* thing that writes to it.
 *
 * Each SKU becomes a Stripe Product with that exact SKU as its custom id
 * (no separate id-mapping file needed). Brand/category/fitment/slug live in
 * `metadata`. Prices are immutable in Stripe, so a price change creates a
 * new Price and archives the old one rather than editing in place. Any SKU
 * that no longer appears in the current scrape gets archived (`active:
 * false`) rather than deleted, so historical Checkout Sessions/orders that
 * reference it still resolve.
 *
 * Stripe test mode and live mode are entirely separate catalogues, so this
 * needs to be run once per mode:
 *
 *   node --env-file=.env.local scripts/sync-stripe-catalog.mjs --mode=test
 *   node --env-file=.env.local scripts/sync-stripe-catalog.mjs --mode=live
 *
 * Requires STRIPE_SECRET_KEY_TEST / STRIPE_SECRET_KEY_LIVE and
 * NEXT_PUBLIC_SITE_URL (used to build absolute image URLs for Stripe's own
 * Checkout/receipt UI) in the environment — see .env.example.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";
import { BRANDS } from "./brands.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

function toDescription(name, brandLabel) {
  return `${name}. Genuine ${brandLabel} part, officially imported by Project X Tuning.`;
}

/**
 * Stripe custom object ids only allow [a-zA-Z0-9_-] — a handful of SKUs use
 * dots (e.g. "BLM-DP.CAT-MK7") or stray non-ASCII characters, so those get
 * mapped to `_`. The *original* SKU is always kept verbatim in
 * `metadata.sku` for display — see the matching reverse mapping in
 * `getProduct()` in src/lib/products.ts, which must stay in sync with this.
 */
function toStripeProductId(sku) {
  return sku.replace(/[^a-zA-Z0-9_-]/g, "_");
}

async function loadCatalogs() {
  const records = [];
  for (const brandKey of Object.keys(BRANDS)) {
    const filePath = path.join(ROOT, "src", "data", `${brandKey}.generated.json`);
    const raw = await fs.readFile(filePath, "utf8").catch(() => null);
    if (!raw) {
      console.warn(`Skipping ${brandKey} — no ${path.relative(ROOT, filePath)} found. Run the scraper first.`);
      continue;
    }
    records.push(...JSON.parse(raw));
  }
  return records;
}

/** Fetch every currently-active Stripe product id, for discontinued-SKU cleanup. */
async function fetchActiveProductIds(stripe) {
  const ids = new Set();
  for await (const product of stripe.products.list({ active: true, limit: 100 })) {
    ids.add(product.id);
  }
  return ids;
}

async function upsertProduct(stripe, record, siteUrl) {
  const id = toStripeProductId(record.sku);
  const unitAmount = Math.round(record.price * 100);
  // encodeURI guards against the odd non-ASCII character slipping into a
  // filename (a couple of SKUs have a stray Greek "Β" instead of Latin "B").
  const images = record.image ? [encodeURI(`${siteUrl}${record.image}`)] : [];
  const metadata = {
    sku: record.sku,
    slug: record.slug,
    brand: record.brand,
    category: record.category,
    fitment: JSON.stringify(record.fitment ?? []),
    inStock: String(Boolean(record.inStock)),
    // Deliberately no `cost` (trade price) — must never leave the local
    // scraper output.
    image: record.image ?? "",
  };
  const description = toDescription(record.name, record.brand);

  const existing = await stripe.products
    .retrieve(id, { expand: ["default_price"] })
    .catch((err) => {
      if (err?.statusCode === 404) return null;
      throw err;
    });

  if (!existing) {
    await stripe.products.create({
      id,
      name: record.name,
      description,
      images,
      metadata,
      active: true,
      default_price_data: {
        currency: record.currency.toLowerCase(),
        unit_amount: unitAmount,
      },
    });
    return "created";
  }

  const fieldsChanged =
    existing.name !== record.name ||
    existing.description !== description ||
    existing.images?.[0] !== images[0] ||
    existing.metadata.category !== metadata.category ||
    existing.metadata.fitment !== metadata.fitment ||
    existing.metadata.inStock !== metadata.inStock ||
    !existing.active;

  if (fieldsChanged) {
    await stripe.products.update(id, {
      name: record.name,
      description,
      images,
      metadata,
      active: true,
    });
  }

  const currentPrice = existing.default_price;
  const priceChanged = !currentPrice || currentPrice.unit_amount !== unitAmount;

  if (priceChanged) {
    const newPrice = await stripe.prices.create({
      product: id,
      currency: record.currency.toLowerCase(),
      unit_amount: unitAmount,
    });
    await stripe.products.update(id, { default_price: newPrice.id });
    if (currentPrice) {
      await stripe.prices.update(currentPrice.id, { active: false });
    }
    return "price-updated";
  }

  return fieldsChanged ? "updated" : "unchanged";
}

async function main() {
  const args = process.argv.slice(2);
  const modeArg = args.find((a) => a.startsWith("--mode="))?.split("=")[1] ?? "test";
  const dryRun = args.includes("--dry-run");

  if (modeArg !== "test" && modeArg !== "live") {
    console.error("Usage: node --env-file=.env.local scripts/sync-stripe-catalog.mjs --mode=test|live [--dry-run]");
    process.exit(1);
  }

  const secretKey =
    modeArg === "live" ? process.env.STRIPE_SECRET_KEY_LIVE : process.env.STRIPE_SECRET_KEY_TEST;
  if (!secretKey) {
    console.error(
      `Missing STRIPE_SECRET_KEY_${modeArg.toUpperCase()} in the environment (see .env.example).`
    );
    process.exit(1);
  }
  if (modeArg === "live" && !secretKey.startsWith("sk_live_")) {
    console.error("STRIPE_SECRET_KEY_LIVE doesn't look like a live key (expected sk_live_...).");
    process.exit(1);
  }
  if (modeArg === "test" && !secretKey.startsWith("sk_test_")) {
    console.error("STRIPE_SECRET_KEY_TEST doesn't look like a test key (expected sk_test_...).");
    process.exit(1);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!siteUrl) {
    console.error("Missing NEXT_PUBLIC_SITE_URL in the environment (see .env.example).");
    process.exit(1);
  }

  const stripe = new Stripe(secretKey);
  const records = await loadCatalogs();
  if (records.length === 0) {
    console.error("No products found across src/data/*.generated.json — nothing to sync.");
    process.exit(1);
  }

  console.log(`Syncing ${records.length} products to Stripe (${modeArg} mode)${dryRun ? " [dry run]" : ""}...`);

  const seenIds = new Set();
  const counts = { created: 0, updated: 0, "price-updated": 0, unchanged: 0, failed: 0 };

  for (const record of records) {
    seenIds.add(toStripeProductId(record.sku));
    if (dryRun) continue;
    try {
      const result = await upsertProduct(stripe, record, siteUrl);
      counts[result] += 1;
      if (result !== "unchanged") console.log(`  ${result.padEnd(13)} ${record.sku}  ${record.name}`);
    } catch (err) {
      counts.failed += 1;
      console.error(`  FAILED        ${record.sku}  ${record.name}\n    ${err.message}`);
    }
  }

  let archived = 0;
  if (!dryRun) {
    const activeIds = await fetchActiveProductIds(stripe);
    for (const id of activeIds) {
      if (seenIds.has(id)) continue;
      await stripe.products.update(id, { active: false }).catch(() => {});
      console.log(`  archived      ${id}  (no longer in scraped catalogue)`);
      archived += 1;
    }
  }

  console.log(
    `\nDone. created=${counts.created} updated=${counts.updated} price-updated=${counts["price-updated"]} unchanged=${counts.unchanged} archived=${archived} failed=${counts.failed}`
  );
  if (counts.failed > 0) process.exit(1);
}

main();
