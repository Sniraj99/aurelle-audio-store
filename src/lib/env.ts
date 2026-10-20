/**
 * Server-only environment access. Never import this file from a client component.
 * Secrets are read lazily so missing values degrade to clearly labelled modes.
 */
import "server-only";

export type PaymentMode = "demo" | "razorpay" | "manual";

export const serverEnv = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  paymentProvider: (process.env.PAYMENT_PROVIDER ?? "demo").toLowerCase(),
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? "",
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  emailFrom: process.env.EMAIL_FROM ?? "",
  enquiryInbox: process.env.ENQUIRY_INBOX ?? "",
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
  brevoListId: process.env.BREVO_LIST_ID ?? "",
};

export function isDatabaseConfigured(): boolean {
  return Boolean(serverEnv.databaseUrl);
}

/**
 * Resolves the active payment mode. Live modes require a database, because an
 * order that cannot be recorded must never be charged.
 */
export function paymentMode(): PaymentMode {
  const p = serverEnv.paymentProvider;
  if (p === "razorpay" && serverEnv.razorpayKeyId && serverEnv.razorpayKeySecret && isDatabaseConfigured()) return "razorpay";
  if (p === "manual" && isDatabaseConfigured()) return "manual";
  return "demo";
}

export function isEmailConfigured(): boolean {
  return Boolean(serverEnv.resendApiKey && serverEnv.emailFrom && serverEnv.enquiryInbox);
}

export function isNewsletterConfigured(): boolean {
  return Boolean(serverEnv.brevoApiKey && serverEnv.brevoListId);
}
