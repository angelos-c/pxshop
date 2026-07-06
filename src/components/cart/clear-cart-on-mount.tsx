"use client";

import { useEffect } from "react";
import { useCart } from "@/lib/use-cart";

/** Fires once on mount — used on the checkout success page to empty the bag. */
export function ClearCartOnMount() {
  const { clearCart } = useCart();

  useEffect(() => {
    clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
