"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/use-cart";
import { SpecRow } from "@/components/shop/spec-row";
import { Button } from "@/components/ui/button";
import { formatPrice, type Product } from "@/lib/product-types";
import { cn } from "@/lib/utils";

type ProductDetailProps = {
  product: Product;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const [fitment, setFitment] = useState(product.fitment[0]);
  const [finish, setFinish] = useState(product.finish?.[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (!added) return;
    const timeout = setTimeout(() => setAdded(false), 1600);
    return () => clearTimeout(timeout);
  }, [added]);

  function handleAddToBag() {
    addItem({
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      brand: product.brand,
      price: product.price,
      currency: product.currency,
      image: product.image,
      quantity,
      fitment,
      finish,
    });
    setAdded(true);
  }

  return (
    <>
      <div className="site-gutter">
        <Link
          href="/shop"
          className="inline-flex items-center gap-2 py-6 text-xs font-bold uppercase tracking-widest text-brand hover:opacity-60 md:py-8"
        >
          ← Return to shop
        </Link>

        <div className="grid gap-10 lg:grid-cols-2 lg:gap-0">
          <div className="relative aspect-[3/4] bg-neutral-100 lg:aspect-auto lg:min-h-[70vh] lg:-ml-8">
            {product.image ? (
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                preload
                className="object-contain p-10 mix-blend-multiply md:p-16"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-10">
                <p className="text-center text-sm font-bold uppercase tracking-widest text-brand/40">
                  {product.name}
                </p>
              </div>
            )}
          </div>

          <div className="lg:pl-12 xl:pl-20">
            <p className="text-xs font-bold uppercase tracking-widest text-brand/60">
              {product.brand}
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-brand md:text-5xl lg:text-6xl">
              {product.name}
            </h1>
            <p className="mt-3 text-2xl font-black text-brand md:text-3xl">
              {formatPrice(product.price, product.currency)}
            </p>
            <p
              className={cn(
                "mt-2 text-xs font-bold uppercase tracking-widest",
                product.inStock ? "text-brand/60" : "text-brand/40"
              )}
            >
              {product.inStock ? "In stock" : "Out of stock — order to arrive"}
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-brand/80 md:text-base">
              {product.description}
            </p>

            <div className="mt-8 border-t border-border">
              <SpecRow label="Fitment">
                <div className="flex flex-wrap justify-end gap-x-3 gap-y-2">
                  {product.fitment.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setFitment(option)}
                      className={cn(
                        "min-h-11 px-1 text-xs uppercase tracking-wide transition-opacity md:text-sm",
                        fitment === option
                          ? "opacity-100 underline underline-offset-4"
                          : "opacity-40 hover:opacity-70"
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </SpecRow>

              {product.finish && (
                <SpecRow label="Finish">
                  <div className="flex flex-wrap justify-end gap-x-3 gap-y-2">
                    {product.finish.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setFinish(option)}
                        className={cn(
                          "min-h-11 px-1 text-xs uppercase tracking-wide transition-opacity md:text-sm",
                          finish === option
                            ? "opacity-100 underline underline-offset-4"
                            : "opacity-40 hover:opacity-70"
                        )}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </SpecRow>
              )}

              <SpecRow label="Quantity">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-brand hover:bg-transparent hover:opacity-60"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    <Minus className="size-4" />
                  </Button>
                  <span>{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-brand hover:bg-transparent hover:opacity-60"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </SpecRow>
            </div>

            <button
              type="button"
              onClick={handleAddToBag}
              className="mt-8 hidden items-center gap-2 text-xl font-black text-brand transition-opacity hover:opacity-60 md:flex md:text-2xl"
            >
              {added ? "Added to bag" : "Add to bag"}
              <ArrowUpRight className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background p-4 md:hidden">
        <button
          type="button"
          onClick={handleAddToBag}
          className="flex w-full items-center justify-between text-lg font-black text-brand"
        >
          {added ? "Added to bag" : "Add to bag"}
          <ArrowUpRight className="size-5" />
        </button>
      </div>
    </>
  );
}
