import type { CategoryId } from "@/types/product";

/** Optional slim bar above the header. Set `enabled: false` to hide it. */
export const announcement = {
  enabled: true,
  message: "Introducing our first collection.",
  link: { label: "Explore the range", href: "/products" },
};

export const primaryNav = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Products", href: "/products", megaMenu: true },
  { label: "Contact Us", href: "/contact" },
] as const;

export const footerSupportLinks = [
  { label: "Contact and enquiries", href: "/contact" },
  { label: "Shipping and Returns", href: "/shipping-returns" },
  { label: "Shopping bag", href: "/cart" },
];

export const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms and Conditions", href: "/terms" },
  { label: "Shipping and Returns", href: "/shipping-returns" },
];

/** Customer accounts are out of scope for release one, so no account icon is rendered. */
export const features = {
  accounts: false,
  newsletter: true,
};

export function productsHref(categories: CategoryId[]): string {
  return `/products?category=${categories.join(",")}`;
}
