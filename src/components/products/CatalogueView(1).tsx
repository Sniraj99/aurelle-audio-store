"use client";
import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { SlidersHorizontal, Search, X } from "lucide-react";
import { products } from "@/data/products";
import { categories } from "@/data/categories";
import {
  activeFilterCount, buildFacets, emptyQuery, filterProducts, serializeQuery, sortProducts, type CatalogueQuery, type SortKey,
} from "@/lib/catalogue";
import { ProductFilters } from "@/components/products/ProductFilters";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { useDialog } from "@/components/ui/useDialog";

export function CatalogueView({ initialQuery }: { initialQuery: CatalogueQuery }) {
  const [query, setQuery] = useState<CatalogueQuery>(initialQuery);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);
  const drawerRef = useDialog(drawerOpen, closeDrawer);
  const deferred = useDeferredValue(query);
  const facets = useMemo(() => buildFacets(products), []);

  const results = useMemo(() => sortProducts(filterProducts(products, deferred), deferred.sort), [deferred]);
  const active = activeFilterCount(query);

  // A real navigation (e.g. a header link to /products) delivers a fresh server query: adopt it.
  useEffect(() => { setQuery(initialQuery); }, [initialQuery]);

  // Mirror state in the URL without a server round-trip, so results are shareable.
  useEffect(() => {
    const qs = serializeQuery(query);
    const url = `${window.location.pathname}${qs ? `?${qs}` : ""}`;
    if (url !== `${window.location.pathname}${window.location.search}`) window.history.replaceState(window.history.state, "", url);
  }, [query]);

  const update = useCallback((patch: Partial<CatalogueQuery>) => setQuery((q) => ({ ...q, ...patch })), []);
  const reset = () => setQuery({ ...emptyQuery, sort: query.sort });
  const singleCategory = query.categories.length === 1 ? query.categories[0] : null;

  return (
    <div className="frame pb-24 sm:pb-32">
      {/* Category navigation */}
      <nav aria-label="Product categories" className="-mx-5 overflow-x-auto px-5 scrollbar-none sm:mx-0 sm:px-0">
        <ul className="flex min-w-max gap-2 border-b border-line">
          <li>
            <button type="button" onClick={() => update({ categories: [] })} aria-pressed={!query.categories.length} className={`-mb-px border-b px-1 pb-4 pr-5 text-[0.95rem] transition-colors ${!query.categories.length ? "border-gold text-white" : "border-transparent text-muted hover:text-white"}`}>All</button>
          </li>
          {categories.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => update({ categories: [c.id] })} aria-pressed={singleCategory === c.id} className={`-mb-px border-b px-1 pb-4 pr-5 text-[0.95rem] transition-colors ${singleCategory === c.id ? "border-gold text-white" : "border-transparent text-muted hover:text-white"}`}>{c.shortName}</button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Toolbar */}
      <div className="flex flex-col gap-4 py-8 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <label htmlFor="catalogue-search" className="sr-only">Search the catalogue</label>
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" strokeWidth={1.5} aria-hidden />
          <input id="catalogue-search" type="search" value={query.q} onChange={(e) => update({ q: e.target.value })} placeholder="Search products" className="field pl-11" />
        </div>
        <div className="flex items-center justify-between gap-4 md:justify-end">
          <p className="text-sm text-muted" aria-live="polite" aria-atomic="true">{results.length} {results.length === 1 ? "product" : "products"}</p>
          <div className="flex items-center gap-3">
            <label htmlFor="catalogue-sort" className="sr-only">Sort by</label>
            <select id="catalogue-sort" value={query.sort} onChange={(e) => update({ sort: e.target.value as SortKey })} className="field !w-auto !py-2.5">
              {facets.sortOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button type="button" onClick={() => setDrawerOpen(true)} className="inline-flex h-11 items-center gap-2 rounded-sm border border-line px-4 text-sm text-soft hover:border-champagne lg:hidden" aria-haspopup="dialog">
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.5} aria-hidden /> Filters{active > 0 && <span className="text-champagne">({active})</span>}
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-12 lg:grid-cols-[15rem_1fr] xl:grid-cols-[17rem_1fr]">
        <aside aria-label="Filters" className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-h)+2rem)]">
            <ProductFilters query={query} facets={facets} update={update} idPrefix="desk" />
            {active > 0 && <button type="button" onClick={reset} className="link-underline mt-2 text-sm text-champagne">Clear all filters</button>}
          </div>
        </aside>

        <section aria-label="Results">
          {results.length > 0 ? (
            <ul className="grid gap-x-6 gap-y-16 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p, i) => <li key={p.id}><ProductCard product={p} priority={i < 3} /></li>)}
            </ul>
          ) : (
            <div className="flex flex-col items-start gap-5 border-t border-line py-20">
              <p className="display-md text-white">No products match these filters.</p>
              <p className="max-w-md text-muted">Remove a filter or search for a broader term. You can also ask us directly; some products are available by enquiry only.</p>
              <Button onClick={reset}>Clear all filters</Button>
            </div>
          )}
        </section>
      </div>

      {/* Mobile filter drawer */}
      <div className={`fixed inset-0 z-[65] lg:hidden ${drawerOpen ? "" : "pointer-events-none"}`} aria-hidden={!drawerOpen}>
        <div className={`absolute inset-0 bg-obsidian/70 transition-opacity duration-500 ${drawerOpen ? "opacity-100" : "opacity-0"}`} onClick={closeDrawer} />
        <div ref={drawerRef} role="dialog" aria-modal="true" aria-label="Filters" tabIndex={-1} inert={!drawerOpen}
          className={`absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-md border-t border-line bg-midnight transition-transform duration-500 ease-lux ${drawerOpen ? "translate-y-0" : "translate-y-full"}`}>
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="text-lg text-white">Filters</h2>
            <button type="button" onClick={closeDrawer} aria-label="Close filters" className="grid h-11 w-11 place-items-center text-muted hover:text-white"><X className="h-5 w-5" strokeWidth={1.25} /></button>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-6">
            <ProductFilters query={query} facets={facets} update={update} idPrefix="mobile" />
          </div>
          <div className="grid grid-cols-2 gap-3 border-t border-line px-5 py-4">
            <Button variant="secondary" onClick={reset} disabled={!active}>Clear all</Button>
            <Button onClick={closeDrawer}>Show {results.length}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
