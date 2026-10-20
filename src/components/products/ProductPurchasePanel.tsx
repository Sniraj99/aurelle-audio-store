"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";
import type { Product } from "@/types/product";
import { useCart } from "@/components/cart/CartProvider";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { Price } from "@/components/ui/Price";
import { Availability } from "@/components/ui/Availability";
import { Button, buttonClass } from "@/components/ui/Button";
import { enquiryHref } from "@/components/products/ProductActions";
import { findVariant, purchaseBlock, stockLimit } from "@/lib/product-rules";
import { commerce } from "@/config/commerce";
import { whatsappLink } from "@/config/contact";

export function ProductPurchasePanel({ product }: { product: Product }) {
  const router = useRouter();
  const { add } = useCart();
  const variants = product.variants ?? [];
  const firstBuyable = variants.find((v) => purchaseBlock(product, v.id) === null) ?? variants[0];
  const [variantId, setVariantId] = useState<string | undefined>(firstBuyable?.id);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  const variant = findVariant(product, variantId);
  const block = purchaseBlock(product, variantId);
  const max = useMemo(() => Math.max(1, Math.min(commerce.maxQuantityPerLine, stockLimit(product, variant) ?? Infinity)), [product, variant]);
  const wa = whatsappLink(`Hello, I'd like to know more about ${product.name}${variant ? ` (${variant.name})` : ""}.`);

  const addToBag = (buyNow: boolean) => {
    setError("");
    const r = add(product.id, variantId, Math.min(quantity, max), { silent: buyNow });
    if (!r.ok) return setError(r.message);
    if (buyNow) router.push("/checkout");
  };

  return (
    <div>
      <Price product={product} variant={variant} className="text-2xl text-white" />
      <Availability product={product} variant={variant} className="mt-3" />

      {variants.length > 0 && (
        <fieldset className="mt-10">
          <legend className="mb-4 text-sm text-muted">
            {variants[0]!.kind === "finish" ? "Finish" : "Configuration"}: <span className="text-white">{variant?.name ?? "Choose one"}</span>
          </legend>
          <div className="flex flex-wrap gap-3">
            {variants.map((v) => {
              const unavailable = purchaseBlock(product, v.id) === "unavailable";
              const selected = v.id === variantId;
              return (
                <label key={v.id} className={`relative flex min-h-11 cursor-pointer items-center gap-3 rounded-sm border px-4 text-sm transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-1 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-champagne ${selected ? "border-gold text-white" : "border-line text-soft hover:border-muted"} ${unavailable ? "opacity-50" : ""}`}>
                  <input type="radio" name="variant" value={v.id} checked={selected} onChange={() => { setVariantId(v.id); setQuantity(1); setError(""); }} className="sr-only" />
                  {v.swatch && <span aria-hidden className="h-4 w-4 rounded-full border border-white/20" style={{ background: v.swatch }} />}
                  {v.name}{unavailable && <span className="sr-only"> (unavailable)</span>}
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <div className="mt-10 grid gap-3">
        {block === null ? (
          <>
            <div className="flex gap-3">
              <QuantityStepper value={quantity} max={max} onChange={(n) => setQuantity(Math.min(Math.max(1, n), max))} label="Quantity" />
              <Button size="lg" className="flex-1" onClick={() => addToBag(false)}>Add to Bag</Button>
            </div>
            <Button size="lg" variant="secondary" onClick={() => addToBag(true)}>Buy Now</Button>
          </>
        ) : (
          <p className="text-sm text-muted">
            {block === "enquiry_only" && "This product is configured to your space and available by enquiry."}
            {block === "unavailable" && "This product is temporarily unavailable to order online. Send an enquiry and we'll let you know when it returns."}
            {block === "no_price" && "Pricing for this product is available on request."}
            {(block === "variant_required" || block === "unknown_variant") && "Choose an option above to continue."}
          </p>
        )}
        {error && <p role="alert" className="field-error">{error}</p>}
        <Link href={enquiryHref(product)} className={buttonClass(block === null ? "ghost" : "primary", "lg", block === null ? "justify-start" : "")}>
          Enquire About This Product
        </Link>
        {wa && (
          <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted hover:text-white">
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Ask on WhatsApp
          </a>
        )}
      </div>
    </div>
  );
}
