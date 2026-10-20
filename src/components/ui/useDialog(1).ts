"use client";
import { useEffect, useRef } from "react";

/** Escape to close, focus the panel on open, restore focus on close, trap Tab, and lock page scroll. */
export function useDialog(open: boolean, onClose: () => void) {
  const panelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    const focusables = () =>
      panel ? Array.from(panel.querySelectorAll<HTMLElement>('a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])')) : [];
    (panel?.querySelector<HTMLElement>("[data-autofocus]") ?? focusables()[0] ?? panel)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); onClose(); return; }
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0]!, last = items[items.length - 1]!;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open, onClose]);
  return panelRef;
}
