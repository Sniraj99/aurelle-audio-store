"use client";
import { useEffect, useRef, type ReactNode } from "react";

/** Fades content in once when it enters the viewport. Disabled by prefers-reduced-motion in CSS. */
export function Reveal({ children, className = "", delay = 0, as: Tag = "div" }: { children: ReactNode; className?: string; delay?: number; as?: "div" | "section" | "li" }) {
  const ref = useRef<HTMLDivElement>(null);
  const Comp = Tag as "div";
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) { el.classList.add("is-visible"); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) { el.classList.add("is-visible"); io.disconnect(); }
    }, { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <Comp ref={ref} className={`reveal ${className}`} style={delay ? { transitionDelay: `${delay}ms` } : undefined}>
      {children}
    </Comp>
  );
}
