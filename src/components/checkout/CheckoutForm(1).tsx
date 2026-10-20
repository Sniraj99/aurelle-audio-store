"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";
import { useCart } from "@/components/cart/CartProvider";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { Button, buttonClass } from "@/components/ui/Button";
import { brand } from "@/config/brand";
import { commerce, countries, getCountry } from "@/config/commerce";
import { computeTotals, getShippingMethod } from "@/lib/totals";
import { validateCustomer, type CheckoutCustomer, type CheckoutKey } from "@/lib/validation";
import { DEMO_ORDER_STORAGE_KEY, type CheckoutFailure, type CheckoutSuccess, type PaymentModePublic } from "@/lib/orders/types";

declare global {
  interface Window { Razorpay?: new (options: Record<string, unknown>) => { open(): void; on(event: string, cb: (r: unknown) => void): void } }
}

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";
function loadRazorpay(): Promise<boolean> {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise((resolve) => {
    const s = document.createElement("script");
    s.src = RAZORPAY_SRC;
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });
}

/** URL-safe random key; works even where crypto.randomUUID is unavailable (non-HTTPS LAN testing). */
function randomKey(): string {
  const bytes = new Uint8Array(18);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

const blank: CheckoutCustomer = { name: "", email: "", phone: "", address1: "", address2: "", city: "", state: "", postalCode: "", country: commerce.defaultCountry, notes: "" };

const fieldOrder: CheckoutKey[] = ["name", "email", "phone", "address1", "city", "state", "postalCode", "country", "shippingMethodId", "terms"];

const modeCopy: Record<PaymentModePublic, { title: string; body: string; cta: string }> = {
  demo: {
    title: "Demonstration checkout",
    body: "Online payment is not connected yet. Placing this order will not take any payment and will not create a real order.",
    cta: "Place demo order",
  },
  razorpay: {
    title: "Secure payment with Razorpay",
    body: "You'll complete payment in Razorpay's secure window. Your card or UPI details are never sent to our servers.",
    cta: "Continue to payment",
  },
  manual: {
    title: "Order request",
    body: "We'll confirm availability and delivery, then send you payment instructions. Nothing is charged now.",
    cta: "Send order request",
  },
};

export function CheckoutForm({ mode }: { mode: PaymentModePublic }) {
  const router = useRouter();
  const { cart, lines, hydrated, clear } = useCart();
  const [c, setC] = useState<CheckoutCustomer>(blank);
  const [shippingMethodId, setShippingMethodId] = useState<string | undefined>(commerce.shippingMethods[0]?.id);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<CheckoutKey, string>>>({});
  const [status, setStatus] = useState<{ kind: "idle" | "submitting" | "paying" } | { kind: "error"; message: string; problems?: string[] }>({ kind: "idle" });
  const summaryRef = useRef<HTMLDivElement>(null);

  // A new idempotency key whenever the bag changes; the same key across retries of the same bag.
  const idempotencyKey = useMemo(() => randomKey(), [JSON.stringify(lines)]); // eslint-disable-line react-hooks/exhaustive-deps

  const country = getCountry(c.country) ?? countries[0]!;
  const method = getShippingMethod(shippingMethodId);
  const totals = computeTotals(cart.subtotalMinor, method);

  useEffect(() => { if (status.kind === "error") summaryRef.current?.focus(); }, [status]);

  if (!hydrated) return <div className="h-96 animate-pulse bg-midnight" role="status" aria-label="Loading checkout" />;
  if (!cart.lines.length) {
    return (
      <div className="flex flex-col items-start gap-6 border-t border-line py-16">
        <p className="display-md text-white">Your bag is empty.</p>
        <p className="text-muted">Add a product before checking out.</p>
        <Link href="/products" className={buttonClass("primary", "lg")}>Explore the Collection</Link>
      </div>
    );
  }

  const set = (k: keyof CheckoutCustomer) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setC((prev) => ({ ...prev, [k]: e.target.value }));
    if (errors[k]) setErrors((prev) => ({ ...prev, [k]: undefined }));
  };

  function clientValidate() {
    const r = validateCustomer(c as unknown as Record<string, unknown>);
    const errs: Partial<Record<CheckoutKey, string>> = r.ok ? {} : { ...r.errors };
    if (commerce.shippingMethods.length && !method) errs.shippingMethodId = "Choose a delivery method.";
    if (!acceptTerms) errs.terms = "Accept the Terms and Conditions to place your order.";
    return errs;
  }

  function focusFirst(errs: Partial<Record<CheckoutKey, string>>) {
    const first = fieldOrder.find((k) => errs[k]);
    if (first) document.getElementById(`co-${first}`)?.focus();
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status.kind === "submitting" || status.kind === "paying") return; // duplicate-submission guard
    const errs = clientValidate();
    setErrors(errs);
    if (Object.keys(errs).length) { focusFirst(errs); return; }

    setStatus({ kind: "submitting" });
    let data: CheckoutSuccess | CheckoutFailure;
    let ok = false;
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer: c, items: cart.lines.map((l) => ({ productId: l.product.id, variantId: l.variant?.id, quantity: l.quantity })), shippingMethodId, idempotencyKey, acceptTerms }),
      });
      ok = res.ok;
      data = await res.json();
    } catch {
      setStatus({ kind: "error", message: "We couldn't reach the server. Check your connection; no payment has been taken." });
      return;
    }

    if (!ok || "error" in data) {
      const f = data as CheckoutFailure;
      if (f.fieldErrors) { setErrors(f.fieldErrors as Partial<Record<CheckoutKey, string>>); focusFirst(f.fieldErrors as Partial<Record<CheckoutKey, string>>); }
      setStatus({ kind: "error", message: f.message ?? "Something went wrong. No payment has been taken.", problems: f.problems });
      return;
    }

    if (data.mode === "demo") {
      try { sessionStorage.setItem(DEMO_ORDER_STORAGE_KEY, JSON.stringify(data)); } catch { /* ignore */ }
      clear();
      router.push("/order/demo");
      return;
    }
    if (data.mode === "manual") {
      clear();
      router.push(`/order/${data.publicId}`);
      return;
    }

    // Razorpay
    const loaded = await loadRazorpay();
    if (!loaded || !window.Razorpay) {
      setStatus({ kind: "error", message: "The payment window couldn't load. Disable content blockers for this page and try again. No payment has been taken." });
      return;
    }
    setStatus({ kind: "paying" });
    const success = data;
    const rzp = new window.Razorpay({
      key: success.keyId,
      amount: success.amountMinor,
      currency: success.currency,
      name: brand.name,
      description: `Order ${success.publicId}`,
      order_id: success.razorpayOrderId,
      prefill: success.prefill,
      theme: { color: "#C5A15A" },
      handler: async (resp: Record<string, string>) => {
        try {
          const v = await fetch("/api/payments/razorpay/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(resp) });
          const vr = await v.json();
          if (v.ok) { clear(); router.push(`/order/${vr.publicId}`); return; }
          setStatus({ kind: "error", message: vr.message ?? "We couldn't verify the payment. Contact us with your payment ID before trying again." });
        } catch {
          setStatus({ kind: "error", message: "We couldn't confirm your payment. Don't pay again: contact us with your payment ID and we'll check it." });
        }
      },
      modal: { ondismiss: () => setStatus({ kind: "error", message: "Payment was not completed. Your bag is saved; you can try again." }) },
    });
    rzp.on("payment.failed", () => setStatus({ kind: "error", message: "The payment was declined or failed. No order has been confirmed. Try again or use another method." }));
    rzp.open();
  }

  const err = (k: CheckoutKey) => errors[k] ? <p id={`co-${k}-error`} className="field-error">{errors[k]}</p> : null;
  const aria = (k: CheckoutKey) => ({ "aria-invalid": Boolean(errors[k]) || undefined, "aria-describedby": errors[k] ? `co-${k}-error` : undefined });
  const busy = status.kind === "submitting" || status.kind === "paying";

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-16 lg:grid-cols-12">
      <div className="grid gap-14 lg:col-span-7">
        {status.kind === "error" && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="border-l border-[#f0a597] py-2 pl-4">
            <p className="text-white">{status.message}</p>
            {status.problems?.length ? <ul className="mt-2 list-disc pl-5 text-sm text-muted">{status.problems.map((p) => <li key={p}>{p}</li>)}</ul> : null}
          </div>
        )}

        <fieldset>
          <legend className="mb-6 text-xl text-white">Contact</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2"><label htmlFor="co-name" className="field-label">Full name</label><input id="co-name" className="field" autoComplete="name" value={c.name} onChange={set("name")} {...aria("name")} />{err("name")}</div>
            <div><label htmlFor="co-email" className="field-label">Email</label><input id="co-email" type="email" className="field" autoComplete="email" value={c.email} onChange={set("email")} {...aria("email")} />{err("email")}</div>
            <div><label htmlFor="co-phone" className="field-label">Phone</label><input id="co-phone" type="tel" className="field" autoComplete="tel" placeholder={country.phoneHint} value={c.phone} onChange={set("phone")} {...aria("phone")} />{err("phone")}</div>
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-6 text-xl text-white">Delivery address</legend>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2"><label htmlFor="co-address1" className="field-label">Address</label><input id="co-address1" className="field" autoComplete="address-line1" placeholder="Flat, building, street" value={c.address1} onChange={set("address1")} {...aria("address1")} />{err("address1")}</div>
            <div className="sm:col-span-2"><label htmlFor="co-address2" className="field-label">Area or landmark <span className="text-muted">(optional)</span></label><input id="co-address2" className="field" autoComplete="address-line2" value={c.address2} onChange={set("address2")} /></div>
            <div><label htmlFor="co-city" className="field-label">City</label><input id="co-city" className="field" autoComplete="address-level2" value={c.city} onChange={set("city")} {...aria("city")} />{err("city")}</div>
            <div>
              <label htmlFor="co-state" className="field-label">{country.regionLabel}</label>
              <select id="co-state" className="field" autoComplete="address-level1" value={c.state} onChange={set("state")} {...aria("state")}>
                <option value="">Select</option>
                {country.regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>{err("state")}
            </div>
            <div><label htmlFor="co-postalCode" className="field-label">{country.postalLabel}</label><input id="co-postalCode" className="field" inputMode="numeric" autoComplete="postal-code" value={c.postalCode} onChange={set("postalCode")} {...aria("postalCode")} />{err("postalCode")}</div>
            <div>
              <label htmlFor="co-country" className="field-label">Country</label>
              <select id="co-country" className="field" autoComplete="country" value={c.country} onChange={(e) => setC((p) => ({ ...p, country: e.target.value, state: "" }))} {...aria("country")}>
                {countries.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}
              </select>{err("country")}
            </div>
            <div className="sm:col-span-2"><label htmlFor="co-notes" className="field-label">Delivery notes <span className="text-muted">(optional)</span></label><textarea id="co-notes" rows={3} className="field" value={c.notes} onChange={set("notes")} /></div>
          </div>
        </fieldset>

        {commerce.shippingMethods.length > 0 && (
          <fieldset>
            <legend className="mb-6 text-xl text-white">Delivery method</legend>
            <div className="grid gap-3" id="co-shippingMethodId" tabIndex={-1}>
              {commerce.shippingMethods.map((m) => (
                <label key={m.id} className={`flex cursor-pointer items-start gap-4 rounded-sm border p-4 ${shippingMethodId === m.id ? "border-gold" : "border-line"}`}>
                  <input type="radio" name="shipping" value={m.id} checked={shippingMethodId === m.id} onChange={() => setShippingMethodId(m.id)} className="mt-1 accent-[#C5A15A]" />
                  <span className="flex-1"><span className="block text-white">{m.label}</span>{m.description && <span className="block text-sm text-muted">{m.description}</span>}</span>
                </label>
              ))}
            </div>{err("shippingMethodId")}
          </fieldset>
        )}

        <fieldset>
          <legend className="mb-6 text-xl text-white">Payment</legend>
          <div className={`rounded-sm border p-5 ${mode === "demo" ? "border-gold/60" : "border-line"}`}>
            <p className="flex items-center gap-2 text-white"><Lock className="h-4 w-4 text-champagne" strokeWidth={1.5} aria-hidden />{modeCopy[mode].title}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{modeCopy[mode].body}</p>
          </div>
          <label className="mt-6 flex items-start gap-3 text-sm text-muted">
            <input id="co-terms" type="checkbox" checked={acceptTerms} onChange={(e) => { setAcceptTerms(e.target.checked); setErrors((p) => ({ ...p, terms: undefined })); }} className="mt-0.5 h-4 w-4 accent-[#C5A15A]" {...aria("terms")} />
            <span>I accept the <Link href="/terms" className="underline underline-offset-2 hover:text-white">Terms and Conditions</Link> and have read the <Link href="/shipping-returns" className="underline underline-offset-2 hover:text-white">Shipping and Returns</Link> policy.</span>
          </label>{err("terms")}
        </fieldset>
      </div>

      <aside aria-labelledby="co-summary" className="lg:col-span-5 lg:col-start-8">
        <div className="bg-midnight p-6 sm:p-8 lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
          <h2 id="co-summary" className="text-lg text-white">Order summary</h2>
          <div className="mt-4">
            <OrderSummary
              lines={cart.lines.map((l) => ({ key: l.key, name: l.product.name, detail: l.variant?.name, quantity: l.quantity, lineTotalMinor: l.lineTotalMinor }))}
              totals={totals}
            />
          </div>
          <Button type="submit" size="lg" className="mt-8 w-full" disabled={busy} aria-busy={busy}>
            {status.kind === "submitting" ? "Placing order…" : status.kind === "paying" ? "Waiting for payment…" : modeCopy[mode].cta}
          </Button>
          <p className="mt-4 text-xs leading-relaxed text-muted">Prices are checked again on our server before any payment is requested.</p>
        </div>
      </aside>
    </form>
  );
}
