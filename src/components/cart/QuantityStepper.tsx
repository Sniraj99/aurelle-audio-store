"use client";
import { Minus, Plus } from "lucide-react";

export function QuantityStepper({ value, max, onChange, label, size = "md" }: { value: number; max: number; onChange: (n: number) => void; label: string; size?: "sm" | "md" }) {
  const h = size === "sm" ? "h-10" : "h-12";
  return (
    <div className={`inline-flex ${h} items-stretch rounded-sm border border-line`} role="group" aria-label={label}>
      <button type="button" className="grid w-10 place-items-center text-muted transition hover:text-white disabled:opacity-30" onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Decrease quantity">
        <Minus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
      <input
        type="number" inputMode="numeric" min={1} max={max} value={value}
        aria-label="Quantity"
        onChange={(e) => { const n = Math.floor(Number(e.target.value)); if (Number.isFinite(n) && n >= 1) onChange(Math.min(n, max)); }}
        className="w-10 bg-transparent text-center text-sm text-white [appearance:textfield] focus:outline-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button type="button" className="grid w-10 place-items-center text-muted transition hover:text-white disabled:opacity-30" onClick={() => onChange(value + 1)} disabled={value >= max} aria-label="Increase quantity">
        <Plus className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}
