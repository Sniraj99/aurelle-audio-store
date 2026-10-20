import type { Product, ProductVariant } from "@/types/product";
import { formatMoney } from "@/lib/money";
import { fromPrice, unitPrice } from "@/lib/product-rules";

/** Shows the configured price, a genuine sale price, or "Price on request" for enquiry products. */
export function Price({ product, variant, from = false, className = "" }: { product: Product; variant?: ProductVariant; from?: boolean; className?: string }) {
  const price = unitPrice(product, variant);
  const hasVariantPrices = from && (product.variants ?? []).some((v) => v.priceMinor !== undefined && v.priceMinor !== product.priceMinor);
  if (!price) {
    return product.purchaseMode === "enquiry" ? <p className={`text-muted ${className}`}>Price on request</p> : null;
  }
  if (hasVariantPrices) {
    return <p className={className}><span className="text-muted">From </span>{formatMoney(fromPrice(product)!, product.currency)}</p>;
  }
  return (
    <p className={className}>
      {price.saleMinor !== undefined ? (
        <>
          <span className="sr-only">Sale price </span>
          <span className="text-champagne">{formatMoney(price.saleMinor, product.currency)}</span>
          <span className="sr-only">, regular price </span>
          <s className="ml-2 text-muted">{formatMoney(price.regularMinor, product.currency)}</s>
        </>
      ) : (
        formatMoney(price.regularMinor, product.currency)
      )}
    </p>
  );
}
