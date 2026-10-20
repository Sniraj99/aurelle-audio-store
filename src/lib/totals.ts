import { commerce, type ShippingMethod, type TaxMode } from "@/config/commerce";

export interface Totals {
  subtotalMinor: number;
  /** null = no shipping method is configured, so shipping is not charged online. */
  shippingMinor: number | null;
  /** Tax added to the total (exclusive mode). */
  taxAddedMinor: number;
  /** Tax already included in prices (inclusive mode), for display only. */
  taxIncludedMinor: number;
  totalMinor: number;
}

export function shippingFee(method: ShippingMethod | undefined, subtotalMinor: number): number | null {
  if (!method) return null;
  if (method.freeAboveMinor !== undefined && subtotalMinor >= method.freeAboveMinor) return 0;
  return method.feeMinor;
}

export function computeTotals(
  subtotalMinor: number,
  method: ShippingMethod | undefined,
  tax: { mode: TaxMode; rate: number } = commerce.tax,
): Totals {
  const shippingMinor = shippingFee(method, subtotalMinor);
  const base = subtotalMinor + (shippingMinor ?? 0);
  let taxAddedMinor = 0;
  let taxIncludedMinor = 0;
  if (tax.mode === "exclusive" && tax.rate > 0) taxAddedMinor = Math.round(base * tax.rate);
  if (tax.mode === "inclusive" && tax.rate > 0) taxIncludedMinor = Math.round(base - base / (1 + tax.rate));
  return { subtotalMinor, shippingMinor, taxAddedMinor, taxIncludedMinor, totalMinor: base + taxAddedMinor };
}

export function getShippingMethod(id: string | undefined | null): ShippingMethod | undefined {
  return commerce.shippingMethods.find((m) => m.id === id);
}
