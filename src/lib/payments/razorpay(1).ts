import "server-only";
import { serverEnv } from "@/lib/env";

/**
 * Minimal Razorpay Orders API client using fetch (no SDK required).
 * Verify against current docs before going live: https://razorpay.com/docs/api/orders/
 */
export interface RazorpayOrder {
  id: string;
  amount: number;
  currency: string;
  status: string;
}

export async function createRazorpayOrder(params: { amountMinor: number; currency: string; receipt: string; notes?: Record<string, string> }): Promise<RazorpayOrder> {
  const auth = Buffer.from(`${serverEnv.razorpayKeyId}:${serverEnv.razorpayKeySecret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
    body: JSON.stringify({ amount: params.amountMinor, currency: params.currency, receipt: params.receipt.slice(0, 40), notes: params.notes }),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Razorpay order creation failed (${res.status}): ${text.slice(0, 300)}`);
  }
  return (await res.json()) as RazorpayOrder;
}
