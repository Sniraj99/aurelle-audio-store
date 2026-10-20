import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { homeContent } from "@/content/home";
import { pageMetadata } from "@/lib/seo";
import { Hero } from "@/components/home/Hero";
import { BrandIntroduction } from "@/components/home/BrandIntroduction";
import { FeaturedCollection } from "@/components/home/FeaturedCollection";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { DesignTechnology } from "@/components/home/DesignTechnology";
import { LifestyleShowcase } from "@/components/home/LifestyleShowcase";
import { BrandValues } from "@/components/home/BrandValues";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = {
  ...pageMetadata({ title: brand.tagline, description: brand.description, path: "/" }),
  title: { absolute: `${brand.name} | ${brand.tagline}` },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandIntroduction />
      <FeaturedCollection />
      <CategoryGrid />
      <DesignTechnology />
      <LifestyleShowcase />
      <BrandValues />
      <FinalCta heading={homeContent.closing.heading} body={homeContent.closing.body} />
    </>
  );
}
