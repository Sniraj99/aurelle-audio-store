import type { Metadata } from "next";
import { products } from "@/data/products";
import { contact, whatsappLink } from "@/config/contact";
import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/forms/ContactForm";

export const metadata: Metadata = pageMetadata({
  title: "Contact Us",
  description: "Ask about a product, plan a system for your room, or get help with an order.",
  path: "/contact",
});

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ContactPage({ searchParams }: Props) {
  const sp = await searchParams;
  const slug = typeof sp.product === "string" ? sp.product : "";
  const type = typeof sp.type === "string" ? sp.type : "";
  const product = products.find((p) => p.slug === slug);
  const wa = whatsappLink();
  const hasDetails = contact.email || contact.phone || wa || contact.addressLines.length || contact.businessHours.length;

  return (
    <div className="frame grid gap-16 py-16 sm:py-24 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <h1 className="display-xl text-white">Let&apos;s Talk Sound.</h1>
        <p className="lede mt-8">Tell us about your space and how you listen. Whether you&apos;re choosing a first pair of speakers or planning a full system, we&apos;ll help you find a sensible place to start.</p>
        {hasDetails ? (
          <dl className="mt-14 grid gap-8 border-t border-line pt-10">
            {contact.email && <div><dt className="text-sm text-muted">Email</dt><dd className="mt-1"><a className="link-underline text-white" href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>}
            {contact.phone && <div><dt className="text-sm text-muted">Phone</dt><dd className="mt-1"><a className="link-underline text-white" href={contact.phoneHref}>{contact.phone}</a></dd></div>}
            {wa && <div><dt className="text-sm text-muted">WhatsApp</dt><dd className="mt-1"><a className="link-underline text-white" href={wa} target="_blank" rel="noopener noreferrer">Message us on WhatsApp</a></dd></div>}
            {contact.addressLines.length > 0 && <div><dt className="text-sm text-muted">Address</dt><dd className="mt-1 text-white"><address className="not-italic">{contact.addressLines.map((l) => <span key={l} className="block">{l}</span>)}</address></dd></div>}
            {contact.businessHours.length > 0 && <div><dt className="text-sm text-muted">Hours</dt><dd className="mt-1 grid gap-1 text-white">{contact.businessHours.map((h) => <span key={h.days}>{h.days}: {h.hours}</span>)}</dd></div>}
          </dl>
        ) : null}
      </div>
      <div className="lg:col-span-6 lg:col-start-7">
        <ContactForm initialProduct={product?.name} initialType={type} />
      </div>
    </div>
  );
}
