import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { paymentMode } from "@/lib/env";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };
export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <div className="frame py-16 sm:py-24">
      <h1 className="display-lg mb-12 text-white">Checkout</h1>
      <CheckoutForm mode={paymentMode()} />
    </div>
  );
}
