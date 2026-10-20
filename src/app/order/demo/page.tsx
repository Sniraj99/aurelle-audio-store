"use client";
import { useEffect, useState } from "react";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { ButtonLink } from "@/components/ui/Button";
import { DEMO_ORDER_STORAGE_KEY, type CheckoutSuccess } from "@/lib/orders/types";

type Demo = Extract<CheckoutSuccess, { mode: "demo" }>;

export default function DemoOrderPage() {
  const [order, setOrder] = useState<Demo | null | undefined>(undefined);
  useEffect(() => {
    try { const raw = sessionStorage.getItem(DEMO_ORDER_STORAGE_KEY); setOrder(raw ? JSON.parse(raw) : null); } catch { setOrder(null); }
  }, []);

  return (
    <div className="frame max-w-3xl py-20 sm:py-28">
      <p className="inline-block border border-gold/60 px-3 py-1 text-sm text-champagne">Demo mode</p>
      <h1 className="display-lg mt-6 text-white">This was a demonstration order.</h1>
      <p className="lede mt-6">No payment was taken, no order was created, and nothing will be delivered. Online payments are switched on once the business connects a payment provider.</p>
      {order && (
        <div className="mt-12 bg-midnight p-6 sm:p-8">
          <p className="text-sm text-muted">Demo reference {order.reference}</p>
          <div className="mt-4">
            <OrderSummary currency={order.currency} totals={order.totals} lines={order.lines.map((l, i) => ({ key: String(i), name: l.name, detail: l.variantName, quantity: l.quantity, lineTotalMinor: l.lineTotalMinor }))} />
          </div>
        </div>
      )}
      {order === null && <p className="mt-10 text-muted">There is no demo order to show in this browser session.</p>}
      <ButtonLink href="/products" variant="secondary" className="mt-12">Continue Shopping</ButtonLink>
    </div>
  );
}
