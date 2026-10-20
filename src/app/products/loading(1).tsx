export default function Loading() {
  return (
    <div className="frame py-24" role="status" aria-label="Loading products">
      <div className="h-16 w-2/3 max-w-xl animate-pulse bg-surface" />
      <div className="mt-16 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => <div key={i} className="aspect-[4/5] animate-pulse bg-midnight" />)}
      </div>
    </div>
  );
}
