import Link from "next/link";
import { brand } from "@/config/brand";
import { contact } from "@/config/contact";
import { features, footerSupportLinks, legalLinks, primaryNav, productsHref } from "@/config/site";
import { categories } from "@/data/categories";
import { Wordmark } from "@/components/layout/Wordmark";
import { NewsletterForm } from "@/components/forms/NewsletterForm";

export function Footer() {
  const year = new Date().getFullYear();
  const years = year > brand.copyrightStartYear ? `${brand.copyrightStartYear}–${year}` : `${year}`;
  const hasContact = contact.email || contact.phone || contact.addressLines.length > 0;
  return (
    <footer className="border-t border-line bg-obsidian">
      <div className="frame grid gap-14 py-16 lg:grid-cols-12 lg:py-24">
        <div className="lg:col-span-5">
          <Wordmark />
          <p className="mt-6 max-w-sm text-muted">{brand.footerStatement}</p>
          {features.newsletter && <div className="mt-10"><NewsletterForm /></div>}
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
          <div>
            <p className="mb-4 text-sm text-muted">Explore</p>
            <ul className="grid gap-3">{primaryNav.map((l) => <li key={l.href}><Link className="link-underline text-soft hover:text-white" href={l.href}>{l.label}</Link></li>)}</ul>
          </div>
          <div>
            <p className="mb-4 text-sm text-muted">Categories</p>
            <ul className="grid gap-3">{categories.map((c) => <li key={c.id}><Link className="link-underline text-soft hover:text-white" href={productsHref([c.id])}>{c.shortName}</Link></li>)}</ul>
          </div>
          <div>
            <p className="mb-4 text-sm text-muted">Support</p>
            <ul className="grid gap-3">{footerSupportLinks.map((l) => <li key={l.href}><Link className="link-underline text-soft hover:text-white" href={l.href}>{l.label}</Link></li>)}</ul>
            {hasContact && (
              <address className="mt-8 grid gap-1 text-sm not-italic text-muted">
                {contact.email && <a className="hover:text-white" href={`mailto:${contact.email}`}>{contact.email}</a>}
                {contact.phone && <a className="hover:text-white" href={contact.phoneHref}>{contact.phone}</a>}
                {contact.addressLines.map((l) => <span key={l}>{l}</span>)}
              </address>
            )}
            {contact.social.length > 0 && (
              <ul className="mt-6 flex flex-wrap gap-4 text-sm">{contact.social.map((s) => <li key={s.href}><a className="link-underline text-soft hover:text-white" href={s.href} rel="noopener noreferrer" target="_blank">{s.label}</a></li>)}</ul>
            )}
          </div>
        </nav>
      </div>
      <div className="border-t border-line">
        <div className="frame flex flex-col gap-4 py-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {years} {brand.legalName}. All rights reserved.</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">{legalLinks.map((l) => <li key={l.href}><Link className="hover:text-white" href={l.href}>{l.label}</Link></li>)}</ul>
        </div>
      </div>
    </footer>
  );
}
