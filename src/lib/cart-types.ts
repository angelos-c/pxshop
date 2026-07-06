export type CartItem = {
  /** Unique per line — same product with a different fitment/finish is a separate line. */
  lineId: string;
  slug: string;
  sku: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  image: string | null;
  quantity: number;
  fitment?: string;
  finish?: string | null;
};

export function makeLineId(
  slug: string,
  fitment?: string,
  finish?: string | null
): string {
  return [slug, fitment ?? "", finish ?? ""].join("::");
}
