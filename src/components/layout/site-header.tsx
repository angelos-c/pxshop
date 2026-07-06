"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { XStamp } from "@/components/brand/x-stamp";
import { useCart } from "@/lib/use-cart";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export function SiteHeader() {
  const { itemCount } = useCart();
  const bagLabel = `Bag (${String(itemCount).padStart(2, "0")})`;

  return (
    <header className="sticky top-0 z-50 bg-background">
      <div className="site-gutter flex items-center justify-between py-5 md:py-6">
        <Link href="/" className="group flex items-center gap-2">
          <XStamp size="lg" />
          <span className="sr-only">Project X Tuning home</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/shop" className="editorial-link text-base">
            Shop
          </Link>
          <Link href="/bag" className="editorial-link text-base">
            {bagLabel}
          </Link>
        </nav>

        <div className="flex items-center gap-4 md:hidden">
          <Link href="/bag" className="editorial-link text-xs">
            {bagLabel}
          </Link>
          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="text-brand" />
              }
            >
              <Menu className="size-5" />
              <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full border-brand/30 bg-background sm:max-w-sm"
            >
              <SheetHeader>
                <SheetTitle className="text-left font-black tracking-tight text-brand">
                  Menu
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-10 flex flex-col gap-6">
                <Link href="/shop" className="editorial-link text-2xl">
                  Shop
                </Link>
                <Link href="/bag" className="editorial-link text-2xl">
                  {bagLabel}
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
