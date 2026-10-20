"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from "react";
import { products } from "@/data/products";
import { brand } from "@/config/brand";
import { cartReducer, resolveCart, type CartLine, type ResolvedCart } from "@/lib/cart";
import { purchaseBlock } from "@/lib/product-rules";

const STORAGE_KEY = `${brand.name.toLowerCase().replace(/\W+/g, "-")}-bag-v1`;

interface CartContextValue {
  lines: CartLine[];
  cart: ResolvedCart;
  hydrated: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (productId: string, variantId: string | undefined, quantity: number, opts?: { silent?: boolean }) => { ok: boolean; message: string };
  setQuantity: (productId: string, variantId: string | undefined, quantity: number) => void;
  remove: (productId: string, variantId?: string) => void;
  clear: () => void;
  announcement: string;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, dispatch] = useReducer(cartReducer, []);
  const [hydrated, setHydrated] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const skipPersist = useRef(true);

  // Load the saved bag once on the client.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", lines: JSON.parse(raw) });
    } catch { /* storage unavailable or corrupt: start empty */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipPersist.current) { skipPersist.current = false; return; }
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines)); } catch { /* ignore */ }
  }, [lines, hydrated]);

  // Keep tabs in sync.
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      try { dispatch({ type: "hydrate", lines: e.newValue ? JSON.parse(e.newValue) : [] }); } catch { /* ignore */ }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const cart = useMemo(() => resolveCart(lines, products), [lines]);

  const add = useCallback<CartContextValue["add"]>((productId, variantId, quantity, opts) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return { ok: false, message: "This product is no longer available." };
    const block = purchaseBlock(product, variantId);
    if (block === "variant_required") return { ok: false, message: "Choose a finish first." };
    if (block) return { ok: false, message: `${product.name} can't be bought online. Send us an enquiry instead.` };
    dispatch({ type: "add", productId, variantId, quantity });
    const message = `${product.name} added to your bag.`;
    setAnnouncement(message);
    if (!opts?.silent) setDrawerOpen(true);
    return { ok: true, message };
  }, []);

  const value: CartContextValue = {
    lines, cart, hydrated, drawerOpen, announcement,
    openDrawer: useCallback(() => setDrawerOpen(true), []),
    closeDrawer: useCallback(() => setDrawerOpen(false), []),
    add,
    setQuantity: useCallback((productId, variantId, quantity) => dispatch({ type: "setQuantity", productId, variantId, quantity }), []),
    remove: useCallback((productId, variantId) => { dispatch({ type: "remove", productId, variantId }); setAnnouncement("Item removed from your bag."); }, []),
    clear: useCallback(() => dispatch({ type: "clear" }), []),
  };

  return (
    <CartContext.Provider value={value}>
      {children}
      <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
