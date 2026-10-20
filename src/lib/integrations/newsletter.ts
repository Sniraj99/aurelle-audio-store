import "server-only";
import { serverEnv, isNewsletterConfigured } from "@/lib/env";

/** Adds a contact to a Brevo list. Swap this function to use a different provider. */
export async function subscribe(email: string): Promise<"subscribed" | "not_configured"> {
  if (!isNewsletterConfigured()) return "not_configured";
  const res = await fetch("https://api.brevo.com/v3/contacts", {
    method: "POST",
    headers: { "api-key": serverEnv.brevoApiKey, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email, listIds: [Number(serverEnv.brevoListId)], updateEnabled: true }),
    cache: "no-store",
  });
  // 201 created, 204 updated existing contact.
  if (!res.ok) throw new Error(`Newsletter provider error (${res.status})`);
  return "subscribed";
}
