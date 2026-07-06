import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ClearCartOnMount } from "@/components/cart/clear-cart-on-mount";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { formatPrice } from "@/lib/product-types";
import { stripe } from "@/lib/stripe";

export const metadata = {
  title: "Order confirmed — Project X Tuning",
};

type SuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id } = await searchParams;

  const session = session_id
    ? await stripe.checkout.sessions
        .retrieve(session_id, { expand: ["line_items"] })
        .catch(() => null)
    : null;

  const lineItems = session?.line_items?.data ?? [];
  const isPaid = session?.payment_status === "paid";

  return (
    <>
      <SiteHeader />
      <main className="flex-1 overflow-x-clip pb-24 md:pb-0">
        <ClearCartOnMount />
        <div className="site-gutter py-16 md:py-24">
          {session && isPaid ? (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-brand/60">
                Order confirmed
              </p>
              <h1 className="mt-2 max-w-2xl text-3xl font-black tracking-tight text-brand md:text-5xl">
                Thank you — your order is on its way to production.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand/80 md:text-base">
                A receipt has been sent to{" "}
                {session.customer_details?.email ?? "your email"}. We&apos;ll
                be in touch with shipping details shortly.
              </p>

              {lineItems.length > 0 && (
                <div className="mt-10 max-w-xl border-t border-border">
                  {lineItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 border-b border-border py-4"
                    >
                      <span className="text-sm font-bold text-brand">
                        {item.quantity}× {item.description}
                      </span>
                      <span className="text-sm font-bold text-brand">
                        {formatPrice(
                          (item.amount_total ?? 0) / 100,
                          session.currency?.toUpperCase() ?? "EUR"
                        )}
                      </span>
                    </div>
                  ))}
                  <div className="flex items-center justify-between gap-4 py-4">
                    <span className="text-sm font-bold uppercase tracking-widest text-brand">
                      Total
                    </span>
                    <span className="text-lg font-black text-brand">
                      {formatPrice(
                        (session.amount_total ?? 0) / 100,
                        session.currency?.toUpperCase() ?? "EUR"
                      )}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <h1 className="text-3xl font-black tracking-tight text-brand md:text-5xl">
                We couldn&apos;t find that order.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-brand/80 md:text-base">
                If you completed a payment, check your email for a receipt
                from Stripe. Otherwise, your bag is still waiting for you.
              </p>
            </>
          )}

          <Link
            href="/shop"
            className="editorial-link mt-10 inline-flex items-center gap-2 text-sm"
          >
            Continue shopping
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
