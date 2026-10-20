import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicOrder } from "@/lib/orders/repository";
import { formatMoney } from "@/lib/money";
import { ButtonLink } from "@/components/ui/Button";
import type { CurrencyCode } from "@/types/product";

export const metadata: Metadata = { title: "Order confirmation", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const statusCopy: Record<string, { title: string; body: string }> = {
  PAID: { title: "Thank you. Your order is confirmed.", body: "Your payment has been verified. We'll email you when your order is on its way." },
  PENDING_PAYMENT: { title: "Your order has been received.", body: "We're waiting for payment confirmation. This page updates once the payment is verified." },
  PAYMENT_FAILED: { title: "Payment was not completed.", body: "No order has been confirmed. Your bag may still hold your items; you can try again." },
  NEEDS_REVIEW: { title: "Thank you. We're reviewing your order.", body: "Your payment was received and we'll contact you shortly to confirm the details." },
  CANCELLED: { title: "This order was cancelled.", body: "Contact us if you have questions." },
  FULFILLED: { title: "Your order has been dispatched.", body: "Thank you for shopping with us." },
};

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await getPublicOrder(id);
  if (!order) notFound();
  const copy = order.paymentProvider === "manual" && order.status === "PENDING_PAYMENT"
    ? { title: "Your order request has been received.", body: "We'll confirm availability and delivery, then send payment instructions by email. Nothing has been charged." }
    : statusCopy[order.status] ?? statusCopy.PENDING_PAYMENT!;
  const fmt = (n: number) => formatMoney(n, order.currency as CurrencyCode);
  return (
    <div className="frame max-w-3xl py-20 sm:py-28">
      <p className="text-sm text-muted">Order reference {order.publicId}</p>
      <h1 className="display-lg mt-4 text-white">{copy.title}</h1>
      <p className="lede mt-6">{copy.body}</p>
      <ul className="mt-12 divide-y divide-line border-y border-line">
        {order.items.map((i, n) => (
          <li key={n} className="flex justify-between gap-4 py-4 text-sm"><span className="text-soft">{i.name}{i.variantName && `, ${i.variantName}`} × {i.quantity}</span><span className="text-white">{fmt(i.lineTotalMinor)}</span></li>
        ))}
      </ul>
      <dl className="mt-6 grid gap-2 text-sm">
        {order.shippingMinor !== null && <div className="flex justify-between"><dt className="text-muted">Delivery</dt><dd>{fmt(order.shippingMinor)}</dd></div>}
        {order.taxMinor > 0 && <div className="flex justify-between"><dt className="text-muted">Tax</dt><dd>{fmt(order.taxMinor)}</dd></div>}
        <div className="flex justify-between text-base text-white"><dt>Total</dt><dd>{fmt(order.totalMinor)}</dd></div>
      </dl>
      <ButtonLink href="/products" variant="secondary" className="mt-12">Continue Shopping</ButtonLink>
    </div>
  );
}
