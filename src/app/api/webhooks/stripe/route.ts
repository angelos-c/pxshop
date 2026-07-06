import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import type Stripe from "stripe";

// No local database — Stripe's own Dashboard is the order system of record.
// This handler just logs fulfillment-relevant events to the Vercel function
// logs. Extend `logOrder` if you later want to ping Slack, send a custom
// email, etc.
function logOrder(session: Stripe.Checkout.Session) {
  console.log("[stripe] order paid", {
    id: session.id,
    email: session.customer_details?.email,
    amount_total: session.amount_total,
    currency: session.currency,
    shipping: session.collected_information?.shipping_details?.address,
    // Per-order fitment/finish choices — see /api/checkout, where these are
    // recorded on the Session since they aren't part of the shared catalog.
    variants: session.metadata?.variants,
  });
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret." },
      { status: 400 }
    );
  }

  const payload = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Webhook signature verification failed: ${message}` },
      { status: 400 }
    );
  }

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.payment_status === "paid") {
        logOrder(session);
      }
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object as Stripe.Checkout.Session;
      console.warn("[stripe] delayed payment failed", { id: session.id });
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
