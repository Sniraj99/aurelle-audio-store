"use client";
import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { buttonClass } from "@/components/ui/Button";
import { formatMoney } from "@/lib/money";

export function CartPageView() {
  const { cart, hydrated, remove } = useCart();
  if (!hydrated) return <div className="h-64 animate-pulse bg-midnight" role="status" aria-label="Loading your bag" />;

  if (!cart.lines.length && !cart.invalid.length) {
    return (
      <div className="flex flex-col items-start gap-6 border-t border-line py-16">
        <p className="display-md text-white">Your bag is empty.</p>
        <p className="text-muted">When you add a speaker, it will appear here.</p>
        <Link href="/products" className={buttonClass("primary", "lg")}>Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="grid gap-16 lg:grid-cols-12">
      <div className="lg:col-span-7">
        {cart.invalid.length > 0 && (
          <div role="alert" className="mb-8 border-l border-gold py-2 pl-4">
            <p className="text-white">Some items can no longer be bought online:</p>
            <ul className="mt-2 grid gap-2 text-sm text-muted">
              {cart.invalid.map(({ line, product, reason }) => (
                <li key={`${line.productId}-${line.variantId}`} className="flex flex-wrap items-center gap-3">
                  <span>{product?.name ?? "Unlisted item"}: {reason}</span>
                  <button type="button" onClick={() => remove(line.productId, line.variantId)} className="link-underline text-champagne">Remove</button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <ul className="border-y border-line">{cart.lines.map((l) => <CartLineItem key={l.key} line={l} />)}</ul>
        <Link href="/products" className="link-underline mt-8 inline-block text-sm text-soft hover:text-champagne">Continue Shopping</Link>
      </div>
      {cart.lines.length > 0 && (
        <aside aria-labelledby="summary-title" className="lg:col-span-4 lg:col-start-9">
          <div className="bg-midnight p-6 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            <h2 id="summary-title" className="text-lg text-white">Summary</h2>
            <dl className="mt-6 grid gap-3 text-sm">
              <div className="flex justify-between"><dt className="text-muted">Subtotal ({cart.itemCount} {cart.itemCount === 1 ? "item" : "items"})</dt><dd className="text-white">{formatMoney(cart.subtotalMinor)}</dd></div>
            </dl>
            <p className="mt-4 text-sm text-muted">Delivery and any taxes are confirmed at checkout.</p>
            <Link href="/checkout" className={buttonClass("primary", "lg", "mt-8 w-full")}>Proceed to Checkout</Link>
          </div>
        </aside>
      )}
    </div>
  );
}

