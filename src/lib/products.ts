import "server-only";
import { unstable_cache } from "next/cache";
import { cache } from "react";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";
import type { Product } from "@/lib/product-types";

export type { Product } from "@/lib/product-types";
export { formatPrice } from "@/lib/product-types";

/**
 * Stripe custom object ids only allow [a-zA-Z0-9_-] — a handful of SKUs use
 * dots or stray non-ASCII characters, so those get mapped to `_` when used
 * as the Stripe Product id. Must stay in sync with the twin helper of the
 * same name in scripts/sync-stripe-catalog.mjs. The original SKU is always
 * kept verbatim in `metadata.sku` for display.
 */
function toStripeProductId(sku: string): string {
  return sku.replace(/[^a-zA-Z0-9_-]/g, "_");
}

/**
 * Stripe is the single source of truth for the catalogue — there is no local
 * product database. `scripts/sync-stripe-catalog.mjs` is the only thing that
 * writes Products/Prices; everything here only reads. See that script's
 * header comment for why (avoids ever having two disagreeing copies of
 * price/stock/etc).
 */
function toProduct(stripeProduct: Stripe.Product): Product {
  const price =
    stripeProduct.default_price && typeof stripeProduct.default_price === "object"
      ? (stripeProduct.default_price as Stripe.Price)
      : null;
  const metadata = stripeProduct.metadata;

  let fitment: string[] = [];
  try {
    fitment = metadata.fitment ? JSON.parse(metadata.fitment) : [];
  } catch {
    fitment = [];
  }

  return {
    slug: metadata.slug || stripeProduct.id.toLowerCase(),
    sku: metadata.sku || stripeProduct.id,
    name: stripeProduct.name,
    brand: metadata.brand ?? "",
    category: metadata.category ?? "Accessories",
    price: price?.unit_amount != null ? price.unit_amount / 100 : 0,
    currency: price?.currency?.toUpperCase() ?? "EUR",
    description: stripeProduct.description ?? "",
    fitment,
    image: metadata.image || null,
    inStock: metadata.inStock !== "false",
    stripePriceId: price?.id ?? null,
  };
}

const getCachedProducts = unstable_cache(
  async (): Promise<Product[]> => {
    const products: Stripe.Product[] = [];
    for await (const product of stripe.products.list({
      active: true,
      limit: 100,
      expand: ["data.default_price"],
    })) {
      products.push(product);
    }
    return products.map(toProduct).sort((a, b) => a.name.localeCompare(b.name));
  },
  ["stripe-catalog"],
  { revalidate: 300, tags: ["catalog"] }
);

/**
 * The homepage fans out into ~7 brand showcases, each pulling from this —
 * without request-level memoization every one of those independently pages
 * through the *entire* Stripe catalog (dozens of list calls) in the same
 * instant, which is enough concurrent traffic to a single endpoint to trip
 * Stripe's rate limit. `cache()` makes every call within one render share
 * a single in-flight fetch; `unstable_cache` above then keeps that result
 * warm across separate requests.
 */
const getAllProducts = cache(getCachedProducts);

export async function getProducts(): Promise<Product[]> {
  return getAllProducts();
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  try {
    const product = await stripe.products.retrieve(toStripeProductId(slug.toUpperCase()), {
      expand: ["default_price"],
    });
    return product.active ? toProduct(product) : undefined;
  } catch (err) {
    const stripeErr = err as Stripe.errors.StripeError;
    if (stripeErr?.statusCode === 404) return undefined;
    throw err;
  }
}

export async function getBrands(): Promise<string[]> {
  const products = await getAllProducts();
  return [...new Set(products.map((p) => p.brand))];
}

export async function getProductsByBrand(brand: string): Promise<Product[]> {
  const products = await getAllProducts();
  return products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase());
}

/** A short, image-first slice of a brand's catalog for homepage teasers. */
export async function getFeaturedByBrand(brand: string, limit = 8): Promise<Product[]> {
  const items = await getProductsByBrand(brand);
  const withImage = items.filter((p) => p.image);
  const rest = items.filter((p) => !p.image);
  return [...withImage, ...rest].slice(0, limit);
}
