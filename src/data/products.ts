/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  DEMONSTRATION CATALOGUE
 *  Every product below is a placeholder. Names, prices, specifications, and
 *  images are illustrative only and are flagged `demo: true`, which shows a
 *  visible notice on the site and suppresses structured data.
 *
 *  To add a real product: copy an entry, set `demo: false`, and fill in verified
 *  details. Omit any field you don't have: the UI hides missing information.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { Product, ProductImage } from "@/types/product";

const views = (slug: string, name: string): ProductImage[] => [
  { src: `/media/demo/${slug}-front.svg`, alt: `${name}, front view (demo illustration)`, width: 1200, height: 1500 },
  { src: `/media/demo/${slug}-angle.svg`, alt: `${name}, three-quarter view (demo illustration)`, width: 1200, height: 1500 },
  { src: `/media/demo/${slug}-detail.svg`, alt: `${name}, driver detail (demo illustration)`, width: 1200, height: 1500 },
];

const DEMO_NOTE = "Demonstration specification. Replace with verified data.";

export const products: Product[] = [
  {
    id: "demo-halo-ic6",
    slug: "halo-ic6",
    name: "Halo IC6",
    categoryId: "ceiling-speakers",
    brand: "Aurelle",
    shortDescription: "An in-ceiling speaker with a paintable, near-flush grille.",
    description: [
      "Halo IC6 demonstrates a premium in-ceiling installation speaker. Designed to integrate seamlessly into any ceiling, providing immersive, high-quality sound without visible loudspeaker components.",
      "Replace with verified product details and actual specifications.",
    ],
    images: views("halo-ic6", "Halo IC6"),
    currency: "INR",
    purchaseMode: "enquiry",
    connectivity: ["Spring terminals"],
    useCases: ["architectural", "music"],
    featured: true,
    featuredRank: 1,
    demo: true,
  },
  {
    id: "demo-atelier-b2",
    slug: "atelier-b2",
    name: "Atelier B2",
    categoryId: "bookshelf",
    brand: "Aurelle",
    sku: "DEMO-AB2",
    shortDescription: "A compact two-way speaker for shelves, stands, and desks.",
    description: [
      "Atelier B2 is a premium bookshelf speaker designed for detailed listening in any room. With carefully selected finishes and superior acoustics, it brings clarity and warmth to your collection.",
      "Replace this copy with verified product details before launch.",
    ],
    images: views("atelier-b2", "Atelier B2"),
    currency: "INR",
    priceMinor: 6400000,
    purchaseMode: "purchase",
    availability: "in_stock",
    stock: 12,
    variants: [
      { id: "black", name: "Satin black", kind: "finish", swatch: "#16181d", sku: "DEMO-AB2-BK" },
      { id: "oak", name: "Natural oak", kind: "finish", swatch: "#b08d62", sku: "DEMO-AB2-OK" },
    ],
    specifications: [
      { title: "Acoustic design (demo)", items: [
        { label: "Configuration", value: "Two-way, rear port" },
        { label: "Sold as", value: "Pair" },
        { label: "Note", value: DEMO_NOTE },
      ] },
    ],
    connectivity: ["Binding posts"],
    useCases: ["music", "studio"],
    dimensions: "Demo: 320 × 190 × 260 mm (H × W × D)",
    inTheBox: ["Pair of speakers", "Port bungs", "Grilles"],
    components: [
      { label: "Tweeter", value: "Soft-dome tweeter in a shallow waveguide" },
      { label: "Port", value: "Rear-firing port with bungs for close placement" },
    ],
    featured: true,
    featuredRank: 2,
    demo: true,
  },
  {
    id: "demo-atelier-b1",
    slug: "atelier-b1",
    name: "Atelier B1",
    categoryId: "bookshelf",
    brand: "Aurelle",
    sku: "DEMO-AB1",
    shortDescription: "The smallest Atelier, for desks and secondary rooms.",
    description: [
      "Atelier B1 is our most compact bookshelf speaker, perfect for smaller spaces while delivering exceptional audio quality. Ideal for studios, offices, and secondary listening rooms.",
    ],
    images: views("atelier-b1", "Atelier B1"),
    currency: "INR",
    priceMinor: 4200000,
    purchaseMode: "purchase",
    availability: "in_stock",
    stock: 8,
    connectivity: ["Binding posts"],
    useCases: ["music", "studio"],
    demo: true,
  },
  {
    id: "demo-vela-sb",
    slug: "vela-soundbar",
    name: "Vela Soundbar",
    categoryId: "soundbars",
    brand: "Aurelle",
    sku: "DEMO-VSB",
    shortDescription: "A low-profile soundbar that sits quietly beneath the screen.",
    description: [
      "Vela is our premium soundbar, engineered to deliver cinematic sound without dominating your living room. Its elegant profile and powerful drivers provide immersive audio for movies and music.",
      "Replace with verified product details and specifications.",
    ],
    images: views("vela-soundbar", "Vela Soundbar"),
    currency: "INR",
    priceMinor: 7400000,
    purchaseMode: "purchase",
    availability: "in_stock",
    stock: 10,
    connectivity: ["HDMI eARC", "Optical", "Bluetooth"],
    useCases: ["film", "music"],
    inTheBox: ["Soundbar", "Wall bracket", "Power cable"],
    featured: true,
    featuredRank: 3,
    demo: true,
  },
  {
    id: "demo-cinema-c5",
    slug: "cinema-c5",
    name: "Cinema C5 System",
    categoryId: "soundbars",
    brand: "Aurelle",
    shortDescription: "A premium multi-channel system for true cinematic sound.",
    description: [
      "Cinema C5 is a complete home theatre system configured to your room and listening preferences. This premium setup is designed for those who demand true cinematic sound quality.",
      "This product is available through consultation. Contact us to discuss your space and audio goals.",
    ],
    images: views("cinema-c5", "Cinema C5 System"),
    currency: "INR",
    purchaseMode: "enquiry",
    connectivity: ["HDMI eARC", "Optical", "Wi-Fi"],
    useCases: ["film", "music"],
    components: [
      { label: "Centre channel", value: "Horizontal array for dialogue clarity" },
      { label: "Connection", value: "HDMI eARC to the television" },
    ],
    featured: true,
    featuredRank: 4,
    demo: true,
  },
];
