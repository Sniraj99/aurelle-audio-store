import type { Metadata } from "next";
import { brand, siteUrl } from "@/config/brand";

export function pageMetadata({ title, description, path, image }: { title: string; description: string; path: string; image?: string }): Metadata {
  const url = `${siteUrl}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} | ${brand.name}`,
      description,
      url,
      siteName: brand.name,
      type: "website",
      locale: "en_IN",
      ...(image && { images: [{ url: image }] }),
    },
    twitter: { card: "summary_large_image", title: `${title} | ${brand.name}`, description },
  };
}
