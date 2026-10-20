import { ButtonLink } from "@/components/ui/Button";
import { DriverMark } from "@/components/layout/Wordmark";

export function FinalCta({ heading, body }: { heading: string; body: string }) {
  return (
    <section aria-labelledby="closing-title" className="relative isolate overflow-hidden bg-obsidian py-28 sm:py-40">
      <DriverMark className="pointer-events-none absolute -right-40 top-1/2 -z-10 h-[46rem] w-[46rem] -translate-y-1/2 text-gold/[0.07]" />
      <div className="frame">
        <h2 id="closing-title" className="display-xl text-white">{heading}</h2>
        <p className="lede mt-8">{body}</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:gap-6">
          <ButtonLink href="/products" size="lg">Explore the Collection</ButtonLink>
          <ButtonLink href="/contact" variant="secondary" size="lg">Talk to us</ButtonLink>
        </div>
      </div>
    </section>
  );
}
