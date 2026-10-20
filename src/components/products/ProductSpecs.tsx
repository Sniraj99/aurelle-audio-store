import type { Product } from "@/types/product";

/** Renders only the specification rows that exist. Nothing is inferred or filled in. */
export function ProductSpecs({ product }: { product: Product }) {
  const groups = [...(product.specifications ?? [])];
  const general = [
    product.connectivity?.length ? { label: "Connectivity", value: product.connectivity.join(", ") } : null,
    product.dimensions ? { label: "Dimensions", value: product.dimensions } : null,
    product.weight ? { label: "Weight", value: product.weight } : null,
    product.sku ? { label: "Model reference", value: product.sku } : null,
  ].filter((x): x is { label: string; value: string } => x !== null);
  if (general.length) groups.push({ title: "General", items: general });
  if (!groups.length && !product.inTheBox?.length) return null;

  return (
    <div className="grid gap-12">
      {groups.map((g) => (
        <div key={g.title}>
          <h3 className="mb-4 text-lg text-white">{g.title}</h3>
          <dl className="divide-y divide-line border-y border-line">
            {g.items.map((i) => (
              <div key={i.label} className="grid gap-1 py-4 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <dt className="text-muted">{i.label}</dt>
                <dd className="text-soft">{i.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      {product.inTheBox?.length ? (
        <div>
          <h3 className="mb-4 text-lg text-white">What&apos;s included</h3>
          <ul className="divide-y divide-line border-y border-line">
            {product.inTheBox.map((i) => <li key={i} className="py-4 text-soft">{i}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
