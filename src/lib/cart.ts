import type { Product, ProductVariant } from "@/types/product";
import { commerce } from "@/config/commerce";
import { findVariant, purchaseBlock, stockLimit, unitPrice } from "@/lib/product-rules";

/** A cart line stores identity and quantity only. Prices are always re-derived from product data. */
export interface CartLine {
  productId: string;
  variantId?: string;
  quantity: number;
}

export type CartAction =
  | { type: "add"; productId: string; variantId?: string; quantity: number }
  | { type: "setQuantity"; productId: string; variantId?: string; quantity: number }
  | { type: "remove"; productId: string; variantId?: string }
  | { type: "clear" }
  | { type: "hydrate"; lines: CartLine[] };

export const lineKey = (productId: string, variantId?: string) => `${productId}::${variantId ?? ""}`;

/** Coerces any input to an integer between 1 and the line maximum. */
export function clampQuantity(q: unknown, max = commerce.maxQuantityPerLine): number {
  const n = typeof q === "number" ? q : Number(q);
  if (!Number.isFinite(n)) return 1;
  return Math.min(Math.max(1, Math.floor(n)), Math.max(1, max));
}

export function cartReducer(lines: CartLine[], action: CartAction): CartLine[] {
  switch (action.type) {
    case "add": {
      const key = lineKey(action.productId, action.variantId);
      const existing = lines.find((l) => lineKey(l.productId, l.variantId) === key);
      if (existing) {
        return lines.map((l) => (l === existing ? { ...l, quantity: clampQuantity(l.quantity + clampQuantity(action.quantity)) } : l));
      }
      return [...lines, { productId: action.productId, variantId: action.variantId, quantity: clampQuantity(action.quantity) }];
    }
    case "setQuantity": {
      const key = lineKey(action.productId, action.variantId);
      if (!Number.isFinite(action.quantity) || action.quantity < 1) {
        return lines.filter((l) => lineKey(l.productId, l.variantId) !== key);
      }
      return lines.map((l) => (lineKey(l.productId, l.variantId) === key ? { ...l, quantity: clampQuantity(action.quantity) } : l));
    }
    case "remove": {
      const key = lineKey(action.productId, action.variantId);
      return lines.filter((l) => lineKey(l.productId, l.variantId) !== key);
    }
    case "clear":
      return [];
    case "hydrate":
      return sanitizeLines(action.lines);
  }
}

/** Accepts untrusted stored data and returns well-formed, de-duplicated lines. */
export function sanitizeLines(input: unknown): CartLine[] {
  if (!Array.isArray(input)) return [];
  let out: CartLine[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== "object") continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.productId !== "string" || !r.productId) continue;
    const variantId = typeof r.variantId === "string" && r.variantId ? r.variantId : undefined;
    out = cartReducer(out, { type: "add", productId: r.productId, variantId, quantity: clampQuantity(r.quantity) });
  }
  return out;
}

export interface ResolvedLine {
  key: string;
  product: Product;
  variant?: ProductVariant;
  quantity: number;
  unitMinor: number;
  regularUnitMinor: number;
  lineTotalMinor: number;
  maxQuantity: number;
}

export interface ResolvedCart {
  lines: ResolvedLine[];
  /** Lines that can no longer be bought (removed, enquiry-only, unavailable). */
  invalid: { line: CartLine; product?: Product; reason: string }[];
  itemCount: number;
  subtotalMinor: number;
}

export function resolveCart(lines: CartLine[], catalogue: Product[]): ResolvedCart {
  const resolved: ResolvedLine[] = [];
  const invalid: ResolvedCart["invalid"] = [];
  for (const line of lines) {
    const product = catalogue.find((p) => p.id === line.productId);
    if (!product) { invalid.push({ line, reason: "This item is no longer listed." }); continue; }
    const block = purchaseBlock(product, line.variantId);
    if (block) {
      invalid.push({ line, product, reason: block === "unavailable" ? "Temporarily unavailable." : "Not available to buy online." });
      continue;
    }
    const variant = findVariant(product, line.variantId);
    const price = unitPrice(product, variant)!;
    const stock = stockLimit(product, variant);
    const maxQuantity = Math.max(1, Math.min(commerce.maxQuantityPerLine, stock ?? Infinity));
    const quantity = Math.min(line.quantity, maxQuantity);
    resolved.push({
      key: lineKey(product.id, variant?.id),
      product, variant, quantity,
      unitMinor: price.effectiveMinor,
      regularUnitMinor: price.regularMinor,
      lineTotalMinor: price.effectiveMinor * quantity,
      maxQuantity,
    });
  }
  return {
    lines: resolved,
    invalid,
    itemCount: resolved.reduce((n, l) => n + l.quantity, 0),
    subtotalMinor: resolved.reduce((n, l) => n + l.lineTotalMinor, 0),
  };
}
