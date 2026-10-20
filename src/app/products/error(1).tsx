"use client";
import { Button } from "@/components/ui/Button";

export default function ProductsError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="frame flex flex-col items-start gap-6 py-32">
      <h1 className="display-lg text-white">The catalogue didn&apos;t load.</h1>
      <p className="text-muted">Reload the products to try again. If this keeps happening, contact us.</p>
      <Button onClick={reset}>Reload products</Button>
    </div>
  );
}
