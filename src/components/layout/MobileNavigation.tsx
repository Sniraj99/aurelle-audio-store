"use client";
import Link from "next/link";
import { X } from "lucide-react";
import { primaryNav, productsHref } from "@/config/site";
import { collections } from "@/data/categories";
import { contact } from "@/config/contact";
import { useDialog } from "@/components/ui/useDialog";
import { Wordmark } from "@/components/layout/Wordmark";

export function MobileNavigation({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const panelRef = useDialog(open, onClose);
  return (
    <div className={`fixed inset-0 z-[65] lg:hidden ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-obsidian/70 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <div
        ref={panelRef} id="mobile-nav" role="dialog" aria-modal="true" aria-label="Menu" tabIndex={-1} inert={!open}
        className={`absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-obsidian transition-transform duration-500 ease-lux ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-[var(--header-h)] items-center justify-between border-b border-line px-5">
          <Wordmark />
          <button type="button" onClick={onClose} aria-label="Close menu" className="grid h-11 w-11 place-items-center text-muted hover:text-white"><X className="h-5 w-5" strokeWidth={1.25} /></button>
        </div>
        <nav aria-label="Main" className="flex-1 overflow-y-auto px-5 py-8">
          <ul className="grid gap-1">
            {primaryNav.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link href={item.href} onClick={onClose} aria-current={active ? "page" : undefined} className={`block py-2 font-display text-3xl font-light ${active ? "text-champagne" : "text-white"}`}>{item.label}</Link>
                </li>
              );
            })}
          </ul>
          <p className="mb-3 mt-10 text-sm text-muted">Shop by collection</p>
          <ul className="grid gap-2">
            {collections.map((c) => (
              <li key={c.id}><Link href={productsHref(c.categoryIds)} onClick={onClose} className="block py-1.5 text-soft hover:text-champagne">{c.name}</Link></li>
            ))}
          </ul>
        </nav>
        {(contact.email || contact.phone) && (
          <div className="border-t border-line px-5 py-6 text-sm text-muted">
            {contact.email && <a className="block py-1 hover:text-white" href={`mailto:${contact.email}`}>{contact.email}</a>}
            {contact.phone && <a className="block py-1 hover:text-white" href={contact.phoneHref}>{contact.phone}</a>}
          </div>
        )}
      </div>
    </div>
  );
}
