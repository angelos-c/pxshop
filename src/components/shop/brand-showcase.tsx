"use client";

import Link from "next/link";
import { ProductTile } from "@/components/shop/product-tile";
import { useFitText } from "@/lib/use-fit-text";
import type { Product } from "@/lib/product-types";

type BrandShowcaseProps = {
  brand: string;
  count: number;
  products: Product[];
  href: string;
};

export function BrandShowcase({ brand, count, products, href }: BrandShowcaseProps) {
  const { containerRef, textRef, fontSize } = useFitText<HTMLHeadingElement>();

  return (
    <section className="w-full max-w-full py-10 md:py-16">
      <div className="site-gutter mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">
            Featured brand
          </p>
          <div ref={containerRef} className="mt-1 w-full md:w-[85vw] md:max-w-[900px]">
            <h2
              ref={textRef}
              style={fontSize ? { fontSize: `${fontSize}px` } : undefined}
              className="-mt-[0.05em] inline-block w-max whitespace-nowrap text-[clamp(2.5rem,13vw,9rem)] font-black uppercase leading-[0.9] tracking-[-0.02em] text-brand"
            >
              {brand}
            </h2>
          </div>
        </div>
        <Link
          href={href}
          className="editorial-link group flex shrink-0 items-center gap-2 text-xs md:text-sm"
        >
          See all {brand}
          <span
            aria-hidden
            className="inline-block transition-transform group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      </div>

      <div className="relative">
        <div className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth scroll-pl-4 pl-4 pr-4 pb-2 md:gap-6 md:scroll-pl-6 md:pl-6 md:pr-6 lg:scroll-pl-8 lg:pl-8 lg:pr-8">
          {products.map((product) => (
            <ProductTile
              key={product.slug}
              product={product}
              className="w-[75vw] shrink-0 snap-start sm:w-[46vw] md:w-[31vw] lg:w-[23vw]"
            />
          ))}

          <Link
            href={href}
            className="group block w-[75vw] shrink-0 snap-start sm:w-[46vw] md:w-[31vw] lg:w-[23vw]"
          >
            <div className="relative flex aspect-[4/5] flex-col items-start justify-end gap-4 border border-brand/30 p-6 transition-colors group-hover:border-brand group-hover:bg-brand">
              <span className="text-3xl font-black uppercase leading-[0.95] tracking-tight text-brand transition-colors group-hover:text-background md:text-4xl">
                See all
                <br />
                {brand}
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-brand transition-colors group-hover:text-background">
                View full range
                <span
                  aria-hidden
                  className="inline-block transition-transform group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
            </div>

            <div className="editorial-rule mt-0" />

            <div className="py-3">
              <p className="text-sm font-bold text-brand md:text-base">
                Full collection
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand md:text-xs">
                <span className="size-1.5 rounded-full bg-brand" />
                {count} parts
              </p>
            </div>
          </Link>
        </div>

        <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-background to-transparent md:block" />
      </div>
    </section>
  );
}
