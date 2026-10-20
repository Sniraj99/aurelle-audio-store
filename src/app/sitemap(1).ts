import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/brand";
import { products } from "@/data/products";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/about", "/products", "/contact", "/privacy", "/terms", "/shipping-returns"].map((p) => ({
    url: `${siteUrl}${p}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
  // Demo products are noindexed, so they're left out of the sitemap.
  const productPages = products.filter((p) => !p.demo).map((p) => ({ url: `${siteUrl}/products/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.8 }));
  return [...pages, ...productPages];
}
