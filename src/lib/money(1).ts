import type { CurrencyCode } from "@/types/product";
import { commerce } from "@/config/commerce";

const formatters = new Map<string, Intl.NumberFormat>();

/** Formats an integer minor-unit amount, e.g. 18900000 INR → "₹1,89,000". */
export function formatMoney(minor: number, currency: CurrencyCode = commerce.currency, locale = commerce.locale): string {
  const whole = minor % 100 === 0;
  const key = `${locale}|${currency}|${whole}`;
  let fmt = formatters.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      minimumFractionDigits: whole ? 0 : 2,
      maximumFractionDigits: whole ? 0 : 2,
    });
    formatters.set(key, fmt);
  }
  return fmt.format(minor / 100);
}
