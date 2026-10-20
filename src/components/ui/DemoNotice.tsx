/** Visible label for demonstration content. Remove automatically by setting `demo: false` on real products. */
export function DemoNotice({ children = "Demonstration product. Name, price, specifications and imagery are placeholders.", className = "" }: { children?: React.ReactNode; className?: string }) {
  return (
    <p className={`inline-flex items-start gap-2 border-l border-gold/60 py-1 pl-3 text-xs leading-relaxed text-muted ${className}`}>
      {children}
    </p>
  );
}
