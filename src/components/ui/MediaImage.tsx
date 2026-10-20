import Image, { type ImageProps } from "next/image";
import type { ProductImage } from "@/types/product";

/**
 * Wraps next/image. SVG demo art is served as-is; raster photography is
 * automatically resized and converted to AVIF/WebP by Next.js.
 * Pass alt="" for purely decorative duplicates (e.g. gallery thumbnails).
 */
export function MediaImage({ image, alt, ...rest }: { image: ProductImage; alt?: string } & Omit<ImageProps, "src" | "alt" | "width" | "height">) {
  const isSvg = image.src.endsWith(".svg");
  const sizing = rest.fill ? {} : { width: image.width, height: image.height };
  return <Image src={image.src} alt={alt ?? image.alt} unoptimized={isSvg} {...sizing} {...rest} />;
}
