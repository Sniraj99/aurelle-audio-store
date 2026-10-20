"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import { products } from "@/data/products";
import { contact, whatsappLink } from "@/config/contact";
import { enquiryTypes, validateContact, type ContactInput } from "@/lib/validation";
import { Button } from "@/components/ui/Button";

type Key = keyof ContactInput;
type Status =
  | { kind: "idle" | "submitting" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }
  | { kind: "unavailable"; message: string };

export function ContactForm({ initialProduct = "", initialType = "" }: { initialProduct?: string; initialType?: string }) {
  const [v, setV] = useState({
    name: "", email: "", phone: "",
    enquiryType: enquiryTypes.some((t) => t.value === initialType) ? initialType : initialProduct ? "product" : "",
    product: initialProduct,
    message: initialProduct ? `I'd like to know more about ${initialProduct}.` : "",
    consent: false,
  });
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const statusRef = useRef<HTMLDivElement>(null);
  const order: Key[] = ["name", "email", "phone", "enquiryType", "message", "consent"];

  const set = (k: Key) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value;
    setV((p) => ({ ...p, [k]: value }));
    if (errors[k]) setErrors((p) => ({ ...p, [k]: undefined }));
  };

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (status.kind === "submitting") return;
    const r = validateContact(v);
    if (!r.ok) {
      setErrors(r.errors);
      const first = order.find((k) => r.errors[k]);
      if (first) document.getElementById(`cf-${first}`)?.focus();
      return;
    }
    setStatus({ kind: "submitting" });
    const company = (new FormData(e.currentTarget).get("company") as string) ?? "";
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...v, company }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setStatus({ kind: "success", message: data.message });
      else if (res.status === 503) setStatus({ kind: "unavailable", message: data.message });
      else {
        if (data.fieldErrors) setErrors(data.fieldErrors);
        setStatus({ kind: "error", message: data.message ?? "Your message could not be sent." });
      }
    } catch {
      setStatus({ kind: "error", message: "We couldn't reach the server. Check your connection and try again. Your message has not been sent." });
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  }

  if (status.kind === "success") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border-t border-line pt-10">
        <p className="display-md text-white">Message sent.</p>
        <p className="mt-4 text-muted">{status.message}</p>
        <Link href="/products" className="link-underline mt-8 inline-block text-champagne">Back to the collection</Link>
      </div>
    );
  }

  const mailto = contact.email ? `mailto:${contact.email}?subject=${encodeURIComponent(`Enquiry${v.product ? `: ${v.product}` : ""}`)}&body=${encodeURIComponent(v.message)}` : null;
  const wa = whatsappLink(v.message || undefined);
  const err = (k: Key) => errors[k] ? <p id={`cf-${k}-error`} className="field-error">{errors[k]}</p> : null;
  const aria = (k: Key) => ({ "aria-invalid": Boolean(errors[k]) || undefined, "aria-describedby": errors[k] ? `cf-${k}-error` : undefined });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-6">
      {(status.kind === "error" || status.kind === "unavailable") && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="border-l border-gold py-2 pl-4">
          <p className="text-white">{status.message}</p>
          {status.kind === "unavailable" && (mailto || wa) && (
            <p className="mt-2 text-sm text-muted">
              You can reach us directly instead:{" "}
              {mailto && <a href={mailto} className="link-underline text-champagne">send by email</a>}
              {mailto && wa && " or "}
              {wa && <a href={wa} target="_blank" rel="noopener noreferrer" className="link-underline text-champagne">message on WhatsApp</a>}.
            </p>
          )}
        </div>
      )}
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2"><label htmlFor="cf-name" className="field-label">Full name</label><input id="cf-name" className="field" autoComplete="name" value={v.name} onChange={set("name")} {...aria("name")} />{err("name")}</div>
        <div><label htmlFor="cf-email" className="field-label">Email</label><input id="cf-email" type="email" className="field" autoComplete="email" value={v.email} onChange={set("email")} {...aria("email")} />{err("email")}</div>
        <div><label htmlFor="cf-phone" className="field-label">Phone <span className="text-muted">(optional)</span></label><input id="cf-phone" type="tel" className="field" autoComplete="tel" value={v.phone} onChange={set("phone")} {...aria("phone")} />{err("phone")}</div>
        <div>
          <label htmlFor="cf-enquiryType" className="field-label">Enquiry type</label>
          <select id="cf-enquiryType" className="field" value={v.enquiryType} onChange={set("enquiryType")} {...aria("enquiryType")}>
            <option value="">Select</option>
            {enquiryTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>{err("enquiryType")}
        </div>
        <div>
          <label htmlFor="cf-product" className="field-label">Product of interest <span className="text-muted">(optional)</span></label>
          <select id="cf-product" className="field" value={v.product} onChange={set("product")}>
            <option value="">Not sure yet</option>
            {products.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
          </select>
        </div>
        <div className="sm:col-span-2"><label htmlFor="cf-message" className="field-label">Message</label><textarea id="cf-message" rows={6} className="field" placeholder="Tell us about your room, how you listen, or what you'd like to know." value={v.message} onChange={set("message")} {...aria("message")} />{err("message")}</div>
      </div>
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="flex items-start gap-3 text-sm text-muted">
        <input id="cf-consent" type="checkbox" checked={v.consent} onChange={set("consent")} className="mt-0.5 h-4 w-4 shrink-0 accent-[#C5A15A]" {...aria("consent")} />
        <span>You may use these details to reply to my enquiry, as described in the <Link href="/privacy" className="underline underline-offset-2 hover:text-white">Privacy Policy</Link>.</span>
      </label>{err("consent")}
      <div><Button type="submit" size="lg" disabled={status.kind === "submitting"} aria-busy={status.kind === "submitting"}>{status.kind === "submitting" ? "Sending…" : "Send message"}</Button></div>
    </form>
  );
}
