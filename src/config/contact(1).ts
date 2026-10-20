/**
 * Business contact details. Leave a value empty and the UI hides it.
 * Nothing here is invented: fill these in with verified details before launch.
 */
export interface SocialLink {
  label: string;
  href: string;
}

export const contact = {
  email: "com",            // Update with full email address
  phone: "+91 87998 68778",            // display format
  phoneHref: "tel:+918799868778",        // for tel: links
  /** WhatsApp Business number in international format, digits only, e.g. "919800000000". */
  whatsappNumber: "918799868778",
  addressLines: [
    "1st Floor, Mauli Complex",
    "Besides Elite Fitness Gym",
    "Near Ch. Sambhaji Maharaj Square",
    "Walgaon Road",
    "Amravati - 444604"
  ] as string[],
  businessHours: [] as { days: string; hours: string }[],
  social: [] as SocialLink[], // e.g. [{ label: "Instagram", href: "https://instagram.com/..." }]
};

export function whatsappLink(message?: string): string | null {
  if (!contact.whatsappNumber) return null;
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${contact.whatsappNumber}${text}`;
}

export function hasDirectContact(): boolean {
  return Boolean(contact.email || contact.phone || contact.whatsappNumber);
}
