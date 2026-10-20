import { formatMoney } from "@/lib/money";
import { commerce } from "@/config/commerce";
import type { Totals } from "@/lib/totals";

export interface SummaryLine { key: string; name: string; detail?: string; quantity: number; lineTotalMinor: number }

export function OrderSummary({ lines, totals, currency = commerce.currency, shippingConfigured = commerce.shippingMethods.length > 0 }: { lines: SummaryLine[]; totals: Totals; currency?: string; shippingConfigured?: boolean }) {
  const fmt = (n: number) => formatMoney(n, currency as typeof commerce.currency);
  return (
    <div>
      <ul className="divide-y divide-line">
        {lines.map((l) => (
          <li key={l.key} className="flex justify-between gap-4 py-4 text-sm">
            <span className="text-soft">{l.name}{l.detail && <span className="block text-muted">{l.detail}</span>}<span className="block text-muted">Qty {l.quantity}</span></span>
            <span className="text-white">{fmt(l.lineTotalMinor)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-2 grid gap-3 border-t border-line pt-5 text-sm">
        <div className="flex justify-between"><dt className="text-muted">Subtotal</dt><dd className="text-white">{fmt(totals.subtotalMinor)}</dd></div>
        <div className="flex justify-between gap-6">
          <dt className="text-muted">Delivery</dt>
          <dd className="text-right text-white">{totals.shippingMinor === null ? <span className="text-muted">{shippingConfigured ? "Choose a method" : "Confirmed after ordering"}</span> : totals.shippingMinor === 0 ? "Free" : fmt(totals.shippingMinor)}</dd>
        </div>
        {totals.taxAddedMinor > 0 && <div className="flex justify-between"><dt className="text-muted">{commerce.tax.label}</dt><dd className="text-white">{fmt(totals.taxAddedMinor)}</dd></div>}
        <div className="flex justify-between border-t border-line pt-4 text-base"><dt className="text-white">Total</dt><dd className="text-white">{fmt(totals.totalMinor)}</dd></div>
        {totals.taxIncludedMinor > 0 && <p className="text-xs text-muted">Includes {fmt(totals.taxIncludedMinor)} {commerce.tax.label}.</p>}
      </dl>
    </div>
  );
}
