import { homeContent } from "@/content/home";

export function BrandIntroduction() {
  return (
    <section className="py-20 md:py-28 frame">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl md:text-4xl font-light text-white mb-6">
          {homeContent.intro.heading}
        </h2>
        <div className="space-y-4">
          {homeContent.intro.body.map((paragraph, i) => (
            <p key={i} className="text-lg text-muted leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
