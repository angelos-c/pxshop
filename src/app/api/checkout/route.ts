import { NextRequest, NextResponse } from "next/server";
import { getProduct } from "@/lib/products";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

type CheckoutLine = {
  slug: string;
  quantity: number;
  fitment?: string;
  finish?: string | null;
};

export async function POST(request: NextRequest) {
  let body: { items?: CheckoutLine[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const requestedLines = body.items ?? [];
  if (requestedLines.length === 0) {
    return NextResponse.json({ error: "Your bag is empty." }, { status: 400 });
  }

  const origin = request.nextUrl.origin;

  // Price/name/images always come straight from Stripe's own Product/Price
  // records (the catalog's single source of truth) — never trust the
  // client-sent line item beyond slug/quantity/variant. Fitment/finish are
  // per-order choices, not catalog data, so they're recorded on the Session
  // itself (see `variants` metadata below) rather than on the shared Price.
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  const variants: Array<{ sku: string; fitment?: string; finish?: string | null }> = [];

  for (const line of requestedLines) {
    const product = await getProduct(line.slug);
    if (!product || !product.stripePriceId) {
      return NextResponse.json(
        { error: `Product "${line.slug}" no longer exists.` },
        { status: 400 }
      );
    }

    const quantity = Math.min(Math.max(Math.floor(line.quantity ?? 1), 1), 99);

    lineItems.push({
      quantity,
      price: product.stripePriceId,
    });

    if (line.fitment || line.finish) {
      variants.push({ sku: product.sku, fitment: line.fitment, finish: line.finish });
    }
  }

  // Stripe metadata values are capped at 500 characters — this is only ever
  // a handful of cart lines, but truncate defensively rather than let an
  // unusually large bag fail checkout outright.
  let variantsJson = JSON.stringify(variants);
  if (variantsJson.length > 490) variantsJson = variantsJson.slice(0, 487) + "...";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/bag`,
      shipping_address_collection: { allowed_countries: ["CY"] },
      phone_number_collection: { enabled: true },
      allow_promotion_codes: true,
      metadata: variants.length > 0 ? { variants: variantsJson } : undefined,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[checkout] failed to create session", err);
    const message =
      err instanceof Error ? err.message : "Could not start checkout.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
