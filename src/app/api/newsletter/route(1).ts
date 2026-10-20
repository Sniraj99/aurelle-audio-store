import { validateNewsletter } from "@/lib/validation";
import { json, limitOrNull, readJson, sameOrigin } from "@/lib/http";
import { subscribe } from "@/lib/integrations/newsletter";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden", message: "Request blocked." }, 403);
  const limited = limitOrNull(req, "newsletter", 5, 10 * 60_000);
  if (limited) return limited;
  const body = await readJson(req, 4_000);
  if (!body) return json({ error: "bad_request", message: "Refresh and try again." }, 400);
  if (typeof body.website === "string" && body.website) return json({ error: "rejected", message: "Subscription failed." }, 400);
  const r = validateNewsletter(body);
  if (!r.ok) return json({ error: "invalid", message: Object.values(r.errors)[0], fieldErrors: r.errors }, 422);
  try {
    const status = await subscribe(r.data.email);
    if (status === "not_configured") {
      return json({ error: "not_configured", message: "Newsletter sign-up opens soon. Your email was not saved." }, 503);
    }
    return json({ ok: true, message: "You're subscribed. Check your inbox for updates from us." });
  } catch (e) {
    console.error("newsletter", e);
    return json({ error: "provider_error", message: "Sign-up failed. Try again later." }, 502);
  }
}
