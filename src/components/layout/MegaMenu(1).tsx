import Link from "next/link";
import { categories, collections } from "@/data/categories";
import { products } from "@/data/products";
import { productsHref } from "@/config/site";
import { MediaImage } from "@/components/ui/MediaImage";
import { sortProducts } from "@/lib/catalogue";

export function MegaMenu({ id, open, onNavigate }: { id: string; open: boolean; onNavigate: () => void }) {
  const spotlight = sortProducts(products.filter((p) => p.featured), "featured")[0];
  return (
    <div
      id={id}
      className={`absolute inset-x-0 top-full border-y border-line bg-obsidian/[0.97] backdrop-blur-md transition-[opacity,transform] duration-300 ease-lux ${open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0"}`}
    >
      <div className="frame grid grid-cols-12 gap-10 py-12">
        <nav aria-label="Product categories" className="col-span-4">
          <p className="mb-5 text-sm text-muted">Categories</p>
          <ul className="grid gap-3">
            {categories.map((c) => (
              <li key={c.id}>
                <Link href={productsHref([c.id])} onClick={onNavigate} className="link-underline text-lg text-white hover:text-champagne">{c.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Collections" className="col-span-3">
          <p className="mb-5 text-sm text-muted">Collections</p>
          <ul className="grid gap-4">
            {collections.map((c) => (
              <li key={c.id}>
                <Link href={productsHref(c.categoryIds)} onClick={onNavigate} className="group block">
                  <span className="link-underline text-white group-hover:text-champagne">{c.name}</span>
                  <span className="mt-1 block text-sm text-muted">{c.description}</span>
                </Link>
              </li>
            ))}
            <li className="pt-2"><Link href="/products" onClick={onNavigate} className="link-underline text-champagne">View all products</Link></li>
          </ul>
        </nav>
        {spotlight && (
          <Link href={`/products/${spotlight.slug}`} onClick={onNavigate} className="group col-span-5 grid grid-cols-[1fr_1.1fr] items-end gap-6 bg-midnight">
            <div className="relative aspect-[4/5] overflow-hidden">
              <MediaImage image={spotlight.images[0]!} fill sizes="260px" className="object-cover transition-transform duration-700 ease-lux group-hover:scale-[1.03]" />
            </div>
            <div className="pb-6 pr-6">
              <p className="text-sm text-muted">In focus</p>
              <p className="display-md mt-2 text-white">{spotlight.name}</p>
              <p className="mt-3 text-sm text-muted">{spotlight.shortDescription}</p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
}
