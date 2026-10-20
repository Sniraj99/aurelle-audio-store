import { test } from "node:test";
import assert from "node:assert/strict";
import { products } from "@/data/products";
import { cartReducer, clampQuantity, resolveCart, sanitizeLines, type CartLine } from "@/lib/cart";
import { purchaseBlock, unitPrice, isPurchasable } from "@/lib/product-rules";
import { computeTotals } from "@/lib/totals";
import { formatMoney } from "@/lib/money";

const b2 = products.find((p) => p.slug === "atelier-b2")!;
const b1 = products.find((p) => p.slug === "atelier-b1")!;

test("duplicate additions merge into one line and clamp to the maximum", () => {
  let lines: CartLine[] = [];
  lines = cartReducer(lines, { type: "add", productId: b2.id, variantId: "oak", quantity: 2 });
  lines = cartReducer(lines, { type: "add", productId: b2.id, variantId: "oak", quantity: 3 });
  lines = cartReducer(lines, { type: "add", productId: b2.id, variantId: "black", quantity: 1 });
  assert.equal(lines.length, 2);
  assert.equal(lines[0]!.quantity, 5);
  lines = cartReducer(lines, { type: "add", productId: b2.id, variantId: "oak", quantity: 50 });
  assert.equal(lines[0]!.quantity, 10);
});

test("invalid quantities are coerced; zero removes the line", () => {
  assert.equal(clampQuantity("abc"), 1);
  assert.equal(clampQuantity(-4), 1);
  assert.equal(clampQuantity(2.9), 2);
  assert.equal(clampQuantity(Infinity), 1);
  let lines = cartReducer([], { type: "add", productId: b1.id, quantity: 1 });
  lines = cartReducer(lines, { type: "setQuantity", productId: b1.id, quantity: 0 });
  assert.equal(lines.length, 0);
});

test("sanitizeLines rejects malformed stored data", () => {
  const lines = sanitizeLines([null, 5, { productId: "" }, { productId: "x", quantity: "7" }, { productId: "x", quantity: 2 }]);
  assert.deepEqual(lines, [{ productId: "x", variantId: undefined, quantity: 9 }]);
  assert.deepEqual(sanitizeLines("nope"), []);
});

test("purchase rules: enquiry-only, unavailable and missing variant are blocked", () => {
  const enquiry = products.find((p) => p.purchaseMode === "enquiry")!;
  assert.equal(purchaseBlock(enquiry), "enquiry_only");
  assert.equal(purchaseBlock(b2), "variant_required");
  assert.equal(purchaseBlock(b2, "nope"), "unknown_variant");
  assert.equal(purchaseBlock(b2, "oak"), null);
  assert.equal(isPurchasable(enquiry), false);
  assert.equal(isPurchasable(b2), true);
});

test("resolveCart prices from catalogue and quarantines unbuyable lines", () => {
  const enquiry = products.find((p) => p.purchaseMode === "enquiry")!;
  const cart = resolveCart([
    { productId: b2.id, variantId: "oak", quantity: 2 },
    { productId: b1.id, quantity: 1 },
    { productId: enquiry.id, quantity: 1 },
    { productId: "ghost", quantity: 1 },
  ], products);
  assert.equal(cart.lines.length, 2);
  assert.equal(cart.invalid.length, 2);
  assert.equal(cart.itemCount, 3);
  assert.equal(cart.subtotalMinor, 2 * b2.priceMinor! + b1.priceMinor!);
});

test("sale price is used only when lower than regular", () => {
  assert.equal(unitPrice({ ...b2, salePriceMinor: 5000000 })!.effectiveMinor, 5000000);
  assert.equal(unitPrice({ ...b2, salePriceMinor: 9000000 })!.saleMinor, undefined);
});

test("totals: no shipping configured, free-above threshold, exclusive and inclusive tax", () => {
  assert.deepEqual(computeTotals(100000, undefined, { mode: "none", rate: 0 }), { subtotalMinor: 100000, shippingMinor: null, taxAddedMinor: 0, taxIncludedMinor: 0, totalMinor: 100000 });
  const m = { id: "s", label: "S", feeMinor: 50000, freeAboveMinor: 200000 };
  assert.equal(computeTotals(100000, m, { mode: "none", rate: 0 }).totalMinor, 150000);
  assert.equal(computeTotals(200000, m, { mode: "none", rate: 0 }).shippingMinor, 0);
  assert.equal(computeTotals(100000, undefined, { mode: "exclusive", rate: 0.18 }).totalMinor, 118000);
  const inc = computeTotals(118000, undefined, { mode: "inclusive", rate: 0.18 });
  assert.equal(inc.totalMinor, 118000);
  assert.equal(inc.taxIncludedMinor, 18000);
});

test("INR formatting uses Indian digit grouping", () => {
  assert.equal(formatMoney(18900000, "INR", "en-IN"), "₹1,89,000");
  assert.equal(formatMoney(12345, "INR", "en-IN"), "₹123.45");
});
