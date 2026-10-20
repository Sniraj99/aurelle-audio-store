"use client";
import Link from "next/link";
import { MediaImage } from "@/components/ui/MediaImage";
import { QuantityStepper } from "@/components/cart/QuantityStepper";
import { useCart } from "@/components/cart/CartProvider";
import { formatMoney } from "@/lib/money";
import type { ResolvedLine } from "@/lib/cart";

export function CartLineItem({ line, onNavigate, compact = false }: { line: ResolvedLine; onNavigate?: () => void; compact?: boolean }) {
  const { setQuantity, remove } = useCart();
  const { product, variant } = line;
  return (
    <li className="flex gap-4 border-b border-line py-6 last:border-b-0 sm:gap-6">
      <Link href={`/products/${product.slug}`} onClick={onNavigate} className={`relative shrink-0 overflow-hidden bg-midnight ${compact ? "h-28 w-[5.6rem]" : "h-36 w-28 sm:h-44 sm:w-36"}`}>
        <MediaImage image={product.images[0]!} fill sizes="144px" className="object-cover" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Link href={`/products/${product.slug}`} onClick={onNavigate} className="link-underline text-white">{product.name}</Link>
            {variant && <p className="mt-1 text-sm text-muted">{variant.name}</p>}
            <p className="mt-1 text-sm text-muted">
              {formatMoney(line.unitMinor, product.currency)}
              {line.unitMinor !== line.regularUnitMinor && <s className="ml-2">{formatMoney(line.regularUnitMinor, product.currency)}</s>}
            </p>
          </div>
          <p className="shrink-0 text-white">{formatMoney(line.lineTotalMinor, product.currency)}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-4 pt-4">
          <QuantityStepper size="sm" value={line.quantity} max={line.maxQuantity} label={`Quantity for ${product.name}`} onChange={(n) => setQuantity(product.id, variant?.id, n)} />
          <button type="button" onClick={() => remove(product.id, variant?.id)} className="link-underline text-sm text-muted hover:text-white">
            Remove<span className="sr-only"> {product.name}</span>
          </button>
        </div>
      </div>
    </li>
  );
}
