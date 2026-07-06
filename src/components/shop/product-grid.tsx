import { ProductTile } from "@/components/shop/product-tile";
import type { Product } from "@/lib/product-types";
import { cn } from "@/lib/utils";

type ProductGridProps = {
  products: Product[];
  limit?: number;
  className?: string;
};

export function ProductGrid({ products, limit, className }: ProductGridProps) {
  const items = limit ? products.slice(0, limit) : products;

  return (
    <div
      className={cn(
        "grid w-full max-w-full grid-cols-1 gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-6",
        className
      )}
    >
      {items.map((product, index) => (
        <ProductTile
          key={product.slug}
          product={product}
          featured={index === 0 && !limit}
          className={cn(
            index === 0 && !limit && "sm:col-span-2 lg:row-span-2"
          )}
        />
      ))}
    </div>
  );
}
