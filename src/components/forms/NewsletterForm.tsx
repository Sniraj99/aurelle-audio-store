"use client";
import { useId, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { isEmail } from "@/lib/validation";

type State = { kind: "idle" | "submitting" } | { kind: "success" | "error" | "unavailable"; message: string };

export function NewsletterForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!isEmail(email.trim())) return setFieldError("Enter a valid email address.");
    if (!consent) return setFieldError("Tick the box to agree to receive emails.");
    setFieldError(null);
    setState({ kind: "submitting" });
    const website = (new FormData(e.currentTarget).get("website") as string) ?? "";
    try {
      const res = await fetch("/api/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, consent, website }) });
      const data = await res.json().catch(() => ({}));
      if (res.ok) { setState({ kind: "success", message: data.message }); setEmail(""); setConsent(false); }
      else setState({ kind: res.status === 503 ? "unavailable" : "error", message: data.message ?? "Sign-up failed. Try again later." });
    } catch {
      setState({ kind: "error", message: "Check your connection and try again." });
    }
  }

  return (
    <form onSubmit={onSubmit} noValidate className="w-full max-w-md">
      <label htmlFor={`${id}-email`} className="mb-3 block text-white">New arrivals and listening notes, occasionally.</label>
      <div className="flex border-b border-soft/30 focus-within:border-champagne">
        <input
          id={`${id}-email`} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email address" aria-invalid={Boolean(fieldError && !isEmail(email))} aria-describedby={`${id}-msg`}
          className="min-w-0 flex-1 bg-transparent py-3 text-white placeholder:text-muted/60 focus:outline-none"
        />
        <Button type="submit" variant="ghost" disabled={state.kind === "submitting"} className="!min-h-0 pl-4">{state.kind === "submitting" ? "Joining…" : "Subscribe"}</Button>
      </div>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <label className="mt-4 flex items-start gap-3 text-sm text-muted">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#C5A15A]" />
        <span>I agree to receive marketing emails and can unsubscribe at any time. See our <Link href="/privacy" className="underline underline-offset-2 hover:text-white">Privacy Policy</Link>.</span>
      </label>
      <p id={`${id}-msg`} role="status" aria-live="polite" className={`mt-3 min-h-5 text-sm ${state.kind === "success" ? "text-champagne" : "text-[#f0a597]"}`}>
        {fieldError ?? ("message" in state ? state.message : "")}
      </p>
    </form>
  );
}
