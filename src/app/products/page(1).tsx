import type { Metadata } from "next";
import { CatalogueView } from "@/components/products/CatalogueView";
import { parseQuery, serializeQuery } from "@/lib/catalogue";
import { pageMetadata } from "@/lib/seo";
import { getCategory } from "@/data/categories";

export const metadata: Metadata = pageMetadata({
  title: "Products",
  description: "Discover our premium collection of ceiling speakers, bookshelf speakers, and soundbars.",
  path: "/products",
});

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ProductsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) if (typeof v === "string") params.set(k, v);
  const query = parseQuery(params);
  const single = query.categories.length === 1 ? getCategory(query.categories[0]!) : undefined;
  return (
    <>
      <header className="frame pb-12 pt-16 sm:pb-16 sm:pt-24">
        <h1 className="display-xl text-white">{single ? single.name : "All Products"}</h1>
        <p className="lede mt-6">{single ? single.description : "Premium audio solutions for every space. Browse ceiling speakers, bookshelf speakers, and soundbars."}</p>
      </header>
      {/* Keyed on the server query so header/footer links into /products reset the view. */}
      <CatalogueView key={serializeQuery(query)} initialQuery={query} />
    </>
  );
}
