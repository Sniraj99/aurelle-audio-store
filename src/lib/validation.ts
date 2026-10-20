/**
 * Dependency-free validators shared by client forms and API routes.
 * The server always re-validates; client checks are only for fast feedback.
 */
import { countries, getCountry } from "@/config/commerce";

export type FieldErrors<K extends string = string> = Partial<Record<K, string>>;
export type Result<T, K extends string = string> = { ok: true; data: T } | { ok: false; errors: FieldErrors<K> };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function str(v: unknown, max = 500): string {
  return typeof v === "string" ? v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max) : "";
}

export function isEmail(v: string): boolean {
  return v.length <= 254 && EMAIL.test(v);
}

export function isPhone(v: string, countryCode?: string): boolean {
  const country = countryCode ? getCountry(countryCode) : undefined;
  if (country) return country.phonePattern.test(v);
  return /^\+?[0-9\s-]{7,18}$/.test(v);
}

/* ── Contact ─────────────────────────────────────────────── */

export const enquiryTypes = [
  { value: "product", label: "Product enquiry" },
  { value: "order", label: "An existing order" },
  { value: "installation", label: "Installation or system design" },
  { value: "trade", label: "Trade and professional" },
  { value: "other", label: "Something else" },
] as const;
export type EnquiryType = (typeof enquiryTypes)[number]["value"];

export interface ContactInput {
  name: string;
  email: string;
  phone: string;
  enquiryType: EnquiryType;
  product: string;
  message: string;
  consent: boolean;
}
type ContactKey = keyof ContactInput;

export function validateContact(raw: Record<string, unknown>): Result<ContactInput, ContactKey> {
  const data: ContactInput = {
    name: str(raw.name, 120),
    email: str(raw.email, 254).toLowerCase(),
    phone: str(raw.phone, 30),
    enquiryType: (enquiryTypes.some((t) => t.value === raw.enquiryType) ? raw.enquiryType : "") as EnquiryType,
    product: str(raw.product, 160),
    message: str(raw.message, 4000),
    consent: raw.consent === true || raw.consent === "on" || raw.consent === "true",
  };
  const errors: FieldErrors<ContactKey> = {};
  if (data.name.length < 2) errors.name = "Enter your full name.";
  if (!isEmail(data.email)) errors.email = "Enter a valid email address, like name@example.com.";
  if (data.phone && !isPhone(data.phone)) errors.phone = "Enter a valid phone number, or leave this blank.";
  if (!data.enquiryType) errors.enquiryType = "Choose what your enquiry is about.";
  if (data.message.length < 10) errors.message = "Add a little more detail (at least 10 characters).";
  if (!data.consent) errors.consent = "Confirm that we may use these details to reply to you.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data };
}

/* ── Newsletter ─────────────────────────────────────────── */

export function validateNewsletter(raw: Record<string, unknown>): Result<{ email: string }, "email" | "consent"> {
  const email = str(raw.email, 254).toLowerCase();
  const consent = raw.consent === true || raw.consent === "on" || raw.consent === "true";
  const errors: FieldErrors<"email" | "consent"> = {};
  if (!isEmail(email)) errors.email = "Enter a valid email address.";
  if (!consent) errors.consent = "Tick the box to agree to receive emails.";
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data: { email } };
}

/* ── Checkout ───────────────────────────────────────────── */

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
}
export type CheckoutKey = keyof CheckoutCustomer | "shippingMethodId" | "items" | "terms";

export interface CheckoutItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface CheckoutInput {
  customer: CheckoutCustomer;
  items: CheckoutItemInput[];
  shippingMethodId?: string;
  idempotencyKey: string;
  acceptTerms: boolean;
}

export function validateCustomer(raw: Record<string, unknown>): Result<CheckoutCustomer, CheckoutKey> {
  const c: CheckoutCustomer = {
    name: str(raw.name, 120),
    email: str(raw.email, 254).toLowerCase(),
    phone: str(raw.phone, 30),
    address1: str(raw.address1, 200),
    address2: str(raw.address2, 200),
    city: str(raw.city, 100),
    state: str(raw.state, 100),
    postalCode: str(raw.postalCode, 20).replace(/\s+/g, ""),
    country: str(raw.country, 2).toUpperCase(),
    notes: str(raw.notes, 1000),
  };
  const errors: FieldErrors<CheckoutKey> = {};
  const country = getCountry(c.country);
  if (c.name.length < 2) errors.name = "Enter the recipient's full name.";
  if (!isEmail(c.email)) errors.email = "Enter a valid email address for your order updates.";
  if (!country) errors.country = `We currently deliver to ${countries.map((x) => x.name).join(", ")}.`;
  if (!isPhone(c.phone, country?.code)) errors.phone = country ? `Enter a valid ${country.phoneHint}.` : "Enter a valid phone number.";
  if (c.address1.length < 5) errors.address1 = "Enter the street address, building, and flat number.";
  if (c.city.length < 2) errors.city = "Enter the city.";
  if (country && country.regions.length && !country.regions.includes(c.state)) errors.state = `Choose a ${country.regionLabel.toLowerCase()}.`;
  if (country && !country.postalPattern.test(c.postalCode)) errors.postalCode = `Enter a valid ${country.postalLabel}.`;
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, data: c };
}

export function validateCheckout(raw: unknown): Result<CheckoutInput, CheckoutKey> {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const customer = validateCustomer((r.customer ?? {}) as Record<string, unknown>);
  const errors: FieldErrors<CheckoutKey> = customer.ok ? {} : { ...customer.errors };

  const itemsRaw = Array.isArray(r.items) ? r.items.slice(0, 50) : [];
  const items: CheckoutItemInput[] = [];
  for (const it of itemsRaw) {
    const o = (it ?? {}) as Record<string, unknown>;
    const quantity = Number(o.quantity);
    if (typeof o.productId !== "string" || !Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
      errors.items = "Your bag contains an invalid item. Refresh the page and try again.";
      break;
    }
    items.push({ productId: o.productId, variantId: typeof o.variantId === "string" && o.variantId ? o.variantId : undefined, quantity });
  }
  if (!items.length && !errors.items) errors.items = "Your bag is empty.";

  const idempotencyKey = str(r.idempotencyKey, 100);
  if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) errors.items = errors.items ?? "Refresh the page and try again.";
  const acceptTerms = r.acceptTerms === true;
  if (!acceptTerms) errors.terms = "Accept the Terms and Conditions to place your order.";

  if (Object.keys(errors).length || !customer.ok) return { ok: false, errors };
  return {
    ok: true,
    data: { customer: customer.data, items, shippingMethodId: str(r.shippingMethodId, 50) || undefined, idempotencyKey, acceptTerms },
  };
}
