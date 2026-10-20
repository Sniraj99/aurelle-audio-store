import type { PricedLine } from "@/lib/orders/price-order";
import type { Totals } from "@/lib/totals";

export type PaymentModePublic = "demo" | "razorpay" | "manual";

export type CheckoutSuccess =
  | { mode: "demo"; reference: string; lines: PricedLine[]; totals: Totals; currency: string }
  | { mode: "manual"; publicId: string }
  | {
      mode: "razorpay";
      publicId: string;
      razorpayOrderId: string;
      keyId: string;
      amountMinor: number;
      currency: string;
      prefill: { name: string; email: string; contact: string };
    };

export interface CheckoutFailure {
  error: string;
  message: string;
  fieldErrors?: Record<string, string>;
  problems?: string[];
}

/** sessionStorage key for the demo confirmation (demo orders are never stored server-side). */
export const DEMO_ORDER_STORAGE_KEY = "demo-order";
