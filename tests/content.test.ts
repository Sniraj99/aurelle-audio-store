import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { products } from "@/data/products";
import { categories, collections } from "@/data/categories";
import { media } from "@/config/media";

const root = process.cwd();
const exists = (src: string) => existsSync(join(root, "public", src));

test("every referenced image exists on disk (no broken images)", () => {
  const srcs = [
    ...products.flatMap((p) => p.images.map((i) => i.src)),
    ...categories.map((c) => c.image.src),
    ...collections.map((c) => c.image.src),
    media.hero.src, media.heroMobile.src, media.intro.src, media.technology.src,
    ...Object.values(media.lifestyle).map((i) => i.src),
  ];
  const missing = srcs.filter((s) => !exists(s));
  assert.deepEqual(missing, []);
});

test("every image has meaningful alt text", () => {
  for (const p of products) for (const i of p.images) assert.ok(i.alt.length > 10, `${p.slug}: ${i.src}`);
});

test("internal links in source point at routes that exist", () => {
  const appDir = join(root, "src/app");
  const routes = new Set<string>(["/"]);
  const walk = (dir: string, prefix: string) => {
    for (const name of readdirSync(dir)) {
      const full = join(dir, name);
      if (statSync(full).isDirectory()) {
        if (name === "api") continue;
        walk(full, `${prefix}/${name}`);
      } else if (name === "page.tsx") routes.add(prefix || "/");
    }
  };
  walk(appDir, "");
  const files: string[] = [];
  const collect = (dir: string) => { for (const n of readdirSync(dir)) { const f = join(dir, n); statSync(f).isDirectory() ? collect(f) : /\.(tsx?|ts)$/.test(n) && files.push(f); } };
  collect(join(root, "src"));
  const hrefs = new Set<string>();
  for (const f of files) for (const m of readFileSync(f, "utf8").matchAll(/href[=:]\s*["'`{]*["'`](\/[a-z0-9\-/]*)/g)) hrefs.add(m[1]!);
  const ok = (h: string) => routes.has(h) || [...routes].some((r) => r.includes("[") && new RegExp(`^${r.replace(/\[[^\]]+\]/g, "[^/]+")}$`).test(h)) || h.startsWith("/products/") || h.startsWith("/order/");
  const dead = [...hrefs].filter((h) => !ok(h.replace(/\/$/, "") || "/"));
  assert.deepEqual(dead, [], `dead links: ${dead.join(", ")}`);
});
