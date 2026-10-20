import { json, limitOrNull, readJson, sameOrigin } from "@/lib/http";
import { paymentMode, serverEnv } from "@/lib/env";
import { verifyRazorpayPaymentSignature } from "@/lib/payments/signatures";

/** Called by the browser after Razorpay Checkout succeeds. The signature proves the payment is genuine. */
export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden" }, 403);
  const limited = limitOrNull(req, "verify", 20, 10 * 60_000);
  if (limited) return limited;
  if (paymentMode() !== "razorpay") return json({ error: "not_configured" }, 503);

  const body = await readJson(req, 4_000);
  const orderId = typeof body?.razorpay_order_id === "string" ? body.razorpay_order_id : "";
  const paymentId = typeof body?.razorpay_payment_id === "string" ? body.razorpay_payment_id : "";
  const signature = typeof body?.razorpay_signature === "string" ? body.razorpay_signature : "";

  if (!verifyRazorpayPaymentSignature(orderId, paymentId, signature, serverEnv.razorpayKeySecret)) {
    return json({ error: "invalid_signature", message: "We couldn't verify this payment. If money was deducted, contact us with your payment ID." }, 400);
  }
  const { markOrderPaid } = await import("@/lib/orders/repository");
  const order = await markOrderPaid(orderId, paymentId);
  if (!order) return json({ error: "not_found" }, 404);
  return json({ ok: true, publicId: order.publicId, status: order.status });
}
