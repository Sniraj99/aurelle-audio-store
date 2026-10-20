import { homeContent } from "@/content/home";

export function FeaturedCollection() {
  return (
    <section className="py-20 md:py-28 frame">
      <div className="mb-12">
        <h2 className="font-display text-3xl md:text-4xl font-light text-white mb-4">
          {homeContent.featured.heading}
        </h2>
        <p className="text-lg text-muted">
          {homeContent.featured.body}
        </p>
      </div>
    </section>
  );
}
