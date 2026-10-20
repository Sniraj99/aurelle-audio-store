import type { CategoryId, Product, UseCase } from "@/types/product";
import { categories, isCategoryId } from "@/data/categories";
import { availabilityOf, fromPrice } from "@/lib/product-rules";

export type SortKey = "featured" | "name" | "price-asc" | "price-desc" | "newest";
export type AvailabilityFilter = "purchase" | "enquiry" | "in_stock";

export interface CatalogueQuery {
  q: string;
  categories: CategoryId[];
  brands: string[];
  connectivity: string[];
  useCases: UseCase[];
  availability: AvailabilityFilter[];
  minPrice?: number; // whole currency units, as typed by customers
  maxPrice?: number;
  sort: SortKey;
}

export const emptyQuery: CatalogueQuery = {
  q: "", categories: [], brands: [], connectivity: [], useCases: [], availability: [], sort: "featured",
};

export const useCaseLabels: Record<UseCase, string> = {
  music: "Music listening",
  film: "Film and TV",
  outdoor: "Outdoors and travel",
  studio: "Studio and desk",
  events: "Events and venues",
  architectural: "Architectural",
};

export const availabilityFilterLabels: Record<AvailabilityFilter, string> = {
  purchase: "Buy online",
  enquiry: "By enquiry",
  in_stock: "In stock",
};

const normalise = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "");

function searchableText(p: Product): string {
  const cat = categories.find((c) => c.id === p.categoryId);
  return normalise([p.name, p.brand, p.shortDescription, cat?.name, ...(p.connectivity ?? []), ...(p.variants ?? []).map((v) => v.name)].filter(Boolean).join(" "));
}

export function matchesSearch(p: Product, q: string): boolean {
  const terms = normalise(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return true;
  const text = searchableText(p);
  return terms.every((t) => text.includes(t));
}

export function filterProducts(list: Product[], query: CatalogueQuery): Product[] {
  return list.filter((p) => {
    if (!matchesSearch(p, query.q)) return false;
    if (query.categories.length && !query.categories.includes(p.categoryId)) return false;
    if (query.brands.length && (!p.brand || !query.brands.includes(p.brand))) return false;
    if (query.connectivity.length && !query.connectivity.some((c) => p.connectivity?.includes(c))) return false;
    if (query.useCases.length && !query.useCases.some((u) => p.useCases?.includes(u))) return false;
    if (query.availability.length) {
      const ok = query.availability.some((a) => {
        if (a === "purchase") return p.purchaseMode === "purchase" && availabilityOf(p) !== "unavailable";
        if (a === "enquiry") return p.purchaseMode === "enquiry";
        return availabilityOf(p) === "in_stock";
      });
      if (!ok) return false;
    }
    if (query.minPrice !== undefined || query.maxPrice !== undefined) {
      const price = fromPrice(p);
      if (price === null) return false; // unpriced items are excluded from price-ranged results
      const major = price / 100;
      if (query.minPrice !== undefined && major < query.minPrice) return false;
      if (query.maxPrice !== undefined && major > query.maxPrice) return false;
    }
    return true;
  });
}

/** "Newest" is offered only when every product carries a genuine date. */
export function canSortByNewest(list: Product[]): boolean {
  return list.length > 0 && list.every((p) => Boolean(p.createdAt));
}

export function sortProducts(list: Product[], sort: SortKey): Product[] {
  const out = [...list];
  const byName = (a: Product, b: Product) => a.name.localeCompare(b.name);
  switch (sort) {
    case "name":
      return out.sort(byName);
    case "price-asc":
    case "price-desc": {
      const dir = sort === "price-asc" ? 1 : -1;
      return out.sort((a, b) => {
        const pa = fromPrice(a);
        const pb = fromPrice(b);
        if (pa === null && pb === null) return byName(a, b);
        if (pa === null) return 1; // unpriced always last
        if (pb === null) return -1;
        return (pa - pb) * dir || byName(a, b);
      });
    }
    case "newest":
      return canSortByNewest(out) ? out.sort((a, b) => Date.parse(b.createdAt!) - Date.parse(a.createdAt!)) : out;
    case "featured":
    default:
      return out.sort((a, b) => {
        const ra = a.featured ? (a.featuredRank ?? 999) : 10_000;
        const rb = b.featured ? (b.featuredRank ?? 999) : 10_000;
        return ra - rb;
      });
  }
}

export interface Facets {
  categories: { id: CategoryId; label: string; count: number }[];
  brands: string[];
  connectivity: string[];
  useCases: UseCase[];
  priceBounds: { min: number; max: number } | null; // whole units
  tracksAvailability: boolean;
  sortOptions: { value: SortKey; label: string }[];
}

export function buildFacets(list: Product[]): Facets {
  const uniq = <T,>(xs: T[]) => [...new Set(xs)];
  const prices = list.map(fromPrice).filter((p): p is number => p !== null);
  const sortOptions: Facets["sortOptions"] = [{ value: "featured", label: "Featured" }, { value: "name", label: "Name A–Z" }];
  if (prices.length) sortOptions.push({ value: "price-asc", label: "Price: low to high" }, { value: "price-desc", label: "Price: high to low" });
  if (canSortByNewest(list)) sortOptions.push({ value: "newest", label: "Newest" });
  return {
    categories: categories
      .map((c) => ({ id: c.id, label: c.shortName, count: list.filter((p) => p.categoryId === c.id).length }))
      .filter((c) => c.count > 0),
    brands: uniq(list.map((p) => p.brand).filter((b): b is string => Boolean(b))).sort(),
    connectivity: uniq(list.flatMap((p) => p.connectivity ?? [])).sort(),
    useCases: uniq(list.flatMap((p) => p.useCases ?? [])),
    priceBounds: prices.length ? { min: Math.floor(Math.min(...prices) / 100), max: Math.ceil(Math.max(...prices) / 100) } : null,
    tracksAvailability: list.some((p) => p.availability !== undefined),
    sortOptions,
  };
}

const list = (v: string | null | undefined) => (v ? v.split(",").map((s) => s.trim()).filter(Boolean) : []);
const num = (v: string | null | undefined) => {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};
const SORTS: SortKey[] = ["featured", "name", "price-asc", "price-desc", "newest"];
const AVAIL: AvailabilityFilter[] = ["purchase", "enquiry", "in_stock"];

type ParamSource = { get(name: string): string | null };

export function parseQuery(params: ParamSource): CatalogueQuery {
  const sort = params.get("sort");
  return {
    q: (params.get("q") ?? "").slice(0, 100),
    categories: list(params.get("category")).filter(isCategoryId),
    brands: list(params.get("brand")),
    connectivity: list(params.get("connectivity")),
    useCases: list(params.get("use")).filter((u): u is UseCase => u in useCaseLabels),
    availability: list(params.get("availability")).filter((a): a is AvailabilityFilter => AVAIL.includes(a as AvailabilityFilter)),
    minPrice: num(params.get("min")),
    maxPrice: num(params.get("max")),
    sort: SORTS.includes(sort as SortKey) ? (sort as SortKey) : "featured",
  };
}

export function serializeQuery(q: CatalogueQuery): string {
  const p = new URLSearchParams();
  if (q.q.trim()) p.set("q", q.q.trim());
  if (q.categories.length) p.set("category", q.categories.join(","));
  if (q.brands.length) p.set("brand", q.brands.join(","));
  if (q.connectivity.length) p.set("connectivity", q.connectivity.join(","));
  if (q.useCases.length) p.set("use", q.useCases.join(","));
  if (q.availability.length) p.set("availability", q.availability.join(","));
  if (q.minPrice !== undefined) p.set("min", String(q.minPrice));
  if (q.maxPrice !== undefined) p.set("max", String(q.maxPrice));
  if (q.sort !== "featured") p.set("sort", q.sort);
  return p.toString();
}

export function activeFilterCount(q: CatalogueQuery): number {
  return q.categories.length + q.brands.length + q.connectivity.length + q.useCases.length + q.availability.length +
    (q.minPrice !== undefined ? 1 : 0) + (q.maxPrice !== undefined ? 1 : 0) + (q.q.trim() ? 1 : 0);
}

export function relatedProducts(all: Product[], product: Product, limit = 3): Product[] {
  const others = all.filter((p) => p.id !== product.id);
  const score = (p: Product) =>
    (p.categoryId === product.categoryId ? 10 : 0) +
    (p.useCases ?? []).filter((u) => product.useCases?.includes(u)).length * 2 +
    (p.connectivity ?? []).filter((c) => product.connectivity?.includes(c)).length;
  return others.map((p) => ({ p, s: score(p) })).sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.p);
}
