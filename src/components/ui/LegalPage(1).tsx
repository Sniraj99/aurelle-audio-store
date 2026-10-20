import type { ReactNode } from "react";
import { DemoNotice } from "@/components/ui/DemoNotice";

export function LegalPage({ title, updated, children, draft = true }: { title: string; updated?: string; children: ReactNode; draft?: boolean }) {
  return (
    <article className="frame max-w-3xl py-16 sm:py-24">
      <h1 className="display-lg text-white">{title}</h1>
      {updated && <p className="mt-4 text-sm text-muted">Last updated {updated}</p>}
      {draft && <DemoNotice className="mt-8">Draft template. Bracketed sections must be completed, and the whole policy reviewed by a qualified professional, before launch.</DemoNotice>}
      <div className="mt-12 grid gap-10 leading-relaxed text-muted [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:text-white [&_li]:ml-5 [&_li]:list-disc [&_ul]:grid [&_ul]:gap-2">
        {children}
      </div>
    </article>
  );
}
