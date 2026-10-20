import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { products } from "@/data/products";
import { getCategory } from "@/data/categories";
import { brand, siteUrl } from "@/config/brand";
import { productsHref } from "@/config/site";
import { commerce } from "@/config/commerce";
import { pageMetadata } from "@/lib/seo";
import { relatedProducts } from "@/lib/catalogue";
import { availabilityOf, fromPrice } from "@/lib/product-rules";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductPurchasePanel } from "@/components/products/ProductPurchasePanel";
import { ProductSpecs } from "@/components/products/ProductSpecs";
import { ProductCard } from "@/components/products/ProductCard";
import { DemoNotice } from "@/components/ui/DemoNotice";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}
export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = products.find((x) => x.slug === slug);
  if (!p) return {};
  const meta = pageMetadata({ title: p.seo?.title ?? p.name, description: p.seo?.description ?? p.shortDescription, path: `/products/${p.slug}`, image: p.images[0]?.src });
  return p.demo ? { ...meta, robots: { index: false, follow: true } } : meta;
}

/** Structured data only for genuine products (demo: false) and only with fields that exist. */
function productJsonLd(p: (typeof products)[number]) {
  if (p.demo) return null;
  const price = fromPrice(p);
  const status = availabilityOf(p);
  const schemaAvailability = status === "in_stock" ? "InStock" : status === "preorder" ? "PreOrder" : status === "made_to_order" ? "MadeToOrder" : status === "unavailable" ? "OutOfStock" : undefined;
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.shortDescription,
    image: p.images.map((i) => `${siteUrl}${i.src}`),
    ...(p.sku && { sku: p.sku }),
    ...(p.brand && { brand: { "@type": "Brand", name: p.brand } }),
    ...(price !== null && p.purchaseMode === "purchase" && {
      offers: {
        "@type": "Offer",
        url: `${siteUrl}/products/${p.slug}`,
        priceCurrency: p.currency,
        price: (price / 100).toFixed(2),
        ...(schemaAvailability && { availability: `https://schema.org/${schemaAvailability}` }),
      },
    }),
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();
  const category = getCategory(product.categoryId);
  const related = relatedProducts(products, product, 3);
  const jsonLd = productJsonLd(product);

  return (
    <>
      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
      <div className="frame pt-8 sm:pt-12">
        <nav aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-2 text-sm text-muted">
            <li><Link href="/" className="hover:text-white">Home</Link></li>
            <li aria-hidden>/</li>
            <li><Link href="/products" className="hover:text-white">Products</Link></li>
            {category && (<><li aria-hidden>/</li><li><Link href={productsHref([category.id])} className="hover:text-white">{category.shortName}</Link></li></>)}
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-soft">{product.name}</li>
          </ol>
        </nav>
      </div>

      <section className="frame grid gap-12 py-10 lg:grid-cols-12 lg:gap-16 lg:py-16">
        <div className="lg:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+2rem)]">
            {category && <p className="text-sm text-muted">{category.name}{product.brand && product.brand !== brand.name ? `, by ${product.brand}` : ""}</p>}
            <h1 className="display-lg mt-3 text-white">{product.name}</h1>
            <p className="mt-5 text-lg leading-relaxed text-muted">{product.shortDescription}</p>
            {product.demo && <DemoNotice className="mt-6" />}
            <div className="mt-10 border-t border-line pt-10">
              <ProductPurchasePanel product={product} />
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-line bg-midnight py-20 sm:py-28">
        <div className="frame grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="display-md text-white">About {product.name}</h2>
            <div className="mt-8 grid gap-5 leading-relaxed text-muted">{product.description.map((p) => <p key={p}>{p}</p>)}</div>
            <div className="mt-12 border-t border-line pt-8">
              <h3 className="text-lg text-white">Delivery and returns</h3>
              <p className="mt-3 text-muted">
                {commerce.shippingMethods.length ? "Delivery options and costs are shown at checkout." : "Delivery is arranged after you order; we'll confirm timing and any cost before dispatch."}{" "}
                <Link href="/shipping-returns" className="link-underline text-champagne">Read our shipping and returns policy</Link>.
              </p>
            </div>
          </div>
          <div className="lg:col-span-6 lg:col-start-7">
            <h2 className="sr-only">Specifications</h2>
            <ProductSpecs product={product} />
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="py-20 sm:py-28">
          <div className="frame">
            <h2 id="related-title" className="display-md text-white">You may also consider</h2>
            <ul className="mt-12 grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => <li key={p.id}><ProductCard product={p} /></li>)}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
