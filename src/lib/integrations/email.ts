import "server-only";
import { serverEnv, isEmailConfigured } from "@/lib/env";

/** Sends a transactional email through Resend's REST API. Returns false when not configured. */
export async function sendEmail(msg: { to: string; subject: string; text: string; replyTo?: string }): Promise<boolean> {
  if (!isEmailConfigured()) return false;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${serverEnv.resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: serverEnv.emailFrom, to: [msg.to], subject: msg.subject, text: msg.text, reply_to: msg.replyTo }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Email provider error (${res.status})`);
  return true;
}
