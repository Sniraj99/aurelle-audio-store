import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/cart", "/checkout", "/order/"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
