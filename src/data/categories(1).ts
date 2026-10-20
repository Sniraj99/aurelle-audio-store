import type { Category, CategoryId, Collection, ProductImage } from "@/types/product";

const img = (file: string, alt: string): ProductImage => ({ src: `/media/demo/${file}`, alt, width: 1200, height: 1500 });

/** Product categories. Focused on three premium audio categories. */
export const categories: Category[] = [
  { id: "ceiling-speakers", name: "Ceiling Speakers", shortName: "Ceiling Speakers", description: "Seamless design. Immersive sound. Perfectly integrated into your space.", image: img("collection-install.svg", "In-ceiling speaker set into a plaster ceiling") },
  { id: "bookshelf", name: "Bookshelf Speakers", shortName: "Bookshelf", description: "Compact design with detailed, room-filling audio.", image: img("collection-home.svg", "Bookshelf speaker on a low console") },
  { id: "soundbars", name: "Soundbars", shortName: "Soundbars", description: "Bring cinematic sound and clarity to your everyday entertainment.", image: img("collection-theatre.svg", "Soundbar below a dark screen") },
];

/** Merchandising groups used on the homepage and in the mega-menu. */
export const collections: Collection[] = [
  { id: "all-products", name: "All Products", description: "Browse our complete collection of premium audio.", categoryIds: ["ceiling-speakers", "bookshelf", "soundbars"], image: img("collection-home.svg", "Premium speakers in a modern space") },
];

export function getCategory(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function isCategoryId(id: string): id is CategoryId {
  return categories.some((c) => c.id === id);
}
