import { homeContent } from "@/content/home";

export function DesignTechnology() {
  return (
    <section className="py-20 md:py-28 frame">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl md:text-4xl font-light text-white mb-6">
          {homeContent.technology.heading}
        </h2>
        <p className="text-lg text-muted leading-relaxed">
          {homeContent.technology.body}
        </p>
      </div>
    </section>
  );
}
