import { brand } from "@/config/brand";

/**
 * Original text wordmark: the brand name in widely tracked Manrope, preceded by
 * the "driver" mark (a surround ring and dust cap seen face-on).
 */
export function DriverMark({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden fill="none">
      <circle cx="12" cy="12" r="10.5" stroke="currentColor" strokeWidth="1" />
      <circle cx="12" cy="12" r="6.5" stroke="currentColor" strokeWidth="0.75" opacity="0.6" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </svg>
  );
}

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <DriverMark className="h-[1.15em] w-[1.15em] text-gold" />
      <span className="text-[0.95rem] font-medium tracking-[0.42em] text-white">{brand.wordmark}</span>
    </span>
  );
}
