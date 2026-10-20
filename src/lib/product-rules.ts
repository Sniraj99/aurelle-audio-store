import type { AvailabilityStatus, Product, ProductVariant } from "@/types/product";

export const availabilityLabels: Record<AvailabilityStatus, string> = {
  in_stock: "In stock",
  made_to_order: "Made to order",
  preorder: "Pre-order",
  unavailable: "Temporarily unavailable",
};

export function findVariant(product: Product, variantId?: string | null): ProductVariant | undefined {
  if (!variantId) return undefined;
  return product.variants?.find((v) => v.id === variantId);
}

/** Effective availability, preferring the variant's status. */
export function availabilityOf(product: Product, variant?: ProductVariant): AvailabilityStatus | undefined {
  return variant?.availability ?? product.availability;
}

export interface UnitPrice {
  regularMinor: number;
  saleMinor?: number;
  effectiveMinor: number;
}

export function unitPrice(product: Product, variant?: ProductVariant): UnitPrice | null {
  const regular = variant?.priceMinor ?? product.priceMinor;
  if (regular === undefined) return null;
  const sale = variant?.priceMinor !== undefined ? variant.salePriceMinor : (variant?.salePriceMinor ?? product.salePriceMinor);
  const validSale = sale !== undefined && sale > 0 && sale < regular ? sale : undefined;
  return { regularMinor: regular, saleMinor: validSale, effectiveMinor: validSale ?? regular };
}

/** Lowest effective price across the product and its variants (for filtering and sorting). */
export function fromPrice(product: Product): number | null {
  const prices = [unitPrice(product)?.effectiveMinor, ...(product.variants ?? []).map((v) => unitPrice(product, v)?.effectiveMinor)]
    .filter((p): p is number => typeof p === "number");
  return prices.length ? Math.min(...prices) : null;
}

/** True when the variant must be chosen before adding to the bag. */
export function requiresVariant(product: Product): boolean {
  return (product.variants?.length ?? 0) > 0;
}

export type PurchaseBlock = "enquiry_only" | "no_price" | "unavailable" | "variant_required" | "unknown_variant";

/** Why a product (or a specific variant) cannot be bought online, or null when it can. */
export function purchaseBlock(product: Product, variantId?: string | null): PurchaseBlock | null {
  if (product.purchaseMode !== "purchase") return "enquiry_only";
  let variant: ProductVariant | undefined;
  if (requiresVariant(product)) {
    if (!variantId) return "variant_required";
    variant = findVariant(product, variantId);
    if (!variant) return "unknown_variant";
  } else if (variantId) {
    return "unknown_variant";
  }
  if (!unitPrice(product, variant)) return "no_price";
  if (availabilityOf(product, variant) === "unavailable") return "unavailable";
  return null;
}

/** Product-level purchasability (any variant could be bought). Used for cards. */
export function isPurchasable(product: Product): boolean {
  if (requiresVariant(product)) return product.variants!.some((v) => purchaseBlock(product, v.id) === null);
  return purchaseBlock(product) === null;
}

export function stockLimit(product: Product, variant?: ProductVariant): number | undefined {
  return variant?.stock ?? product.stock;
}
