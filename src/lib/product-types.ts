/**
 * The `Product` shape and pure display helpers, split out from
 * src/lib/products.ts so client components (ProductTile, ProductDetail,
 * ShopBrowser, BrandShowcase, BagContents, etc.) can use them without
 * pulling the Stripe SDK / "server-only" data layer into the browser
 * bundle. Only src/lib/products.ts writes/reads live Stripe data — this
 * file just describes the shape of what it returns.
 */
export type Product = {
  slug: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  currency: string;
  description: string;
  fitment: string[];
  finish?: string[];
  image: string | null;
  inStock: boolean;
  /** The Stripe Price id backing this product's current price — used by checkout. */
  stripePriceId: string | null;
};

export function formatPrice(amount: number, currency: string = "EUR"): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
