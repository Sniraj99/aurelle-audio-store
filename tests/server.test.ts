import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { products } from "@/data/products";
import { priceOrder } from "@/lib/orders/price-order";
import { validateCheckout, validateContact, validateNewsletter } from "@/lib/validation";
import { verifyRazorpayPaymentSignature, verifyRazorpayWebhookSignature } from "@/lib/payments/signatures";
import { rateLimit } from "@/lib/rate-limit";

const b2 = products.find((p) => p.slug === "atelier-b2")!;
const vela = products.find((p) => p.slug === "vela-soundbar")!;

test("server pricing ignores any client price and merges duplicate lines", () => {
  const r = priceOrder([
    { productId: b2.id, variantId: "oak", quantity: 1, priceMinor: 1 } as never,
    { productId: b2.id, variantId: "oak", quantity: 1 },
    { productId: vela.id, quantity: 1 },
  ], undefined, products);
  assert.ok(r.ok);
  if (!r.ok) return;
  assert.equal(r.lines.length, 2);
  assert.equal(r.lines[0]!.quantity, 2);
  assert.equal(r.totals.totalMinor, 2 * b2.priceMinor! + vela.priceMinor!);
  assert.equal(r.containsDemo, true);
});

test("server pricing rejects enquiry-only, unavailable, unknown and over-stock items", () => {
  const enquiry = products.find((p) => p.purchaseMode === "enquiry")!;
  for (const items of [
    [{ productId: enquiry.id, quantity: 1 }],
    [{ productId: "ghost", quantity: 1 }],
    [{ productId: b2.id, quantity: 1 }], // variant required
    [{ productId: b2.id, variantId: "oak", quantity: 50 }], // stock 12
  ]) {
    assert.equal(priceOrder(items, undefined, products).ok, false);
  }
});

const validCustomer = {
  name: "Asha Rao", email: "Asha@Example.com", phone: "98765 43210", address1: "Flat 4, 12 Lane Road",
  address2: "", city: "Pune", state: "Maharashtra", postalCode: "411 001", country: "in", notes: "",
};

test("checkout validation accepts a valid Indian address and normalises it", () => {
  const r = validateCheckout({ customer: validCustomer, items: [{ productId: "x", quantity: 1 }], idempotencyKey: "abcdefghijklmnop1234", acceptTerms: true });
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.data.customer.email, "asha@example.com");
    assert.equal(r.data.customer.postalCode, "411001");
    assert.equal(r.data.customer.country, "IN");
  }
});

test("checkout validation reports field errors", () => {
  const r = validateCheckout({ customer: { ...validCustomer, phone: "12345", postalCode: "011001", state: "Atlantis", email: "nope" }, items: [], idempotencyKey: "short", acceptTerms: false });
  assert.equal(r.ok, false);
  if (!r.ok) {
    for (const k of ["phone", "postalCode", "state", "email", "items", "terms"]) assert.ok(r.errors[k as keyof typeof r.errors], k);
  }
});

test("contact and newsletter validation", () => {
  assert.equal(validateContact({ name: "A", email: "x", enquiryType: "bad", message: "hi" }).ok, false);
  const ok = validateContact({ name: "Asha Rao", email: "a@b.co", enquiryType: "product", product: "Monolith F1", message: "Is the walnut finish available?", consent: true });
  assert.ok(ok.ok);
  assert.equal(validateNewsletter({ email: "a@b.co" }).ok, false);
  assert.ok(validateNewsletter({ email: "a@b.co", consent: "on" }).ok);
});

test("Razorpay payment and webhook signatures verify correctly", () => {
  const secret = "test_secret";
  const sig = createHmac("sha256", secret).update("order_1|pay_1").digest("hex");
  assert.ok(verifyRazorpayPaymentSignature("order_1", "pay_1", sig, secret));
  assert.ok(!verifyRazorpayPaymentSignature("order_1", "pay_2", sig, secret));
  assert.ok(!verifyRazorpayPaymentSignature("order_1", "pay_1", "short", secret));
  const body = JSON.stringify({ event: "payment.captured" });
  const wsig = createHmac("sha256", "wh").update(body).digest("hex");
  assert.ok(verifyRazorpayWebhookSignature(body, wsig, "wh"));
  assert.ok(!verifyRazorpayWebhookSignature(body + " ", wsig, "wh"));
});

test("rate limiter blocks after the limit and resets after the window", () => {
  const t = 1_000_000;
  for (let i = 0; i < 3; i++) assert.ok(rateLimit("k", 3, 1000, t).ok);
  assert.equal(rateLimit("k", 3, 1000, t).ok, false);
  assert.ok(rateLimit("k", 3, 1000, t + 1001).ok);
});
