/**
 * Product data model. Prices are stored in MINOR units (paise for INR) as integers
 * so totals never suffer from floating-point rounding.
 */
export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | "AED";

/** Shown to customers only when set on the product or variant. */
export type AvailabilityStatus = "in_stock" | "made_to_order" | "preorder" | "unavailable";

/** "purchase" products can be bought online; "enquiry" products route to the contact form. */
export type PurchaseMode = "purchase" | "enquiry";

export type CategoryId =
  | "ceiling-speakers"
  | "bookshelf"
  | "soundbars";

export type UseCase = "music" | "film" | "outdoor" | "studio" | "events" | "architectural";

export interface ProductImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export interface ProductVariant {
  id: string;
  name: string;
  kind: "finish" | "configuration";
  /** CSS colour for a finish swatch. */
  swatch?: string;
  sku?: string;
  /** Overrides the product price when set. */
  priceMinor?: number;
  salePriceMinor?: number;
  availability?: AvailabilityStatus;
  /** Units available. Used for server-side validation only; never shown as an urgency message. */
  stock?: number;
}

export interface SpecItem {
  label: string;
  value: string;
}

export interface SpecGroup {
  title: string;
  items: SpecItem[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  categoryId: CategoryId;
  brand?: string;
  sku?: string;
  shortDescription: string;
  /** Paragraphs for the detailed description. */
  description: string[];
  images: ProductImage[];
  currency: CurrencyCode;
  priceMinor?: number;
  /** Only set for a genuine, approved sale. */
  salePriceMinor?: number;
  purchaseMode: PurchaseMode;
  availability?: AvailabilityStatus;
  stock?: number;
  variants?: ProductVariant[];
  specifications?: SpecGroup[];
  connectivity?: string[];
  useCases?: UseCase[];
  dimensions?: string;
  weight?: string;
  inTheBox?: string[];
  /** Short factual component notes used by the "Design and technology" section. */
  components?: SpecItem[];
  featured?: boolean;
  featuredRank?: number;
  /** ISO date. Enables "Newest" sorting only when every listed product has one. */
  createdAt?: string;
  seo?: { title?: string; description?: string };
  /**
   * TRUE for demonstration content. Demo products show a visible notice and are
   * excluded from structured data. Set to false only for genuine, verified products.
   */
  demo: boolean;
}

export interface Category {
  id: CategoryId;
  name: string;
  shortName: string;
  description: string;
  image: ProductImage;
}

/** A merchandising group of categories, e.g. "Home Theatre" = home-theatre + subwoofers. */
export interface Collection {
  id: string;
  name: string;
  description: string;
  categoryIds: CategoryId[];
  image: ProductImage;
}
