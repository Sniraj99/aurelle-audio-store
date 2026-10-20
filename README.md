# Aurelle website

A premium audio storefront built with **Next.js (App Router), TypeScript, and Tailwind CSS**, with server-validated checkout, Razorpay payment scaffolding, PostgreSQL order storage via Prisma, and honest fallbacks wherever an external service is not yet connected.

"Aurelle" is a **provisional** brand name. See [`docs/BRAND.md`](docs/BRAND.md) for the ten candidates, the shortlist, and how to rename.

---

## 1. Quick start

Requirements: Node.js 20.9 or newer, npm.

```bash
npm install          # also runs `prisma generate`
cp .env.example .env.local
npm run dev          # http://localhost:3000
```

With an empty `.env.local` the site runs fully in **demo mode**:

| Feature | Without configuration | What the customer sees |
|---|---|---|
| Checkout | No payment, no order stored | "Demonstration checkout" notice; confirmation page says no order was created |
| Contact form | Message not sent | "Online enquiries are not connected yet, so your message was not sent", plus email/WhatsApp links if configured |
| Newsletter | Email not saved | "Newsletter sign-up opens soon. Your email was not saved." |

Nothing pretends to succeed.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Local development |
| `npm run build` / `npm start` | Production build and server |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Unit and content-integrity tests (Node test runner via `tsx`) |
| `npm run media:demo` | Regenerate demo illustrations in `public/media/demo` |
| `npm run db:migrate` | Create/apply migrations in development |
| `npm run db:deploy` | Apply migrations in production |

---

## 2. Project structure

```
src/
  app/                      Routes (App Router)
    page.tsx                Home
    about/ products/ contact/
    products/[slug]/        Product detail (statically generated)
    cart/ checkout/
    order/[id]/ order/demo/ Order confirmation (real / demo)
    privacy/ terms/ shipping-returns/
    api/contact  api/newsletter  api/checkout
    api/payments/razorpay/verify  api/payments/razorpay/webhook
    sitemap.ts robots.ts icon.svg not-found.tsx error.tsx
  components/
    layout/   Header, MegaMenu, MobileNavigation, SearchDialog, Footer, AnnouncementBar, Wordmark
    home/     Hero, BrandIntroduction, FeaturedCollection, CategoryGrid, DesignTechnology,
              LifestyleShowcase, BrandValues, FinalCta
    products/ ProductCard, CatalogueView, ProductFilters, ProductGallery, ProductPurchasePanel, ProductSpecs
    cart/     CartProvider, CartDrawer, CartLineItem, CartPageView, QuantityStepper
    checkout/ CheckoutForm, OrderSummary
    forms/    ContactForm, NewsletterForm
    ui/       Button, MediaImage, Price, Availability, DemoNotice, Reveal, LegalPage, useDialog
  config/     brand, site (navigation, announcement, feature flags), contact, commerce, media, regions
  content/    home.ts, about.ts (editable copy)
  data/       products.ts, categories.ts (catalogue)
  lib/        Pure logic: catalogue, cart, product-rules, totals, money, validation, rate-limit
              Server-only: env, db, http, orders/, payments/, integrations/
  types/      product.ts
prisma/schema.prisma
scripts/generate-demo-media.ts
tests/
```

UI, data, server logic, and payment code are separated: client components import only pure modules; anything touching secrets imports `server-only` and fails the build if pulled into the browser.

---

## 3. Editing content (no redesign needed)

| What | Where |
|---|---|
| Brand name, wordmark, tagline, description | `src/config/brand.ts` |
| Hero, section copy, CTA labels | `src/content/home.ts`, `src/content/about.ts` |
| Navigation, announcement bar, feature flags | `src/config/site.ts` |
| Email, phone, WhatsApp, address, hours, social | `src/config/contact.ts` (empty values are hidden) |
| Currency, countries, shipping methods, tax | `src/config/commerce.ts` |
| Categories and homepage collections | `src/data/categories.ts` |
| Products | `src/data/products.ts` |
| Non-product images | `src/config/media.ts` |

### Managing products

Products live in `src/data/products.ts` as typed objects, so mistakes are caught by the type checker. To add a product, copy an entry and change it:

- **Prices are integers in paise** (`₹64,000` → `6400000`).
- `purchaseMode: "purchase"` shows Add to Bag / Buy Now; `"enquiry"` shows only the enquiry route.
- `availability`: `in_stock`, `made_to_order`, `preorder`, or `unavailable` (blocks purchase, keeps enquiry). Omit it to show nothing.
- `stock` is used only for server-side quantity limits; it is never shown as an urgency message.
- `variants` (finishes or configurations) can override price, availability, stock, and SKU.
- `salePriceMinor` only for a genuine, approved sale. It's ignored unless lower than the regular price.
- Omit any spec, dimension, weight, or "in the box" field you can't verify; the page hides it.
- `createdAt` on **every** product enables the "Newest" sort.
- **Set `demo: false` only for real products.** Demo products show a visible notice, are `noindex`, are excluded from the sitemap and structured data, and **cannot be ordered in live payment modes**.

Run `npm test` after editing: it checks unique IDs/slugs, valid prices, alt text, and that every image file exists.

When the catalogue outgrows a file (dozens of products, non-technical editors), move it to a headless CMS or a `Product` table. Only `src/data/products.ts` needs replacing; the rest of the app consumes the `Product` type.

### Images

All current images are original **demo illustrations** generated by `scripts/generate-demo-media.ts` and marked "Demo illustration". Replace them with photography you own or have licensed:

1. Put files in `public/media/` (JPG/PNG/WebP/AVIF, at least 2000px on the long edge for heroes, 1500px for products; product images at a **4:5** ratio).
2. Update `src/` references: product `images` in `products.ts`, `src/config/media.ts`, and `image` in `categories.ts`. Keep `width`/`height` accurate to avoid layout shift.
3. Raster images are automatically resized and served as AVIF/WebP by `next/image`. For a remote CDN, add its hostname to `images.remotePatterns` in `next.config.ts`.

Never use a competitor's product photo for your own product.

---

## 4. Environment variables

| Variable | Required for | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Canonical URLs, sitemap, Open Graph | e.g. `https://www.yourdomain.com` |
| `DATABASE_URL` | Real orders (manual or Razorpay) | PostgreSQL connection string |
| `PAYMENT_PROVIDER` | Choosing the payment mode | `demo` (default), `manual`, `razorpay` |
| `RAZORPAY_KEY_ID` | Razorpay | Key ID is safe to send to the browser; the app does so only per order |
| `RAZORPAY_KEY_SECRET` | Razorpay | **Server only.** Never prefix with `NEXT_PUBLIC_` |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhooks | Set the same value in the Razorpay dashboard |
| `RESEND_API_KEY`, `EMAIL_FROM`, `ENQUIRY_INBOX` | Contact form delivery | `EMAIL_FROM` must use a domain verified in Resend |
| `BREVO_API_KEY`, `BREVO_LIST_ID` | Newsletter | Numeric list ID |

Live modes are enabled only when every dependency is present: `razorpay` without a database or keys silently falls back to **demo**, because an order that can't be recorded must never be charged.

---

## 5. Database setup

Any managed PostgreSQL works (Neon, Supabase, Railway, AWS RDS, or a local instance).

```bash
# 1. set DATABASE_URL in .env.local
npx prisma migrate dev --name init   # creates tables locally
# production:
npm run db:deploy
```

Tables: `Order`, `OrderItem`, `PaymentEvent` (webhook de-duplication), `InventoryItem` (optional stock by SKU). If a SKU has an `InventoryItem` row, stock is decremented atomically when payment is confirmed; if stock has run out, the order is marked `NEEDS_REVIEW` instead of silently overselling. Use `npx prisma studio` to view orders and update statuses (`FULFILLED`, `CANCELLED`) until you add an authenticated admin.

**Order statuses:** `PENDING_PAYMENT` → `PAID` (signature-verified) or `PAYMENT_FAILED`; `NEEDS_REVIEW` (amount mismatch or inventory conflict); `CANCELLED`; `FULFILLED`.

---

## 6. Payments

### How checkout protects you

- The browser sends only product IDs, variant IDs, and quantities. **Prices, totals, purchasability, and stock are recomputed on the server** from `products.ts` and `commerce.ts`; any price sent by the client is ignored.
- Enquiry-only, unavailable, unknown, and demo products are rejected server-side.
- Each checkout carries an idempotency key, stored with a unique constraint, so double clicks and retries reuse one order.
- Card/UPI details go directly to Razorpay's hosted window and never touch this server.
- An order becomes `PAID` only after the **HMAC signature** is verified on the server (`/api/payments/razorpay/verify`) or a **signed webhook** arrives (`/api/payments/razorpay/webhook`). Both paths are idempotent.
- Forms are rate limited and reject cross-origin posts.

### Mode: `manual` (no gateway yet)

Set `DATABASE_URL` and `PAYMENT_PROVIDER=manual`. Orders are stored as `PENDING_PAYMENT` and the customer is told plainly that nothing has been charged and payment instructions will follow. Useful for a soft launch while gateway onboarding completes. You'll want to add an email notification to yourself (see `src/lib/integrations/email.ts`).

### Mode: `razorpay`

Before you start, confirm on Razorpay's current documentation that your business type is eligible and which KYC documents are needed; requirements change.

1. Create a Razorpay account and complete activation (KYC, bank account, website review; Razorpay checks that your site shows policies and contact details, so complete the legal pages and contact config first).
2. In **Test mode**, generate API keys (Dashboard → Account & Settings → API Keys). Put them in `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET`, and set `PAYMENT_PROVIDER=razorpay` and `DATABASE_URL`.
3. Add a webhook (Dashboard → Webhooks) pointing to `https://YOUR_DOMAIN/api/payments/razorpay/webhook` with events **`payment.captured`**, **`payment.failed`**, **`order.paid`**. Set a secret and copy it to `RAZORPAY_WEBHOOK_SECRET`. Webhooks need a public URL; for local testing use a tunnel such as `ngrok` or Cloudflare Tunnel.
4. Make sure your account **captures payments automatically** (payment capture settings), so `payment.captured` fires.
5. Replace demo products with real ones (`demo: false`). Live modes refuse to sell demo products.
6. Test with Razorpay's test cards/UPI IDs: success, failure, closing the window, and double-clicking the pay button. Check that `Order` rows move to `PAID` / `PAYMENT_FAILED` and that a `PaymentEvent` row appears per webhook.
7. Switch to **Live** keys and a live webhook secret only after the above passes.

The Razorpay client (`src/lib/payments/razorpay.ts`) calls the Orders REST API directly; check it against the current API reference before launch. **Stripe** or another provider can be added by implementing the same three steps: create a provider order on the server, verify the result server-side, and handle signed webhooks.

---

## 7. Email and newsletter

- **Enquiries (Resend):** create an account, verify your sending domain (DNS records), create an API key, and set `RESEND_API_KEY`, `EMAIL_FROM`, `ENQUIRY_INBOX`. Replies go straight to the customer via `reply_to`. To use another provider, change only `src/lib/integrations/email.ts`.
- **Newsletter (Brevo):** create a contact list, an API key, and set `BREVO_API_KEY` and `BREVO_LIST_ID`. Consider enabling double opt-in in Brevo. Another provider means editing only `src/lib/integrations/newsletter.ts`.
- **WhatsApp:** set `contact.whatsappNumber` (digits with country code, e.g. `919800000000`). Product pages and the contact page then show WhatsApp links with the product name prefilled.

---

## 8. Deployment

**Vercel (simplest):** import the repository, add the environment variables, deploy. Run `npm run db:deploy` against your production database (locally, or as a build step).

**Any Node host:** `npm ci && npm run db:deploy && npm run build && npm start` behind HTTPS.

Notes:
- The built-in rate limiter is in-memory, per instance. On serverless or multi-instance hosting, replace `src/lib/rate-limit.ts` with a shared store (e.g. Upstash Redis); the interface is one function.
- Security headers are set in `next.config.ts`. If you add a Content Security Policy, allow `https://checkout.razorpay.com` (script and frame) and `https://api.razorpay.com`.
- Set `NEXT_PUBLIC_SITE_URL` to the production origin so canonical URLs and the sitemap are correct.

---

## 9. Testing checklist

### Verified while building

The build sandbox had no network access, so dependencies couldn't be installed there. What was verified:

- [x] **29 automated tests pass** (`npm test`): search; combined filters; price range; availability; sorting (unpriced last, featured rank, "Newest" only with real dates); URL query round-trip and junk rejection; related products; cart duplicate merging, quantity clamping, invalid-quantity coercion, corrupt-storage sanitising; purchase blocking (enquiry-only, unavailable, missing variant); sale-price rules; shipping and tax maths; INR formatting; server re-pricing that ignores client prices; stock limits; checkout, contact, and newsletter validation (Indian PIN, mobile, state); Razorpay payment and webhook signature verification; rate limiting; every image file exists; alt text; no dead internal links.
- [x] All application code type-checked in strict mode (`noUncheckedIndexedAccess`, no unused code) against minimal framework stubs. Framework API usage still needs the real check below.
- [x] Every demo image rendered and reviewed visually for consistency.

### Run on your machine before launch

- [ ] `npm install && npm run typecheck && npm run lint && npm test && npm run build`. Fix anything reported (likely limited to dependency version drift).
- [ ] Browse at 1440px, 1280px, 768px, and 375px: no horizontal scroll; mega-menu, mobile drawer, filter drawer, cart drawer.
- [ ] Keyboard only: skip link, menu and drawers open/close with Enter/Escape, focus returns to the trigger, focus is visible everywhere.
- [ ] Catalogue: category tabs, search + filters together, clear all, empty state, sort, shareable URLs, back button.
- [ ] Product page: thumbnails, finish selection, quantity limits, Add to Bag, Buy Now, Enquire (product prefilled on contact form).
- [ ] Bag: add twice (merges), change quantity, remove, empty state, persists after reload.
- [ ] Checkout validation messages; demo order page clearly says no order was created.
- [ ] Lighthouse: performance, accessibility, SEO, best practices.

### Before accepting real orders

- [ ] Real products with `demo: false`, verified specs, licensed photography
- [ ] Contact details in `src/config/contact.ts`
- [ ] Legal pages completed and professionally reviewed (bracketed sections)
- [ ] GST treatment decided (`commerce.tax`) and shipping methods configured (`commerce.shippingMethods`)
- [ ] Database provisioned and migrated
- [ ] Razorpay activated; test-mode flows passed; webhook configured; live keys set
- [ ] Resend domain verified; enquiry delivery tested
- [ ] Brevo list configured (optional)
- [ ] Brand name cleared (trademark, company, domain, handles)
- [ ] `announcement` text reviewed in `src/config/site.ts`
- [ ] Order notification emails to the business and customer (recommended next step)

### Not included in release one (by design)

- **Customer accounts.** No account icon is shown; checkout works as a guest. Adding accounts needs secure authentication (e.g. Auth.js or Clerk) and authorisation on order history.
- **Admin panel.** Manage orders with Prisma Studio or your database console until an authenticated admin is built.
#   a u r e l l e - a u d i o - s t o r e  
 