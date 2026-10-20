import Link from "next/link";
import { categories } from "@/data/categories";
import { productsHref } from "@/config/site";
import { homeContent } from "@/content/home";
import { MediaImage } from "@/components/ui/MediaImage";

/**
 * Three-column grid displaying the three main product categories.
 * Tiles are image-led with type set on the image.
 */
export function CategoryGrid() {
  return (
    <section aria-labelledby="categories-title" className="bg-obsidian py-24 sm:py-32">
      <div className="frame">
        <h2 id="categories-title" className="display-lg text-white">{homeContent.categories.heading}</h2>
        <p className="lede mt-5">{homeContent.categories.body}</p>
        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {categories.map((c) => (
            <CategoryTile key={c.id} category={c} />
          ))}
        </div>
      </div>
    </section>
  );
}

function CategoryTile({ category }: { category: (typeof categories)[number] }) {
  return (
    <Link href={productsHref([category.id])} className="group relative isolate block min-h-[16rem] overflow-hidden rounded-lg bg-midnight transition-transform duration-300 hover:shadow-lg">
      <MediaImage 
        image={category.image} 
        fill 
        sizes="(min-width: 768px) 33vw, 100vw" 
        className="-z-10 object-cover transition-transform duration-[1200ms] ease-lux group-hover:scale-[1.04]" 
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-obsidian/95 via-obsidian/40 to-transparent" />
      <div className="flex h-full flex-col justify-end p-6 sm:p-8">
        <h3 className="font-display text-2xl font-light text-white">{category.name}</h3>
        <p className="mt-2 max-w-xs text-sm text-soft/80">{category.description}</p>
        <span aria-hidden className="mt-5 block h-px w-10 bg-gold transition-[width] duration-500 ease-lux group-hover:w-16" />
      </div>
    </Link>
  );
}
