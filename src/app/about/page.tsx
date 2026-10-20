import type { Metadata } from "next";
import { aboutContent as a } from "@/content/about";
import { media } from "@/config/media";
import { pageMetadata } from "@/lib/seo";
import { MediaImage } from "@/components/ui/MediaImage";
import { Reveal } from "@/components/ui/Reveal";
import { FinalCta } from "@/components/home/FinalCta";

export const metadata: Metadata = pageMetadata({
  title: "About Us",
  description: "A new audio company building a considered collection of speakers for real rooms.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div className="frame grid items-end gap-12 pb-20 pt-16 sm:pt-24 lg:grid-cols-12 lg:pb-28">
          <h1 className="display-xl text-white lg:col-span-8">{a.hero.heading}</h1>
          <p className="lede lg:col-span-4">{a.hero.body}</p>
        </div>
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-midnight sm:aspect-[21/9]">
          <MediaImage image={media.lifestyle.living} fill sizes="100vw" priority className="object-cover" />
        </div>
      </section>

      <section aria-labelledby="story" className="frame grid gap-12 py-24 sm:py-32 lg:grid-cols-12">
        <h2 id="story" className="display-lg text-white lg:col-span-4">{a.story.heading}</h2>
        <div className="grid gap-6 text-lg leading-relaxed text-muted lg:col-span-7 lg:col-start-6">
          {a.story.body.map((p) => <p key={p}>{p}</p>)}
          {a.story.founderNote && <p className="text-soft">{a.story.founderNote}</p>}
          {a.story.team.length > 0 && (
            <ul className="mt-6 grid gap-4 sm:grid-cols-2">{a.story.team.map((t) => <li key={t.name}><span className="block text-white">{t.name}</span><span className="text-sm">{t.role}</span></li>)}</ul>
          )}
        </div>
      </section>

      <section aria-labelledby="philosophy" className="on-light bg-soft py-24 text-obsidian sm:py-32">
        <div className="frame">
          <h2 id="philosophy" className="display-lg">{a.philosophy.heading}</h2>
          <dl className="mt-14 grid gap-12 md:grid-cols-3">
            {a.philosophy.lines.map((l) => (
              <div key={l.title} className="border-t border-obsidian/15 pt-6">
                <dt className="font-display text-4xl font-light">{l.title}</dt>
                <dd className="mt-4 text-[#3a4252]">{l.body}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section aria-labelledby="approach" className="frame grid items-center gap-14 py-24 sm:py-32 lg:grid-cols-12">
        <div className="relative aspect-[4/5] overflow-hidden bg-midnight lg:col-span-5">
          <MediaImage image={media.intro} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
        </div>
        <Reveal className="lg:col-span-6 lg:col-start-7">
          <h2 id="approach" className="display-lg text-white">{a.approach.heading}</h2>
          <p className="mt-8 text-lg leading-relaxed text-muted">{a.approach.body}</p>
          <h2 className="display-md mt-20 text-white">{a.selection.heading}</h2>
          <p className="mt-6 text-lg leading-relaxed text-muted">{a.selection.body}</p>
          {a.selection.manufacturingNote && <p className="mt-6 text-soft">{a.selection.manufacturingNote}</p>}
        </Reveal>
      </section>

      <section aria-labelledby="commitment" className="border-y border-line bg-midnight py-24 sm:py-32">
        <div className="frame grid gap-12 lg:grid-cols-12">
          <h2 id="commitment" className="display-lg text-white lg:col-span-5">{a.commitment.heading}</h2>
          <ul className="divide-y divide-line border-y border-line lg:col-span-6 lg:col-start-7">
            {a.commitment.items.map((i) => <li key={i} className="flex items-center gap-4 py-5 text-lg text-soft"><span aria-hidden className="h-1.5 w-1.5 rounded-full bg-gold" />{i}</li>)}
          </ul>
        </div>
      </section>

      <section aria-labelledby="vision" className="frame py-24 sm:py-32">
        <h2 id="vision" className="text-sm text-muted">{a.vision.heading}</h2>
        <p className="display-lg mt-6 max-w-4xl text-white">{a.vision.body}</p>
      </section>

      <FinalCta heading={a.closing.heading} body={a.closing.body} />
    </>
  );
}
