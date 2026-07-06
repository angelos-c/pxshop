import Image from "next/image";
import Link from "next/link";
import { formatPrice, type Product } from "@/lib/product-types";
import { cn } from "@/lib/utils";

type ProductTileProps = {
  product: Product;
  className?: string;
  featured?: boolean;
};

export function ProductTile({
  product,
  className,
  featured = false,
}: ProductTileProps) {
  return (
    <Link
      href={`/shop/${product.slug}`}
      className={cn("group block", className)}
    >
      <div
        className={cn(
          "relative overflow-hidden bg-neutral-100 transition-colors duration-500 ease-out group-hover:bg-brand",
          featured ? "aspect-[3/4] md:aspect-auto md:min-h-[520px]" : "aspect-[4/5]"
        )}
      >
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes={featured ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 1024px) 25vw, 50vw"}
            preload={featured}
            className="object-contain p-6 mix-blend-multiply transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <p className="text-center text-xs font-bold uppercase tracking-widest text-brand/40 mix-blend-multiply">
              {product.name}
            </p>
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <span className="flex size-16 items-center justify-center rounded-full bg-background text-center text-[10px] font-bold uppercase tracking-widest text-brand md:size-20 md:text-xs">
            View
          </span>
        </div>
      </div>

      <div className="editorial-rule mt-0" />

      <div className="flex items-start justify-between gap-4 py-3">
        <div>
          <p className="text-sm font-bold text-brand md:text-base">
            {product.name}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand md:text-xs">
            <span className="size-1.5 rounded-full bg-brand" />
            {product.category}
          </p>
        </div>
        <p className="shrink-0 text-sm font-bold text-brand md:text-base">
          {formatPrice(product.price, product.currency)}
        </p>
      </div>
    </Link>
  );
}
