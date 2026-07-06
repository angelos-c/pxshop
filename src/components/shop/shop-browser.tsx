"use client";

import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductGrid } from "@/components/shop/product-grid";
import type { Product } from "@/lib/product-types";

type ShopBrowserProps = {
  products: Product[];
  activeBrand?: string;
};

export function ShopBrowser({ products, activeBrand }: ShopBrowserProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q)
    );
  }, [products, query]);

  return (
    <>
      <div className="mb-8 flex flex-col gap-4 md:mb-12 md:flex-row md:items-end md:justify-between">
        <p className="text-xs font-bold uppercase tracking-widest text-brand">
          All products{activeBrand ? ` · ${activeBrand}` : ""}
          <span className="text-brand/50"> — {filtered.length}</span>
        </p>

        <label className="flex items-center gap-2 border-b border-border pb-2 text-brand transition-colors focus-within:border-brand md:w-72">
          <Search className="size-4 shrink-0 text-brand/50" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search parts…"
            className="w-full bg-transparent text-sm font-bold uppercase tracking-wide text-brand placeholder:text-brand/40 placeholder:normal-case focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="text-brand/50 transition-colors hover:text-brand"
            >
              <X className="size-4" />
            </button>
          )}
        </label>
      </div>

      {filtered.length > 0 ? (
        <ProductGrid products={filtered} />
      ) : (
        <p className="py-16 text-center text-sm font-bold uppercase tracking-widest text-brand/50">
          No parts match &ldquo;{query}&rdquo;.
        </p>
      )}
    </>
  );
}
