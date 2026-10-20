"use client";
import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/types/product";
import { useCart } from "@/components/cart/CartProvider";
import { buttonClass } from "@/components/ui/Button";
import { isPurchasable, requiresVariant } from "@/lib/product-rules";

export function enquiryHref(product: Product) {
  return `/contact?type=product&product=${encodeURIComponent(product.slug)}`;
}

/** Card-level actions: add to bag (or choose a finish), or enquire. */
export function ProductCardActions({ product }: { product: Product }) {
  const { add } = useCart();
  const [msg, setMsg] = useState("");
  const buyable = isPurchasable(product);

  if (!buyable) {
    return <Link href={enquiryHref(product)} className={buttonClass("secondary", "md", "w-full sm:w-auto")}>Enquire<span className="sr-only"> about {product.name}</span></Link>;
  }
  if (requiresVariant(product)) {
    return <Link href={`/products/${product.slug}`} className={buttonClass("secondary", "md", "w-full sm:w-auto")}>Choose finish<span className="sr-only"> for {product.name}</span></Link>;
  }
  return (
    <>
      <button type="button" className={buttonClass("secondary", "md", "w-full sm:w-auto")} onClick={() => { const r = add(product.id, undefined, 1); if (!r.ok) setMsg(r.message); }}>
        Add to bag<span className="sr-only"> : {product.name}</span>
      </button>
      {msg && <p role="alert" className="mt-2 text-sm text-[#f0a597]">{msg}</p>}
    </>
  );
}
