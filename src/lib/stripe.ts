import Stripe from "stripe";

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    "STRIPE_SECRET_KEY is missing. Add it to .env.local (see .env.example)."
  );
}

// No pinned apiVersion — defaults to the version configured on the Stripe
// account, so this doesn't go stale as Stripe ships new API versions.
export const stripe = new Stripe(secretKey);
