import "server-only";
import { randomBytes } from "node:crypto";
import type { CheckoutCustomer } from "@/lib/validation";
import type { PricedLine } from "@/lib/orders/price-order";
import type { Totals } from "@/lib/totals";
import { isDatabaseConfigured } from "@/lib/env";

/**
 * Data access for orders. The Prisma client is loaded lazily so the site runs
 * without a database in demo mode.
 */
async function db() {
  if (!isDatabaseConfigured()) throw new Error("DATABASE_URL is not configured");
  return (await import("@/lib/db")).prisma;
}

export const newPublicId = () => randomBytes(12).toString("base64url");

export interface CreateOrderInput {
  idempotencyKey: string;
  provider: "razorpay" | "manual";
  customer: CheckoutCustomer;
  lines: PricedLine[];
  totals: Totals;
  currency: string;
  shippingMethodId?: string;
}

export async function findOrderByIdempotencyKey(key: string) {
  return (await db()).order.findUnique({ where: { idempotencyKey: key } });
}

export async function createOrder(input: CreateOrderInput) {
  const prisma = await db();
  const c = input.customer;
  return prisma.order.create({
    data: {
      publicId: newPublicId(),
      idempotencyKey: input.idempotencyKey,
      paymentProvider: input.provider,
      currency: input.currency,
      subtotalMinor: input.totals.subtotalMinor,
      shippingMinor: input.totals.shippingMinor,
      taxMinor: input.totals.taxAddedMinor,
      totalMinor: input.totals.totalMinor,
      shippingMethodId: input.shippingMethodId,
      customerName: c.name, email: c.email, phone: c.phone,
      address1: c.address1, address2: c.address2 || null, city: c.city, state: c.state,
      postalCode: c.postalCode, country: c.country, notes: c.notes || null,
      items: { create: input.lines.map((l) => ({ ...l, variantId: l.variantId ?? null, variantName: l.variantName ?? null, sku: l.sku ?? null })) },
    },
  });
}

export async function attachRazorpayOrder(orderId: string, razorpayOrderId: string) {
  return (await db()).order.update({ where: { id: orderId }, data: { razorpayOrderId } });
}

/** Public, non-sensitive order view for the confirmation page (no address or phone). */
export async function getPublicOrder(publicId: string) {
  if (!isDatabaseConfigured() || !/^[A-Za-z0-9_-]{16}$/.test(publicId)) return null;
  return (await db()).order.findUnique({
    where: { publicId },
    select: {
      publicId: true, status: true, paymentProvider: true, currency: true, subtotalMinor: true, shippingMinor: true,
      taxMinor: true, totalMinor: true, customerName: true, createdAt: true,
      items: { select: { name: true, variantName: true, quantity: true, lineTotalMinor: true } },
    },
  });
}

/**
 * Marks an order paid exactly once and decrements tracked inventory in the same
 * transaction. Safe to call from both the client verification route and webhooks.
 */
export async function markOrderPaid(razorpayOrderId: string, razorpayPaymentId: string, amountMinor?: number) {
  const prisma = await db();
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { razorpayOrderId }, include: { items: true } });
    if (!order) return null;
    if (order.status === "PAID" || order.status === "NEEDS_REVIEW" || order.status === "FULFILLED") return order;
    if (amountMinor !== undefined && amountMinor !== order.totalMinor) {
      return tx.order.update({ where: { id: order.id }, data: { status: "NEEDS_REVIEW", razorpayPaymentId } });
    }
    let inventoryConflict = false;
    for (const item of order.items) {
      if (!item.sku) continue;
      const res = await tx.inventoryItem.updateMany({
        where: { sku: item.sku, quantity: { gte: item.quantity } },
        data: { quantity: { decrement: item.quantity } },
      });
      if (res.count === 0 && (await tx.inventoryItem.findUnique({ where: { sku: item.sku } }))) inventoryConflict = true;
    }
    return tx.order.update({
      where: { id: order.id },
      data: { status: inventoryConflict ? "NEEDS_REVIEW" : "PAID", razorpayPaymentId, paidAt: new Date() },
    });
  });
}

export async function markOrderFailed(razorpayOrderId: string) {
  const prisma = await db();
  return prisma.order.updateMany({ where: { razorpayOrderId, status: "PENDING_PAYMENT" }, data: { status: "PAYMENT_FAILED" } });
}

/** Returns false if the event was already processed. */
export async function recordPaymentEvent(eventId: string, type: string, payload: unknown, razorpayOrderId?: string) {
  const prisma = await db();
  const order = razorpayOrderId ? await prisma.order.findUnique({ where: { razorpayOrderId }, select: { id: true } }) : null;
  try {
    await prisma.paymentEvent.create({ data: { eventId, provider: "razorpay", type, payload: payload as object, orderId: order?.id } });
    return true;
  } catch (e) {
    if ((e as { code?: string }).code === "P2002") return false; // unique violation = duplicate delivery
    throw e;
  }
}
