"use client";

import Link from "next/link";
import { XStamp } from "@/components/brand/x-stamp";
import { useCart } from "@/lib/use-cart";

export function SiteHeader() {
  const { itemCount } = useCart();
  const bagLabel = `Bag (${String(itemCount).padStart(2, "0")})`;

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="site-gutter flex items-center justify-between py-3 md:py-4">
        <Link href="/" className="group flex items-center gap-2">
          <XStamp size="lg" />
          <span className="sr-only">Project X Tuning home</span>
        </Link>

        <nav className="flex items-center gap-8">
          <Link href="/bag" className="editorial-link text-xs md:text-base">
            {bagLabel}
          </Link>
        </nav>
      </div>
    </header>
  );
}
