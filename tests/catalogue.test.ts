import { test } from "node:test";
import assert from "node:assert/strict";
import { products } from "@/data/products";
import { buildFacets, emptyQuery, filterProducts, parseQuery, serializeQuery, sortProducts, relatedProducts, canSortByNewest } from "@/lib/catalogue";
import { fromPrice } from "@/lib/product-rules";

test("search matches name, category and connectivity, all terms required", () => {
  assert.deepEqual(filterProducts(products, { ...emptyQuery, q: "atelier" }).map((p) => p.slug).sort(), ["atelier-b1", "atelier-b2"]);
  assert.ok(filterProducts(products, { ...emptyQuery, q: "HDMI" }).every((p) => p.connectivity?.includes("HDMI eARC")));
  assert.equal(filterProducts(products, { ...emptyQuery, q: "halo bluetooth" }).length, 0);
  assert.ok(filterProducts(products, { ...emptyQuery, q: "soundbar" }).some((p) => p.slug === "vela-soundbar"));
});

test("filters combine (AND across groups, OR within a group)", () => {
  const r = filterProducts(products, { ...emptyQuery, categories: ["bookshelf", "soundbars"], connectivity: ["Binding posts"] });
  assert.deepEqual(r.map((p) => p.slug).sort(), ["atelier-b1", "atelier-b2"]);
  const withPrice = filterProducts(products, { ...emptyQuery, categories: ["soundbars"], connectivity: ["HDMI eARC"] });
  assert.ok(withPrice.length >= 2 && withPrice.every(p => p.categoryId === "soundbars"));
});

test("availability filter respects purchase mode and status", () => {
  const enquiry = filterProducts(products, { ...emptyQuery, availability: ["enquiry"] });
  assert.ok(enquiry.length > 0 && enquiry.every((p) => p.purchaseMode === "enquiry"));
  const buy = filterProducts(products, { ...emptyQuery, availability: ["purchase"] });
  assert.ok(buy.every((p) => p.purchaseMode === "purchase" || p.availability === "in_stock"));
});

test("price range excludes unpriced products", () => {
  const r = filterProducts(products, { ...emptyQuery, minPrice: 0 });
  assert.ok(r.every((p) => fromPrice(p) !== null));
});

test("sorting by price puts unpriced items last in both directions", () => {
  for (const s of ["price-asc", "price-desc"] as const) {
    const sorted = sortProducts(products, s);
    const firstUnpriced = sorted.findIndex((p) => fromPrice(p) === null);
    assert.ok(sorted.slice(firstUnpriced).every((p) => fromPrice(p) === null));
    const priced = sorted.slice(0, firstUnpriced).map((p) => fromPrice(p)!);
    const expected = [...priced].sort((a, b) => (s === "price-asc" ? a - b : b - a));
    assert.deepEqual(priced, expected);
  }
});

test("featured sort follows featuredRank; name sort is alphabetical", () => {
  const f = sortProducts(products, "featured").slice(0, 4).map((p) => p.slug);
  assert.deepEqual(f, ["halo-ic6", "atelier-b2", "vela-soundbar", "cinema-c5"]);
  const n = sortProducts(products, "name").map((p) => p.name);
  assert.deepEqual(n, [...n].sort((a, b) => a.localeCompare(b)));
});

test("newest sort is only offered with genuine dates", () => {
  assert.equal(canSortByNewest(products), false);
  assert.ok(!buildFacets(products).sortOptions.some((o) => o.value === "newest"));
  const dated = products.slice(0, 2).map((p, i) => ({ ...p, createdAt: `2026-0${i + 1}-01` }));
  assert.equal(sortProducts(dated, "newest")[0]!.createdAt, "2026-02-01");
});

test("facets hide brand filter when only one brand exists", () => {
  assert.equal(buildFacets(products).brands.length, 1);
});

test("query string round-trips and rejects junk", () => {
  const q = parseQuery(new URLSearchParams("q=speaker&category=ceiling-speakers,bogus&sort=price-desc&min=100&max=abc&availability=enquiry,hack"));
  assert.deepEqual(q.categories, ["ceiling-speakers"]);
  assert.equal(q.sort, "price-desc");
  assert.equal(q.minPrice, 100);
  assert.equal(q.maxPrice, undefined);
  assert.deepEqual(q.availability, ["enquiry"]);
  assert.deepEqual(parseQuery(new URLSearchParams(serializeQuery(q))), q);
});

test("related products prefer the same category and exclude self", () => {
  const b2 = products.find((p) => p.slug === "atelier-b2")!;
  const rel = relatedProducts(products, b2);
  assert.ok(!rel.includes(b2));
  assert.equal(rel[0]!.categoryId, "bookshelf");
});

test("demo data integrity: unique ids/slugs, images exist per product, non-negative prices", () => {
  const ids = new Set(products.map((p) => p.id));
  const slugs = new Set(products.map((p) => p.slug));
  assert.equal(ids.size, products.length);
  assert.equal(slugs.size, products.length);
  const srcs = products.flatMap((p) => p.images.map((i) => i.src));
  assert.equal(new Set(srcs).size, srcs.length, "no image reused across products");
  for (const p of products) {
    assert.ok(p.images.length > 0);
    if (p.priceMinor !== undefined) assert.ok(Number.isInteger(p.priceMinor) && p.priceMinor > 0);
    if (p.purchaseMode === "purchase") assert.ok(p.priceMinor !== undefined || p.variants?.every((v) => v.priceMinor !== undefined));
  }
});
