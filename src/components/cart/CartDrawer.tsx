"use client";
import Link from "next/link";
import { X } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { buttonClass } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/useDialog";
import { formatMoney } from "@/lib/money";
import { commerce } from "@/config/commerce";

export function CartDrawer() {
  const { cart, drawerOpen, closeDrawer } = useCart();
  const panelRef = useDialog(drawerOpen, closeDrawer);
  return (
    <div className={`fixed inset-0 z-[60] ${drawerOpen ? "" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
      <div className={`absolute inset-0 bg-obsidian/70 backdrop-blur-[2px] transition-opacity duration-500 ${drawerOpen ? "opacity-100" : "opacity-0"}`} onClick={closeDrawer} />
      <div
        ref={panelRef}
        role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" tabIndex={-1}
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-midnight transition-transform duration-500 ease-lux ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
        inert={!drawerOpen}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 id="cart-drawer-title" className="text-lg text-white">Your bag {cart.itemCount > 0 && <span className="text-muted">({cart.itemCount})</span>}</h2>
          <button type="button" onClick={closeDrawer} className="grid h-11 w-11 place-items-center text-muted hover:text-white" aria-label="Close bag"><X className="h-5 w-5" strokeWidth={1.25} /></button>
        </div>
        {cart.lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-start justify-center gap-6 px-6">
            <p className="display-md text-white">Your bag is empty.</p>
            <p className="text-muted">Browse the collection to find a speaker for your space.</p>
            <Link href="/products" onClick={closeDrawer} className={buttonClass("primary")}>Explore the collection</Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-6">
              {cart.lines.map((l) => <CartLineItem key={l.key} line={l} compact onNavigate={closeDrawer} />)}
            </ul>
            <div className="border-t border-line px-6 py-6">
              <div className="flex justify-between text-white"><span>Subtotal</span><span>{formatMoney(cart.subtotalMinor, commerce.currency)}</span></div>
              <p className="mt-2 text-sm text-muted">Delivery and any taxes are confirmed at checkout.</p>
              <div className="mt-6 grid gap-3">
                <Link href="/checkout" onClick={closeDrawer} className={buttonClass("primary", "lg")}>Checkout</Link>
                <Link href="/cart" onClick={closeDrawer} className={buttonClass("secondary", "md")}>View bag</Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
