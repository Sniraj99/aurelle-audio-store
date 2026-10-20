"use client";
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { products } from "@/data/products";
import { emptyQuery, filterProducts } from "@/lib/catalogue";
import { useDialog } from "@/components/ui/useDialog";
import { getCategory } from "@/data/categories";

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState("");
  const router = useRouter();
  const panelRef = useDialog(open, onClose);
  const results = useMemo(() => (q.trim().length > 1 ? filterProducts(products, { ...emptyQuery, q }).slice(0, 6) : []), [q]);

  const submit = (e?: { preventDefault(): void }) => {
    e?.preventDefault();
    onClose();
    router.push(q.trim() ? `/products?q=${encodeURIComponent(q.trim())}` : "/products");
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 bg-obsidian/80 backdrop-blur-sm animate-fade" onClick={onClose} />
      <div ref={panelRef} role="dialog" aria-modal="true" aria-label="Search products" tabIndex={-1} className="relative border-b border-line bg-midnight animate-fade">
        <div className="frame py-8 sm:py-12">
          <form role="search" onSubmit={submit} className="flex items-center gap-4 border-b border-soft/30 pb-4 focus-within:border-champagne">
            <Search className="h-5 w-5 shrink-0 text-muted" strokeWidth={1.25} aria-hidden />
            <label htmlFor="site-search" className="sr-only">Search products</label>
            <input
              id="site-search" data-autofocus type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder="Search speakers, categories, connectivity"
              autoComplete="off"
              className="min-w-0 flex-1 bg-transparent font-display text-2xl font-light text-white placeholder:text-muted/50 focus:outline-none sm:text-4xl"
            />
            <button type="button" onClick={onClose} className="grid h-11 w-11 place-items-center text-muted hover:text-white" aria-label="Close search"><X className="h-5 w-5" strokeWidth={1.25} /></button>
          </form>
          <div className="mt-6 min-h-[2rem]" aria-live="polite">
            {q.trim().length > 1 && results.length === 0 && <p className="text-muted">No products match “{q.trim()}”. Try "ceiling speakers", "bookshelf", or "soundbar".</p>}
            {results.length > 0 && (
              <ul className="grid gap-1 sm:grid-cols-2">
                {results.map((p) => (
                  <li key={p.id}>
                    <Link href={`/products/${p.slug}`} onClick={onClose} className="flex items-baseline justify-between gap-4 py-2 text-white hover:text-champagne">
                      <span>{p.name}</span>
                      <span className="text-sm text-muted">{getCategory(p.categoryId)?.shortName}</span>
                    </Link>
                  </li>
                ))}
                <li className="sm:col-span-2 pt-3"><button type="button" onClick={() => submit()} className="link-underline text-sm text-champagne">See all results</button></li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
