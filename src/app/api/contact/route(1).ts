import { brand } from "@/config/brand";
import { enquiryTypes, validateContact } from "@/lib/validation";
import { json, limitOrNull, readJson, sameOrigin } from "@/lib/http";
import { sendEmail } from "@/lib/integrations/email";
import { isEmailConfigured, serverEnv } from "@/lib/env";

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "forbidden", message: "Request blocked." }, 403);
  const limited = limitOrNull(req, "contact", 5, 10 * 60_000);
  if (limited) return limited;

  const body = await readJson(req);
  if (!body) return json({ error: "bad_request", message: "The form could not be read. Refresh and try again." }, 400);
  // Honeypot: real visitors never fill this hidden field. Respond as a generic failure.
  if (typeof body.company === "string" && body.company.trim()) return json({ error: "rejected", message: "Your message could not be sent." }, 400);

  const result = validateContact(body);
  if (!result.ok) return json({ error: "invalid", message: "Check the highlighted fields.", fieldErrors: result.errors }, 422);

  if (!isEmailConfigured()) {
    return json({ error: "not_configured", message: "Online enquiries are not connected yet, so your message was not sent." }, 503);
  }

  const d = result.data;
  const type = enquiryTypes.find((t) => t.value === d.enquiryType)?.label ?? d.enquiryType;
  try {
    await sendEmail({
      to: serverEnv.enquiryInbox,
      replyTo: d.email,
      subject: `[${brand.name}] ${type}${d.product ? `: ${d.product}` : ""} from ${d.name}`,
      text: [`Name: ${d.name}`, `Email: ${d.email}`, `Phone: ${d.phone || "-"}`, `Type: ${type}`, `Product: ${d.product || "-"}`, "", d.message].join("\n"),
    });
    return json({ ok: true, message: "Thank you. Your message has been sent and we'll reply by email." });
  } catch (e) {
    console.error("contact:send", e);
    return json({ error: "send_failed", message: "Your message could not be sent. Try again in a few minutes." }, 502);
  }
}
