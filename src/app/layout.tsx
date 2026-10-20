import type { Metadata, Viewport } from "next";
import { Manrope, Newsreader } from "next/font/google";
import "./globals.css";
import { brand, siteUrl } from "@/config/brand";
import { CartProvider } from "@/components/cart/CartProvider";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const sans = Manrope({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const display = Newsreader({ subsets: ["latin"], variable: "--font-display", display: "swap", weight: ["300", "400"], style: ["normal"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${brand.name} | ${brand.tagline}`, template: `%s | ${brand.name}` },
  description: brand.description,
  applicationName: brand.name,
  openGraph: { siteName: brand.name, type: "website", locale: "en_IN" },
};

export const viewport: Viewport = { themeColor: "#080A0E", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={`${sans.variable} ${display.variable}`}>
      <body>
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-gold focus:px-4 focus:py-2 focus:text-obsidian">Skip to content</a>
        <CartProvider>
          <AnnouncementBar />
          <Header />
          <main id="main" tabIndex={-1} className="focus:outline-none">{children}</main>
          <Footer />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
