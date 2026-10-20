import { homeContent } from "@/content/home";

export function BrandValues() {
  return (
    <section className="py-20 md:py-28 frame">
      <div className="mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-light text-white">
          {homeContent.values.heading}
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {homeContent.values.items.map((item, i) => (
          <div key={i} className="border-l border-champagne/30 pl-6">
            <h3 className="font-display text-lg text-champagne mb-2">
              {item.title}
            </h3>
            <p className="text-muted leading-relaxed">
              {item.body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
