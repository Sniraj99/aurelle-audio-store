import { NextResponse } from "next/server";
import { serverEnv, isDatabaseConfigured } from "@/lib/env";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/signatures";

/**
 * Razorpay webhook. Configure in Dashboard → Webhooks with events:
 * payment.captured, payment.failed, order.paid. Uses the RAW body for signature checks.
 */
export async function POST(req: Request) {
  if (!serverEnv.razorpayWebhookSecret || !isDatabaseConfigured()) return new NextResponse("not configured", { status: 503 });
  const raw = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";
  if (!verifyRazorpayWebhookSignature(raw, signature, serverEnv.razorpayWebhookSecret)) {
    return new NextResponse("invalid signature", { status: 400 });
  }

  let event: { event?: string; payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number } } } };
  try { event = JSON.parse(raw); } catch { return new NextResponse("bad json", { status: 400 }); }

  const type = event.event ?? "unknown";
  const payment = event.payload?.payment?.entity;
  const eventId = req.headers.get("x-razorpay-event-id") ?? `${type}:${payment?.id ?? raw.length}`;
  const repo = await import("@/lib/orders/repository");

  const fresh = await repo.recordPaymentEvent(eventId, type, event, payment?.order_id);
  if (!fresh) return NextResponse.json({ ok: true, duplicate: true });

  if ((type === "payment.captured" || type === "order.paid") && payment?.order_id && payment.id) {
    await repo.markOrderPaid(payment.order_id, payment.id, payment.amount);
  } else if (type === "payment.failed" && payment?.order_id) {
    await repo.markOrderFailed(payment.order_id);
  }
  return NextResponse.json({ ok: true });
}
