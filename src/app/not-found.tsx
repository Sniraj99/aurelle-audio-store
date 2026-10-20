import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="frame flex min-h-[70vh] flex-col items-start justify-center gap-8 py-24">
      <p className="text-sm text-muted">Page not found</p>
      <h1 className="display-xl text-white">This page is silent.</h1>
      <p className="lede">The link may be out of date, or the product may have moved. Try the collection, or tell us what you were looking for.</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <ButtonLink href="/products" size="lg">Explore the Collection</ButtonLink>
        <ButtonLink href="/" variant="secondary" size="lg">Go to the homepage</ButtonLink>
      </div>
    </div>
  );
}
