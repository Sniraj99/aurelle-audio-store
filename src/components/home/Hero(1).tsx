import { homeContent } from "@/content/home";
import { media } from "@/config/media";
import { MediaImage } from "@/components/ui/MediaImage";
import { ButtonLink } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function Hero() {
  const { hero } = homeContent;
  return (
    <section aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-obsidian">
      <div className="absolute inset-0 -z-10 animate-fade">
        <MediaImage image={media.hero} fill priority sizes="100vw" className="hidden object-cover object-[65%_50%] md:block" />
        <MediaImage image={media.heroMobile} fill priority sizes="100vw" className="object-cover object-center md:hidden" />
        <div className="absolute inset-0 bg-gradient-to-t from-obsidian via-obsidian/40 to-obsidian/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-obsidian/80 via-obsidian/10 to-transparent" />
      </div>
      <div className="frame pb-16 pt-40 sm:pb-24 lg:pb-28">
        <div className="max-w-3xl">
          <h1 id="hero-title" className="display-xl animate-rise text-white">{hero.headline}</h1>
          <p className="lede mt-8 animate-rise text-soft/85 [animation-delay:150ms]">{hero.body}</p>
          <div className="mt-10 flex animate-rise flex-col gap-3 [animation-delay:300ms] sm:flex-row sm:items-center sm:gap-6">
            <ButtonLink href={hero.primaryCta.href} size="lg">
              {hero.primaryCta.label}
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} aria-hidden />
            </ButtonLink>
            <ButtonLink href={hero.secondaryCta.href} variant="secondary" size="lg">{hero.secondaryCta.label}</ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
