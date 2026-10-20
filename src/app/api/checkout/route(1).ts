import { randomBytes } from "node:crypto";
import { products } from "@/data/products";
import { validateCheckout } from "@/lib/validation";
import { priceOrder } from "@/lib/orders/price-order";
import { json, limitOrNull, readJson, sameOrigin } from "@/lib/http";
import { paymentMode, serverEnv } from "@/lib/env";
import type { CheckoutSuccess } from "@/lib/orders/types";

// Demo mode keeps a short-lived memory of submissions so a double click returns the same reference.
const demoSubmissions = new Map<string, { at: number; response: CheckoutSuccess }>();

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden", message: "Request blocked." }, 403);
  const limited = limitOrNull(req, "checkout", 10, 10 * 60_000);
  if (limited) return limited;

  const body = await readJson(req);
  if (!body) return json({ error: "bad_request", message: "Your order could not be read. Refresh and try again." }, 400);

  const v = validateCheckout(body);
  if (!v.ok) return json({ error: "invalid", message: "Check the highlighted fields.", fieldErrors: v.errors }, 422);

  const priced = priceOrder(v.data.items, v.data.shippingMethodId, products);
  if (!priced.ok) return json({ error: "unavailable_items", message: "Some items in your bag need attention.", problems: priced.problems }, 409);

  const mode = paymentMode();

  if (mode === "demo") {
    const now = Date.now();
    for (const [k, s] of demoSubmissions) if (now - s.at > 15 * 60_000) demoSubmissions.delete(k);
    const existing = demoSubmissions.get(v.data.idempotencyKey);
    if (existing) return json(existing.response);
    const response: CheckoutSuccess = {
      mode: "demo",
      reference: `DEMO-${randomBytes(4).toString("hex").toUpperCase()}`,
      lines: priced.lines,
      totals: priced.totals,
      currency: priced.currency,
    };
    demoSubmissions.set(v.data.idempotencyKey, { at: now, response });
    return json(response);
  }

  // Live modes: demo products must never be sold.
  if (priced.containsDemo) {
    return json({ error: "demo_products", message: "Demonstration products cannot be ordered. Replace demo data before accepting orders." }, 409);
  }

  const repo = await import("@/lib/orders/repository");
  try {
    let order = await repo.findOrderByIdempotencyKey(v.data.idempotencyKey);
    if (!order) {
      order = await repo.createOrder({
        idempotencyKey: v.data.idempotencyKey,
        provider: mode,
        customer: v.data.customer,
        lines: priced.lines,
        totals: priced.totals,
        currency: priced.currency,
        shippingMethodId: priced.shippingMethodId,
      });
    }

    if (mode === "manual") return json({ mode: "manual", publicId: order.publicId } satisfies CheckoutSuccess);

    if (order.status !== "PENDING_PAYMENT") {
      return json({ error: "already_processed", message: "This order has already been processed.", problems: [] }, 409);
    }
    let razorpayOrderId = order.razorpayOrderId;
    if (!razorpayOrderId) {
      const { createRazorpayOrder } = await import("@/lib/payments/razorpay");
      const rp = await createRazorpayOrder({ amountMinor: order.totalMinor, currency: order.currency, receipt: order.publicId, notes: { publicId: order.publicId } });
      razorpayOrderId = rp.id;
      await repo.attachRazorpayOrder(order.id, rp.id);
    }
    return json({
      mode: "razorpay",
      publicId: order.publicId,
      razorpayOrderId,
      keyId: serverEnv.razorpayKeyId, // publishable key id only; the secret never leaves the server
      amountMinor: order.totalMinor,
      currency: order.currency,
      prefill: { name: order.customerName, email: order.email, contact: order.phone },
    } satisfies CheckoutSuccess);
  } catch (e) {
    console.error("checkout", e);
    return json({ error: "server_error", message: "We couldn't start your payment. No money has been taken. Try again shortly." }, 500);
  }
}
