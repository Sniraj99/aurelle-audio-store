import { createHmac, timingSafeEqual } from "node:crypto";

function safeEqualHex(a: string, b: string): boolean {
  const ba = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Razorpay Checkout signature: HMAC-SHA256(order_id + "|" + payment_id, key_secret). */
export function verifyRazorpayPaymentSignature(orderId: string, paymentId: string, signature: string, keySecret: string): boolean {
  if (!orderId || !paymentId || !signature || !keySecret) return false;
  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

/** Razorpay webhook signature: HMAC-SHA256(raw request body, webhook_secret). */
export function verifyRazorpayWebhookSignature(rawBody: string, signature: string, webhookSecret: string): boolean {
  if (!signature || !webhookSecret) return false;
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
