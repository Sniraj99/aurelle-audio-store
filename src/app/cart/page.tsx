import type { Metadata } from "next";
import { CartPageView } from "@/components/cart/CartPageView";

export const metadata: Metadata = { title: "Your bag", robots: { index: false } };

export default function CartPage() {
  return (
    <div className="frame py-16 sm:py-24">
      <h1 className="display-lg mb-12 text-white">Your bag</h1>
      <CartPageView />
    </div>
  );
}
