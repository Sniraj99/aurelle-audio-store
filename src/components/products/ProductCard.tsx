import Link from "next/link";
import type { Product } from "@/types/product";
import { getCategory } from "@/data/categories";
import { MediaImage } from "@/components/ui/MediaImage";
import { Price } from "@/components/ui/Price";
import { Availability } from "@/components/ui/Availability";
import { ProductCardActions } from "@/components/products/ProductActions";

export function ProductCard({ product, priority = false, sizes = "(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 100vw" }: { product: Product; priority?: boolean; sizes?: string }) {
  const category = getCategory(product.categoryId);
  const [primary, secondary] = product.images;
  return (
    <article className="group flex h-full flex-col">
      <Link href={`/products/${product.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-midnight" tabIndex={-1} aria-hidden>
        {primary && <MediaImage image={primary} fill priority={priority} sizes={sizes} className="object-cover transition-[transform,opacity] duration-[900ms] ease-lux group-hover:scale-[1.03]" />}
        {secondary && <MediaImage image={secondary} fill sizes={sizes} className="object-cover opacity-0 transition-opacity duration-700 ease-lux group-hover:opacity-100" />}
        {product.demo && <span className="absolute left-3 top-3 bg-obsidian/80 px-2 py-1 text-[0.7rem] text-muted">Demo</span>}
      </Link>
      <div className="flex flex-1 flex-col pt-5">
        {category && <p className="text-sm text-muted">{category.shortName}</p>}
        <h3 className="mt-1 text-xl text-white">
          <Link href={`/products/${product.slug}`} className="link-underline">{product.name}</Link>
        </h3>
        <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{product.shortDescription}</p>
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <Price product={product} from className="text-white" />
          <Availability product={product} />
        </div>
        <div className="mt-5 flex flex-col gap-2 pt-1 sm:mt-auto sm:flex-row sm:items-center sm:gap-6 sm:pt-5">
          <ProductCardActions product={product} />
          <Link href={`/products/${product.slug}`} className="link-underline self-start py-2 text-sm text-soft hover:text-champagne sm:self-auto">
            View product<span className="sr-only">: {product.name}</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
