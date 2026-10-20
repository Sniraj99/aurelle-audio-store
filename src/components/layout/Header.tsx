"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, ShoppingBag } from "lucide-react";
import { primaryNav } from "@/config/site";
import { Wordmark } from "@/components/layout/Wordmark";
import { MegaMenu } from "@/components/layout/MegaMenu";
import { MobileNavigation } from "@/components/layout/MobileNavigation";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { useCart } from "@/components/cart/CartProvider";

export function Header() {
  const pathname = usePathname();
  const overHero = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { cart, hydrated, openDrawer } = useCart();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); setMobileOpen(false); }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const openMenu = () => { if (closeTimer.current) clearTimeout(closeTimer.current); setMenuOpen(true); };
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setMenuOpen(false), 160); };
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const closeSearch = useCallback(() => setSearchOpen(false), []);

  const solid = !overHero || scrolled || menuOpen;
  const count = hydrated ? cart.itemCount : 0;

  return (
    <>
      <header
        className={`sticky top-0 z-50 transition-[background-color,border-color] duration-500 ${overHero ? "-mb-[var(--header-h)]" : ""} ${solid ? "border-b border-line bg-obsidian/95 backdrop-blur-md" : "border-b border-transparent bg-transparent"}`}
        onMouseLeave={scheduleClose}
      >
        <div className="frame flex h-[var(--header-h)] items-center justify-between gap-6">
          <Link href="/" aria-label="Home" className="shrink-0"><Wordmark /></Link>

          <nav aria-label="Main" className="hidden lg:block">
            <ul className="flex items-center gap-10">
              {primaryNav.map((item) => {
                const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
                if ("megaMenu" in item && item.megaMenu) {
                  return (
                    <li key={item.href} className="flex items-center gap-1" onMouseEnter={openMenu}>
                      <Link href={item.href} aria-current={active ? "page" : undefined} className={`link-underline py-2 text-[0.9rem] ${active ? "text-champagne" : "text-soft hover:text-white"}`}>{item.label}</Link>
                      <button
                        type="button" aria-expanded={menuOpen} aria-controls="mega-menu" aria-label="Show product categories"
                        onClick={() => setMenuOpen((o) => !o)}
                        className="grid h-8 w-6 place-items-center text-muted hover:text-white"
                      >
                        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${menuOpen ? "rotate-180" : ""}`} strokeWidth={1.5} />
                      </button>
                    </li>
                  );
                }
                return (
                  <li key={item.href} onMouseEnter={scheduleClose}>
                    <Link href={item.href} aria-current={active ? "page" : undefined} className={`link-underline py-2 text-[0.9rem] ${active ? "text-champagne" : "text-soft hover:text-white"}`}>{item.label}</Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-1">
            <button type="button" onClick={() => setSearchOpen(true)} aria-label="Search products" className="grid h-11 w-11 place-items-center text-soft hover:text-champagne">
              <Search className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.25} />
            </button>
            <button type="button" onClick={openDrawer} aria-label={`Shopping bag, ${count} ${count === 1 ? "item" : "items"}`} className="relative grid h-11 w-11 place-items-center text-soft hover:text-champagne">
              <ShoppingBag className="h-[1.15rem] w-[1.15rem]" strokeWidth={1.25} />
              {count > 0 && (
                <span aria-hidden className="absolute right-1 top-1.5 grid h-[1.1rem] min-w-[1.1rem] place-items-center rounded-full bg-gold px-1 text-[0.65rem] font-semibold text-obsidian">{count > 99 ? "99+" : count}</span>
              )}
            </button>
            <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open menu" aria-expanded={mobileOpen} aria-controls="mobile-nav" className="grid h-11 w-11 place-items-center text-soft hover:text-white lg:hidden">
              <Menu className="h-5 w-5" strokeWidth={1.25} />
            </button>
          </div>
        </div>
        <div className="hidden lg:block" onMouseEnter={openMenu}>
          <MegaMenu id="mega-menu" open={menuOpen} onNavigate={closeMenu} />
        </div>
      </header>
      <MobileNavigation open={mobileOpen} onClose={closeMobile} pathname={pathname} />
      <SearchDialog open={searchOpen} onClose={closeSearch} />
    </>
  );
}
