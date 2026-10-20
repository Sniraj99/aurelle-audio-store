/**
 * Single source of truth for brand identity.
 * "Aurelle" is PROVISIONAL. Changing `name` and `wordmark` here updates the
 * header, footer, metadata, emails, and legal pages.
 */
export const brand = {
  name: "Aurelle",
  /** Replace with the registered company name once incorporated. */
  legalName: "Aurelle",
  wordmark: "AURELLE",
  tagline: "Premium Audio Solutions",
  description:
    "Premium ceiling speakers, bookshelf speakers, and soundbars for immersive audio experiences.",
  footerStatement:
    "Curated selection of premium audio speakers for homes, offices, and entertainment spaces.",
  provisional: true,
  copyrightStartYear: 2026,
} as const;

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
