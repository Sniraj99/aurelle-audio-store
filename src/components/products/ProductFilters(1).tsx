"use client";
import type { CatalogueQuery, Facets } from "@/lib/catalogue";

type Update = (patch: Partial<CatalogueQuery>) => void;

function toggle<T>(list: T[], v: T): T[] {
  return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line py-6 first:border-t-0 first:pt-0">
      <legend className="mb-4 text-sm font-medium text-white">{title}</legend>
      {children}
    </fieldset>
  );
}

function Check({ label, checked, onChange, count }: { label: string; checked: boolean; onChange: () => void; count?: number }) {
  return (
    <label className="flex min-h-9 cursor-pointer items-center gap-3 text-[0.95rem] text-soft hover:text-white">
      <input type="checkbox" checked={checked} onChange={onChange} className="h-4 w-4 shrink-0 accent-[#C5A15A]" />
      <span className="flex-1">{label}</span>
      {count !== undefined && <span className="text-sm text-muted">{count}</span>}
    </label>
  );
}

export function ProductFilters({ query, facets, update }: { query: CatalogueQuery; facets: Facets; update: Update }) {
  return (
    <div>
      <Group title="Category">
        {facets.categories.map((c) => (
          <Check key={c.id} label={c.label} count={c.count} checked={query.categories.includes(c.id)} onChange={() => update({ categories: toggle(query.categories, c.id) })} />
        ))}
      </Group>



      {facets.brands.length > 1 && (
        <Group title="Brand">
          {facets.brands.map((b) => <Check key={b} label={b} checked={query.brands.includes(b)} onChange={() => update({ brands: toggle(query.brands, b) })} />)}
        </Group>
      )}






    </div>
  );
}
