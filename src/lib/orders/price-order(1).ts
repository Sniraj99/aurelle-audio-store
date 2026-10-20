/**
 * Server-side order pricing. The client never supplies prices: every amount is
 * recomputed from the product catalogue and commerce configuration.
 */
import type { Product } from "@/types/product";
import { commerce } from "@/config/commerce";
import { findVariant, purchaseBlock, stockLimit, unitPrice } from "@/lib/product-rules";
import { computeTotals, getShippingMethod, type Totals } from "@/lib/totals";
import type { CheckoutItemInput } from "@/lib/validation";
import { lineKey } from "@/lib/cart";

export interface PricedLine {
  productId: string;
  variantId?: string;
  name: string;
  variantName?: string;
  sku?: string;
  unitPriceMinor: number;
  quantity: number;
  lineTotalMinor: number;
}

export type PriceOrderResult =
  | { ok: true; lines: PricedLine[]; totals: Totals; currency: string; shippingMethodId?: string; containsDemo: boolean }
  | { ok: false; problems: string[] };

export function priceOrder(items: CheckoutItemInput[], shippingMethodId: string | undefined, catalogue: Product[]): PriceOrderResult {
  const problems: string[] = [];
  const merged = new Map<string, CheckoutItemInput>();
  for (const it of items) {
    const key = lineKey(it.productId, it.variantId);
    const prev = merged.get(key);
    merged.set(key, { ...it, quantity: (prev?.quantity ?? 0) + it.quantity });
  }

  const lines: PricedLine[] = [];
  let containsDemo = false;
  for (const it of merged.values()) {
    const product = catalogue.find((p) => p.id === it.productId);
    if (!product) { problems.push("An item in your bag is no longer available."); continue; }
    const block = purchaseBlock(product, it.variantId);
    if (block) { problems.push(`${product.name} can't be bought online right now.`); continue; }
    if (product.currency !== commerce.currency) { problems.push(`${product.name} is priced in a different currency.`); continue; }
    const variant = findVariant(product, it.variantId);
    const limit = Math.min(commerce.maxQuantityPerLine, stockLimit(product, variant) ?? Infinity);
    if (it.quantity > limit) { problems.push(`Only ${limit} of ${product.name} can be ordered at once.`); continue; }
    const price = unitPrice(product, variant)!;
    containsDemo ||= product.demo;
    lines.push({
      productId: product.id,
      variantId: variant?.id,
      name: product.name,
      variantName: variant?.name,
      sku: variant?.sku ?? product.sku,
      unitPriceMinor: price.effectiveMinor,
      quantity: it.quantity,
      lineTotalMinor: price.effectiveMinor * it.quantity,
    });
  }

  const methods = commerce.shippingMethods;
  let method = undefined;
  if (methods.length) {
    method = getShippingMethod(shippingMethodId);
    if (!method) problems.push("Choose a delivery method.");
  }

  if (problems.length) return { ok: false, problems };
  const subtotal = lines.reduce((n, l) => n + l.lineTotalMinor, 0);
  return { ok: true, lines, totals: computeTotals(subtotal, method), currency: commerce.currency, shippingMethodId: method?.id, containsDemo };
}
