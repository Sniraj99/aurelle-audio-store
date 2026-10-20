"use client";
import { useState } from "react";
import type { ProductImage } from "@/types/product";
import { MediaImage } from "@/components/ui/MediaImage";

export function ProductGallery({ images, name }: { images: ProductImage[]; name: string }) {
  const [index, setIndex] = useState(0);
  const current = images[index] ?? images[0];
  if (!current) return null;

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") { e.preventDefault(); setIndex((i) => (i + 1) % images.length); }
    if (e.key === "ArrowLeft") { e.preventDefault(); setIndex((i) => (i - 1 + images.length) % images.length); }
  };

  return (
    <div className="flex flex-col-reverse gap-4 lg:flex-row">
      {images.length > 1 && (
        <div role="group" aria-label={`${name} images`} onKeyDown={onKey} className="flex gap-3 overflow-x-auto scrollbar-none lg:w-20 lg:flex-col">
          {images.map((img, i) => (
            <button
              key={img.src} type="button" onClick={() => setIndex(i)} aria-label={`Show image ${i + 1} of ${images.length}`} aria-current={i === index}
              className={`relative aspect-[4/5] w-16 shrink-0 overflow-hidden bg-midnight transition-opacity lg:w-full ${i === index ? "opacity-100 outline outline-1 outline-offset-2 outline-gold" : "opacity-50 hover:opacity-90"}`}
            >
              <MediaImage image={img} fill sizes="80px" className="object-cover" alt="" />
            </button>
          ))}
        </div>
      )}
      <div className="relative aspect-[4/5] flex-1 overflow-hidden bg-midnight">
        {images.map((img, i) => (
          <MediaImage
            key={img.src} image={img} fill priority={i === 0} sizes="(min-width: 1024px) 50vw, 100vw"
            className={`object-cover transition-opacity duration-500 ease-lux ${i === index ? "opacity-100" : "opacity-0"}`}
            aria-hidden={i !== index}
          />
        ))}
        <p className="sr-only" aria-live="polite">{current.alt}</p>
      </div>
    </div>
  );
}
