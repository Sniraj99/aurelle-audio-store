import { homeContent } from "@/content/home";

export function LifestyleShowcase() {
  return (
    <section className="py-20 md:py-28 frame">
      <div className="mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-light text-white">
          {homeContent.lifestyle.heading}
        </h2>
      </div>
      <div className="grid gap-8 md:grid-cols-3">
        {homeContent.lifestyle.items.map((item) => (
          <div key={item.key} className="group">
            <h3 className="font-display text-xl text-champagne mb-3">
              {item.caption}
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
