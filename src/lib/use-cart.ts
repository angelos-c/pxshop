"use client";

import { useMemo, useSyncExternalStore } from "react";
import { cartStore } from "@/lib/cart-store";

export function useCart() {
  const items = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot
  );

  const itemCount = useMemo(
    () => items.reduce((sum, line) => sum + line.quantity, 0),
    [items]
  );
  const subtotal = useMemo(
    () => items.reduce((sum, line) => sum + line.price * line.quantity, 0),
    [items]
  );

  return {
    items,
    itemCount,
    subtotal,
    addItem: cartStore.addItem,
    removeItem: cartStore.removeItem,
    setQuantity: cartStore.setQuantity,
    clearCart: cartStore.clearCart,
  };
}
