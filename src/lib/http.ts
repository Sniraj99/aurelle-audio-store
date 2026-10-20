import { NextResponse } from "next/server";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export function json(data: unknown, status = 200, headers?: HeadersInit) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });
}

/** Returns a 429 response when the caller exceeds the limit, otherwise null. */
export function limitOrNull(req: Request, bucket: string, limit: number, windowMs: number) {
  const r = rateLimit(`${bucket}:${clientIp(req.headers)}`, limit, windowMs);
  return r.ok ? null : json({ error: "rate_limited", message: "Too many attempts. Wait a moment and try again." }, 429, { "Retry-After": String(r.retryAfterSec) });
}

export async function readJson(req: Request, maxBytes = 32_000): Promise<Record<string, unknown> | null> {
  const text = await req.text();
  if (text.length > maxBytes) return null;
  try {
    const v = JSON.parse(text);
    return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

/** Rejects cross-site form posts. */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return true; // non-browser clients; rate limiting still applies
  try {
    const originHost = new URL(origin).host;
    const hosts = [req.headers.get("x-forwarded-host"), req.headers.get("host"), new URL(req.url).host];
    if (process.env.NEXT_PUBLIC_SITE_URL) hosts.push(new URL(process.env.NEXT_PUBLIC_SITE_URL).host);
    return hosts.some((h) => h === originHost);
  } catch {
    return false;
  }
}
