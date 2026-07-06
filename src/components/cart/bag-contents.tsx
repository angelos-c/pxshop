"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/use-cart";
import { formatPrice } from "@/lib/product-types";

export function BagContents() {
  const { items, subtotal, setQuantity, removeItem } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setError(null);
    setIsCheckingOut(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((line) => ({
            slug: line.slug,
            quantity: line.quantity,
            fitment: line.fitment,
            finish: line.finish,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error ?? "Something went wrong at checkout.");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setIsCheckingOut(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="site-gutter py-20 text-center md:py-32">
        <p className="text-lg font-bold text-brand md:text-2xl">
          Your bag is empty.
        </p>
        <Link
          href="/shop"
          className="editorial-link mt-6 inline-flex items-center gap-2 text-sm"
        >
          Continue shopping
          <ArrowUpRight className="size-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="site-gutter grid gap-10 py-10 md:py-14 lg:grid-cols-[2fr_1fr] lg:gap-16">
      <div>
        {items.map((line) => (
          <div
            key={line.lineId}
            className="flex gap-4 border-b border-border py-6 first:pt-0 md:gap-6"
          >
            <Link
              href={`/shop/${line.slug}`}
              className="relative size-24 shrink-0 bg-neutral-100 md:size-32"
            >
              {line.image ? (
                <Image
                  src={line.image}
                  alt={line.name}
                  fill
                  sizes="128px"
                  className="object-contain p-3 mix-blend-multiply"
                />
              ) : null}
            </Link>

            <div className="flex flex-1 flex-col justify-between">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-brand/60">
                    {line.brand}
                  </p>
                  <Link
                    href={`/shop/${line.slug}`}
                    className="mt-1 block text-sm font-bold text-brand hover:opacity-60 md:text-base"
                  >
                    {line.name}
                  </Link>
                  {(line.fitment || line.finish) && (
                    <p className="mt-1 text-xs uppercase tracking-wide text-brand/60">
                      {[line.fitment, line.finish].filter(Boolean).join(" · ")}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(line.lineId)}
                  aria-label="Remove from bag"
                  className="text-brand/60 transition-opacity hover:opacity-60"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setQuantity(line.lineId, line.quantity - 1)}
                    className="text-brand transition-opacity hover:opacity-60"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="size-4" />
                  </button>
                  <span className="min-w-4 text-center text-sm font-bold text-brand">
                    {line.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(line.lineId, line.quantity + 1)}
                    className="text-brand transition-opacity hover:opacity-60"
                    aria-label="Increase quantity"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>
                <p className="text-sm font-bold text-brand md:text-base">
                  {formatPrice(line.price * line.quantity, line.currency)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="h-max border-t border-border pt-6 lg:border-t-0 lg:pt-0">
        <div className="flex items-center justify-between py-3">
          <span className="text-sm font-bold uppercase tracking-widest text-brand">
            Subtotal
          </span>
          <span className="text-lg font-black text-brand md:text-xl">
            {formatPrice(subtotal, items[0]?.currency ?? "EUR")}
          </span>
        </div>
        <p className="pb-6 text-xs text-brand/60">
          Shipping and any duties are calculated at checkout.
        </p>

        {error ? (
          <p className="pb-4 text-xs font-bold text-brand">{error}</p>
        ) : null}

        <button
          type="button"
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="flex w-full items-center justify-between border-t border-brand py-4 text-lg font-black text-brand transition-opacity hover:opacity-60 disabled:opacity-40"
        >
          {isCheckingOut ? "Redirecting to checkout…" : "Checkout"}
          <ArrowUpRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
