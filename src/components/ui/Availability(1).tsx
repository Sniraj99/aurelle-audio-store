import type { Product, ProductVariant } from "@/types/product";
import { availabilityLabels, availabilityOf } from "@/lib/product-rules";

/** Renders only when availability is configured. Never shows stock counts or urgency. */
export function Availability({ product, variant, className = "" }: { product: Product; variant?: ProductVariant; className?: string }) {
  const status = availabilityOf(product, variant);
  if (product.purchaseMode === "enquiry") return <p className={`text-sm text-muted ${className}`}>Available by enquiry</p>;
  if (!status) return null;
  const dot = status === "unavailable" ? "bg-muted/50" : status === "in_stock" ? "bg-champagne" : "border border-champagne";
  return (
    <p className={`flex items-center gap-2 text-sm text-muted ${className}`}>
      <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {availabilityLabels[status]}
    </p>
  );
}
