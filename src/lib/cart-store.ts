import { type CartItem, makeLineId } from "@/lib/cart-types";

const STORAGE_KEY = "pxshop:cart";
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let hydrated = false;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function persist() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage unavailable (private browsing, quota, etc.) — cart still
    // works for the current page load, just won't survive a reload.
  }
}

function hydrate() {
  if (hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) items = JSON.parse(raw);
  } catch {
    items = EMPTY;
  }
}

export const cartStore = {
  subscribe(listener: () => void) {
    hydrate();
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot() {
    return items;
  },

  getServerSnapshot() {
    return EMPTY;
  },

  addItem(item: Omit<CartItem, "lineId">) {
    const lineId = makeLineId(item.slug, item.fitment, item.finish);
    const existing = items.find((line) => line.lineId === lineId);
    items = existing
      ? items.map((line) =>
          line.lineId === lineId
            ? { ...line, quantity: line.quantity + item.quantity }
            : line
        )
      : [...items, { ...item, lineId }];
    persist();
    emit();
  },

  removeItem(lineId: string) {
    items = items.filter((line) => line.lineId !== lineId);
    persist();
    emit();
  },

  setQuantity(lineId: string, quantity: number) {
    items =
      quantity <= 0
        ? items.filter((line) => line.lineId !== lineId)
        : items.map((line) =>
            line.lineId === lineId ? { ...line, quantity } : line
          );
    persist();
    emit();
  },

  clearCart() {
    items = EMPTY;
    persist();
    emit();
  },
};
