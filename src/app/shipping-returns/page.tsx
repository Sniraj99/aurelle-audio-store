import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/ui/LegalPage";
import { commerce } from "@/config/commerce";
import { formatMoney } from "@/lib/money";

export const metadata: Metadata = pageMetadata({ title: "Shipping and Returns", description: "Delivery, returns, and exchanges.", path: "/shipping-returns" });

export default function ShippingReturnsPage() {
  return (
    <LegalPage title="Shipping and Returns">
      <section><h2>Delivery</h2>
        {commerce.shippingMethods.length ? (
          <ul>{commerce.shippingMethods.map((m) => <li key={m.id}><span className="text-white">{m.label}</span>: {m.feeMinor === 0 ? "free" : formatMoney(m.feeMinor)}{m.freeAboveMinor !== undefined && `, free on orders over ${formatMoney(m.freeAboveMinor)}`}.{m.description && ` ${m.description}`}</li>)}</ul>
        ) : (
          <p>We currently arrange delivery individually after each order and confirm timing and any cost with you before dispatch.</p>
        )}
        <p className="mt-3">We deliver to: {["India"].join(", ")}. [Delivery areas, typical timelines, and how large items are handled.]</p>
      </section>
      <section><h2>Damaged or incorrect items</h2><p>[How and when to report damage in transit, and what we will do.]</p></section>
      <section><h2>Returns</h2><p>[Return window, condition requirements, who pays return shipping, and how refunds are issued.]</p></section>
      <section><h2>Enquiry and custom orders</h2><p>[Terms for made-to-order, installation, and professional products.]</p></section>
    </LegalPage>
  );
}
