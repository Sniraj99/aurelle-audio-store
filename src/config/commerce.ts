import type { CurrencyCode } from "@/types/product";
import { INDIAN_STATES } from "@/config/regions";

export interface ShippingMethod {
  id: string;
  label: string;
  description?: string;
  feeMinor: number;
  /** Free when the subtotal reaches this amount. */
  freeAboveMinor?: number;
}

export type TaxMode = "none" | "inclusive" | "exclusive";

export interface CountryConfig {
  code: string;
  name: string;
  postalLabel: string;
  postalPattern: RegExp;
  regionLabel: string;
  regions: string[];
  phonePattern: RegExp;
  phoneHint: string;
}

export const countries: CountryConfig[] = [
  {
    code: "IN",
    name: "India",
    postalLabel: "PIN code",
    postalPattern: /^[1-9][0-9]{5}$/,
    regionLabel: "State / Union Territory",
    regions: INDIAN_STATES,
    phonePattern: /^(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/,
    phoneHint: "10-digit mobile number",
  },
  // Add more countries here when you ship internationally.
];

export const commerce = {
  currency: "INR" as CurrencyCode,
  locale: "en-IN",
  defaultCountry: "IN",
  maxQuantityPerLine: 10,
  /**
   * Shipping methods offered at checkout. EMPTY by default: no rates or delivery
   * promises are invented. Example:
   * { id: "standard", label: "Standard delivery", feeMinor: 0, description: "Insured, tracked delivery" }
   */
  shippingMethods: [] as ShippingMethod[],
  /**
   * "none": no tax line is shown.
   * "inclusive": prices already include tax; the included amount is shown for reference.
   * "exclusive": tax is added at checkout.
   * Confirm GST treatment with your accountant before choosing.
   */
  tax: { mode: "none" as TaxMode, rate: 0, label: "GST" },
};

export function getCountry(code: string): CountryConfig | undefined {
  return countries.find((c) => c.code === code);
}
