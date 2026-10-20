/**
 * Generates the original DEMO illustrations in public/media/demo.
 * These stand in for photography until real, licensed product images exist.
 * Run: npm run media:demo
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const OUT = join(process.cwd(), "public/media/demo");
mkdirSync(OUT, { recursive: true });

const C = { obsidian: "#080A0E", midnight: "#0B1426", surface: "#111D32", gold: "#C5A15A", champagne: "#E4CC9A", line: "#263044", muted: "#9AA3B2" };


// ── Shared definitions ─────────────────────────────────────────────
function defs(finish: string) {
  return `
  <linearGradient id="cab" x1="0" x2="1" y1="0" y2="0">
    <stop offset="0" stop-color="${shade(finish, 0.35)}"/><stop offset="0.08" stop-color="${shade(finish, 0.12)}"/>
    <stop offset="0.6" stop-color="${shade(finish, -0.05)}"/><stop offset="1" stop-color="${shade(finish, -0.35)}"/>
  </linearGradient>
  <linearGradient id="side" x1="0" x2="1"><stop offset="0" stop-color="${shade(finish, -0.45)}"/><stop offset="1" stop-color="${shade(finish, -0.65)}"/></linearGradient>
  <linearGradient id="top" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${shade(finish, 0.45)}"/><stop offset="1" stop-color="${shade(finish, 0.15)}"/></linearGradient>
  <radialGradient id="cone" cx="0.42" cy="0.38" r="0.7">
    <stop offset="0" stop-color="#2a3142"/><stop offset="0.55" stop-color="#0d1119"/><stop offset="1" stop-color="#05070a"/>
  </radialGradient>
  <radialGradient id="cap" cx="0.35" cy="0.3" r="0.8"><stop offset="0" stop-color="#4a5163"/><stop offset="1" stop-color="#0b0e14"/></radialGradient>
  <radialGradient id="pool" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${C.champagne}" stop-opacity="0.16"/><stop offset="1" stop-color="${C.champagne}" stop-opacity="0"/></radialGradient>
  <radialGradient id="shadow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000" stop-opacity="0.75"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient>
  <linearGradient id="floor" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.midnight}"/><stop offset="1" stop-color="${C.obsidian}"/></linearGradient>
  <linearGradient id="wall" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#05070b"/><stop offset="1" stop-color="#0a1120"/></linearGradient>
  <linearGradient id="shaft" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${C.champagne}" stop-opacity="0.22"/><stop offset="1" stop-color="${C.champagne}" stop-opacity="0"/></linearGradient>
  <linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.5"/></linearGradient>`;
}

function shade(hex: string, amt: number) {
  const n = parseInt(hex.slice(1), 16);
  const ch = (v: number) => Math.max(0, Math.min(255, Math.round(amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
  const r = ch((n >> 16) & 255), g = ch((n >> 8) & 255), b = ch(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

const svg = (w: number, h: number, finish: string, body: string, label = true) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>${defs(finish)}</defs>
${body}
${label ? `<text x="${w - 36}" y="${h - 32}" text-anchor="end" font-family="Helvetica, Arial, sans-serif" font-size="${Math.round(w / 70)}" fill="${C.muted}" fill-opacity="0.55" letter-spacing="2">DEMO ILLUSTRATION</text>` : ""}
</svg>`;

// ── Scene pieces ──────────────────────────────────────────────────
function room(w: number, h: number, floorY: number, lightX: number, opts: { panels?: boolean; rings?: boolean } = {}) {
  let s = `<rect width="${w}" height="${h}" fill="url(#wall)"/>`;
  if (opts.panels) for (let x = 0; x < w; x += w / 9) s += `<rect x="${x}" y="0" width="1" height="${floorY}" fill="${C.line}" opacity="0.35"/>`;
  s += `<rect y="${floorY}" width="${w}" height="${h - floorY}" fill="url(#floor)"/>`;
  s += `<rect y="${floorY}" width="${w}" height="1" fill="${C.line}"/>`;
  s += `<ellipse cx="${lightX}" cy="${-h * 0.1}" rx="${w * 0.5}" ry="${h * 0.9}" fill="url(#pool)" opacity="0.9"/>`;
  if (opts.rings) {
    const cx = lightX, cy = floorY * 0.55;
    for (let i = 1; i <= 7; i++) s += `<circle cx="${cx}" cy="${cy}" r="${i * w * 0.07}" fill="none" stroke="${C.gold}" stroke-opacity="${0.09 - i * 0.01}" stroke-width="1"/>`;
  }
  return s;
}

function driver(cx: number, cy: number, r: number, sx = 1) {
  const e = (rr: number) => `rx="${rr * sx}" ry="${rr}"`;
  return `<g>
    <ellipse cx="${cx}" cy="${cy}" ${e(r * 1.08)} fill="#05070a"/>
    <ellipse cx="${cx}" cy="${cy}" ${e(r)} fill="url(#cone)"/>
    <ellipse cx="${cx}" cy="${cy}" ${e(r)} fill="none" stroke="${C.gold}" stroke-opacity="0.75" stroke-width="${Math.max(1, r * 0.035)}"/>
    <ellipse cx="${cx}" cy="${cy}" ${e(r * 0.84)} fill="none" stroke="#3a4255" stroke-width="${Math.max(1, r * 0.05)}" stroke-opacity="0.8"/>
    <ellipse cx="${cx}" cy="${cy}" ${e(r * 0.3)} fill="url(#cap)"/>
  </g>`;
}

function tweeter(cx: number, cy: number, r: number, sx = 1) {
  return `<g><ellipse cx="${cx}" cy="${cy}" rx="${r * 1.5 * sx}" ry="${r * 1.5}" fill="#06080c"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${r * sx}" ry="${r}" fill="url(#cap)"/>
    <ellipse cx="${cx}" cy="${cy}" rx="${r * 1.5 * sx}" ry="${r * 1.5}" fill="none" stroke="${C.gold}" stroke-opacity="0.8" stroke-width="${Math.max(1, r * 0.08)}"/></g>`;
}

type DriverSpec = { t: "w" | "t"; y: number; r: number; x?: number };

/** Box speaker. depth > 0 renders a three-quarter view. */
function box(x: number, y: number, w: number, h: number, drivers: DriverSpec[], depth = 0, rx = 10) {
  let s = `<ellipse cx="${x + w / 2 + depth / 2}" cy="${y + h + 6}" rx="${w * 0.75 + depth}" ry="${Math.max(16, w * 0.09)}" fill="url(#shadow)"/>`;
  if (depth) {
    const dy = depth * 0.28;
    s += `<polygon points="${x + w},${y} ${x + w + depth},${y - dy} ${x + w + depth},${y + h - dy} ${x + w},${y + h}" fill="url(#side)"/>`;
    s += `<polygon points="${x},${y} ${x + depth},${y - dy} ${x + w + depth},${y - dy} ${x + w},${y}" fill="url(#top)"/>`;
  }
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${depth ? 2 : rx}" fill="url(#cab)"/>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${depth ? 2 : rx}" fill="url(#fade)"/>`;
  s += `<rect x="${x + 1}" y="${y + 1}" width="${w - 2}" height="1.5" fill="#fff" opacity="0.12"/>`;
  const sx = depth ? 0.86 : 1;
  for (const d of drivers) {
    const cx = x + (d.x ?? 0.5) * w;
    s += d.t === "w" ? driver(cx, y + d.y * h, d.r * w, sx) : tweeter(cx, y + d.y * h, d.r * w, sx);
  }
  return s;
}

function reflection(content: string, axisY: number, opacity = 0.12) {
  return `<g transform="translate(0 ${axisY * 2}) scale(1 -1)" opacity="${opacity}">${content}</g>`;
}

// ── Product shapes ────────────────────────────────────────────────
type Shape = (cx: number, baseY: number, scale: number, depth: number) => string;

const shapes: Record<string, Shape> = {
  tower: (cx, by, k, d) => { const w = 210 * k, h = 820 * k; return box(cx - w / 2, by - h, w, h, [{ t: "t", y: 0.1, r: 0.11 }, { t: "w", y: 0.25, r: 0.3 }, { t: "w", y: 0.5, r: 0.36 }, { t: "w", y: 0.74, r: 0.36 }], d * k, 14 * k); },
  bookshelf: (cx, by, k, d) => { const w = 300 * k, h = 470 * k; return box(cx - w / 2, by - h, w, h, [{ t: "t", y: 0.24, r: 0.07 }, { t: "w", y: 0.62, r: 0.3 }], d * k, 12 * k); },
  bookshelfSmall: (cx, by, k, d) => { const w = 250 * k, h = 360 * k; return box(cx - w / 2, by - h, w, h, [{ t: "t", y: 0.25, r: 0.08 }, { t: "w", y: 0.64, r: 0.28 }], d * k, 10 * k); },
  pebble: (cx, by, k) => {
    const w = 420 * k, h = 300 * k, x = cx - w / 2, y = by - h; let s = `<ellipse cx="${cx}" cy="${by + 4}" rx="${w * 0.65}" ry="${28 * k}" fill="url(#shadow)"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="url(#cab)"/>`;
    for (let i = 1; i < 22; i++) s += `<line x1="${x + h * 0.2}" x2="${x + w - h * 0.2}" y1="${y + (i * h) / 22}" y2="${y + (i * h) / 22}" stroke="#000" stroke-opacity="0.18" stroke-width="${1.2 * k}"/>`;
    s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="url(#fade)"/>`;
    s += `<circle cx="${cx}" cy="${y + h * 0.18}" r="${6 * k}" fill="${C.gold}" opacity="0.8"/>`;
    return s;
  },
  field: (cx, by, k, d) => {
    const w = 560 * k, h = 300 * k, x = cx - w / 2, y = by - h;
    let s = `<path d="M ${x + w * 0.22} ${y + 4} C ${x + w * 0.22} ${y - h * 0.5}, ${x + w * 0.78} ${y - h * 0.5}, ${x + w * 0.78} ${y + 4}" fill="none" stroke="${C.line}" stroke-width="${16 * k}" stroke-linecap="round"/>`;
    s += box(x, y, w, h, [{ t: "w", y: 0.52, r: 0.2, x: 0.27 }, { t: "w", y: 0.52, r: 0.2, x: 0.73 }, { t: "t", y: 0.52, r: 0.035, x: 0.5 }], d * k, h * 0.22);
    return s;
  },
  system: (cx, by, k, d) => {
    let s = shapes.tower!(cx - 330 * k, by, k * 0.62, d) + shapes.tower!(cx + 330 * k, by, k * 0.62, d);
    const w = 520 * k, h = 150 * k; s += box(cx - w / 2, by - h, w, h, [{ t: "w", y: 0.5, r: 0.11, x: 0.2 }, { t: "t", y: 0.5, r: 0.035, x: 0.5 }, { t: "w", y: 0.5, r: 0.11, x: 0.8 }], d * k, 10 * k);
    return s;
  },
  soundbar: (cx, by, k, d) => {
    const sw = 900 * k, sh = 500 * k; let s = `<rect x="${cx - sw / 2}" y="${by - 140 * k - sh}" width="${sw}" height="${sh}" rx="4" fill="#04060a" stroke="${C.line}"/>`;
    s += `<rect x="${cx - sw / 2 + 6}" y="${by - 140 * k - sh + 6}" width="${sw - 12}" height="${sh - 12}" fill="url(#pool)" opacity="0.35"/>`;
    const w = 860 * k, h = 90 * k; s += box(cx - w / 2, by - h, w, h, [...[0.12, 0.3, 0.7, 0.88].map((x): DriverSpec => ({ t: "w", y: 0.5, r: 0.035, x })), { t: "t", y: 0.5, r: 0.012, x: 0.5 }], d * k * 0.5, 20 * k);
    return s;
  },
  sub: (cx, by, k, d) => { const w = 440 * k, h = 440 * k; return box(cx - w / 2, by - h, w, h, [{ t: "w", y: 0.5, r: 0.38 }], d * k, 16 * k); },
  pa: (cx, by, k, d) => {
    const w = 400 * k, h = 640 * k, x = cx - w / 2, y = by - h;
    let s = box(x, y, w, h, [{ t: "w", y: 0.62, r: 0.4 }], d * k, 6 * k);
    s += `<path d="M ${x + w * 0.2} ${y + h * 0.1} L ${x + w * 0.8} ${y + h * 0.1} L ${x + w * 0.62} ${y + h * 0.3} L ${x + w * 0.38} ${y + h * 0.3} Z" fill="#05070a" stroke="${C.gold}" stroke-opacity="0.6" stroke-width="${2 * k}"/>`;
    for (let i = 0; i < 3; i++) s += `<circle cx="${x + w * (0.08 + i * 0.42)}" cy="${y + h * 0.04}" r="${5 * k}" fill="${C.line}"/>`;
    return s;
  },
  ceiling: (cx, cy, k) => {
    let s = ""; const r = 300 * k;
    s += `<circle cx="${cx}" cy="${cy}" r="${r * 1.12}" fill="#0c1424" stroke="${C.line}"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="#3a4357"/>`;
    for (let yy = -r; yy <= r; yy += 14 * k) for (let xx = -r; xx <= r; xx += 14 * k) if (xx * xx + yy * yy < (r - 10) ** 2) s += `<circle cx="${cx + xx}" cy="${cy + yy}" r="${3.4 * k}" fill="#0b0f18"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${C.gold}" stroke-opacity="0.85" stroke-width="${7 * k}"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="${r * 1.12}" fill="none" stroke="#fff" stroke-opacity="0.08" stroke-width="${3 * k}"/>`;
    return s;
  },
};

// ── Product views ─────────────────────────────────────────────────
const W = 1200, H = 1500;

function productFront(shape: string, finish: string, k = 1) {
  const floor = H * 0.78;
  const draw = shapes[shape]!;
  if (shape === "ceiling") {
    return svg(W, H, finish, `<rect width="${W}" height="${H}" fill="#0f1828"/><rect width="${W}" height="${H}" fill="url(#wall)" opacity="0.6"/><ellipse cx="${W / 2}" cy="${H * 0.45}" rx="${W * 0.6}" ry="${H * 0.5}" fill="url(#pool)"/>` + draw(W / 2, H * 0.46, k, 0));
  }
  const body = draw(W / 2, floor, k, 0);
  return svg(W, H, finish, room(W, H, floor, W / 2, { panels: true }) + reflection(body, floor) + body);
}

function productAngle(shape: string, finish: string, k = 1) {
  const floor = H * 0.8;
  const draw = shapes[shape]!;
  if (shape === "ceiling") {
    return svg(W, H, finish, `<rect width="${W}" height="${H}" fill="#0c1424"/><ellipse cx="${W * 0.3}" cy="${H * 0.2}" rx="${W * 0.7}" ry="${H * 0.6}" fill="url(#pool)"/><g transform="translate(${W / 2} ${H * 0.5}) scale(1 0.55) translate(${-W / 2} ${-H * 0.5})">${draw(W / 2, H * 0.5, k * 1.1, 0)}</g>`);
  }
  const body = draw(W * 0.46, floor, k * 0.95, 110);
  return svg(W, H, finish, room(W, H, floor, W * 0.25) + reflection(body, floor, 0.08) + body);
}

function productDetail(finish: string, variant = 0) {
  const r = 380 + variant * 20;
  const cx = W * (0.5 + (variant % 2 ? 0.08 : -0.04)), cy = H * 0.52;
  let s = `<rect width="${W}" height="${H}" fill="url(#cab)"/><rect width="${W}" height="${H}" fill="url(#fade)"/>`;
  s += `<circle cx="${cx}" cy="${cy}" r="${r * 1.22}" fill="none" stroke="#000" stroke-opacity="0.45" stroke-width="18"/>`;
  for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2 + 0.3; s += `<circle cx="${cx + Math.cos(a) * r * 1.12}" cy="${cy + Math.sin(a) * r * 1.12}" r="9" fill="#0b0e14" stroke="${C.gold}" stroke-opacity="0.5"/>`; }
  s += driver(cx, cy, r);
  for (let i = 1; i < 5; i++) s += `<circle cx="${cx}" cy="${cy}" r="${r * (0.36 + i * 0.1)}" fill="none" stroke="#fff" stroke-opacity="0.025"/>`;
  return svg(W, H, finish, s);
}

// ── Catalogue ─────────────────────────────────────────────────────
const productsSpec: { slug: string; shape: string; finish: string; k?: number }[] = [
  { slug: "monolith-f1", shape: "tower", finish: "#2b2f36", k: 1.15 },
  { slug: "atelier-b2", shape: "bookshelf", finish: "#16181d", k: 1.55 },
  { slug: "atelier-b1", shape: "bookshelfSmall", finish: "#5a4634", k: 1.75 },
  { slug: "pebble-p1", shape: "pebble", finish: "#2a2c33", k: 1.7 },
  { slug: "field-p2", shape: "field", finish: "#3b3a38", k: 1.45 },
  { slug: "cinema-c5", shape: "system", finish: "#1c1f26", k: 1.05 },
  { slug: "vela-soundbar", shape: "soundbar", finish: "#20232b", k: 1.1 },
  { slug: "depth-s10", shape: "sub", finish: "#14161b", k: 1.6 },
  { slug: "stage-pa12", shape: "pa", finish: "#121419", k: 1.2 },
  { slug: "halo-ic6", shape: "ceiling", finish: "#d9dbe0", k: 1.1 },
];

const write = (name: string, content: string) => writeFileSync(join(OUT, name), content);

productsSpec.forEach((p, i) => {
  write(`${p.slug}-front.svg`, productFront(p.shape, p.finish, p.k));
  write(`${p.slug}-angle.svg`, productAngle(p.shape, p.finish, p.k));
  write(`${p.slug}-detail.svg`, productDetail(p.finish, i));
});

// ── Editorial scenes ──────────────────────────────────────────────
function hero(w: number, h: number, speakerX: number) {
  const floor = h * 0.8;
  const k = h / 1400;
  const shaft = `<polygon points="${w * 0.18},0 ${w * 0.3},0 ${speakerX + 260 * k},${floor} ${speakerX - 120 * k},${floor}" fill="url(#shaft)"/>`;
  const body = shapes.tower!(speakerX, floor, k * 1.25, 70);
  return svg(w, h, "#23272f",
    room(w, h, floor, speakerX, { panels: true, rings: true }) + shaft +
    `<rect x="${w * 0.16}" y="${h * 0.06}" width="${w * 0.16}" height="${h * 0.02}" fill="${C.champagne}" opacity="0.08"/>` +
    reflection(body, floor, 0.1) + body, false);
}
write("hero-listening-room.svg", hero(2400, 1400, 1640));
write("hero-listening-room-portrait.svg", hero(1000, 1500, 620));

write("driver-closeup.svg", productDetail("#1b1e25", 3).replace("DEMO ILLUSTRATION", ""));

// Exploded cabinet view with restrained gold leader lines.
(() => {
  const w = 1600, h = 1200; let s = `<rect width="${w}" height="${h}" fill="${C.obsidian}"/>`;
  for (let x = 0; x < w; x += 40) s += `<line x1="${x}" x2="${x}" y1="0" y2="${h}" stroke="${C.line}" stroke-opacity="0.25"/>`;
  for (let y = 0; y < h; y += 40) s += `<line y1="${y}" y2="${y}" x1="0" x2="${w}" stroke="${C.line}" stroke-opacity="0.25"/>`;
  s += box(260, 230, 300, 760, [{ t: "t", y: 0.12, r: 0.11 }, { t: "w", y: 0.38, r: 0.34 }, { t: "w", y: 0.72, r: 0.34 }], 0, 8);
  s += `<g transform="translate(760 200)"><rect width="330" height="800" fill="none" stroke="${C.muted}" stroke-opacity="0.6"/>` +
    [160, 320, 480, 640].map((y) => `<rect x="0" y="${y}" width="330" height="10" fill="${C.line}"/>`).join("") +
    `<circle cx="165" cy="760" r="26" fill="none" stroke="${C.muted}" stroke-opacity="0.6"/><rect x="20" y="20" width="290" height="760" fill="none" stroke="${C.muted}" stroke-opacity="0.25" stroke-dasharray="6 8"/></g>`;
  s += `<g transform="translate(1180 330) skewY(-14)"><rect width="140" height="640" fill="url(#side)"/></g>`;
  const leader = (x1: number, y1: number, x2: number, y2: number) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${C.gold}" stroke-opacity="0.7" stroke-dasharray="4 6"/><circle cx="${x2}" cy="${y2}" r="6" fill="none" stroke="${C.gold}"/><circle cx="${x1}" cy="${y1}" r="3" fill="${C.gold}"/>`;
  s += leader(410, 321, 180, 140) + leader(410, 519, 180, 560) + leader(925, 520, 925, 120) + leader(925, 960, 1200, 1100);
  return write("cabinet-section.svg", svg(w, h, "#2b2f36", s));
})();

// Lifestyle scenes
(() => {
  const w = 1600, h = 1100, floor = h * 0.74;
  let s = room(w, h, floor, w * 0.5);
  s += `<rect x="${w * 0.36}" y="${h * 0.1}" width="${w * 0.28}" height="${floor - h * 0.1}" fill="#0f1a2e"/>`;
  s += `<rect x="${w * 0.36}" y="${h * 0.1}" width="${w * 0.28}" height="${floor - h * 0.1}" fill="url(#shaft)"/>`;
  s += `<line x1="${w * 0.5}" x2="${w * 0.5}" y1="${h * 0.1}" y2="${floor}" stroke="${C.obsidian}" stroke-width="6"/>`;
  s += `<rect x="${w * 0.3}" y="${floor - 120}" width="${w * 0.4}" height="120" fill="#141a26"/><rect x="${w * 0.3}" y="${floor - 120}" width="${w * 0.4}" height="3" fill="${C.gold}" opacity="0.35"/>`;
  s += `<ellipse cx="${w * 0.5}" cy="${h * 0.92}" rx="${w * 0.36}" ry="${h * 0.05}" fill="#101828"/>`;
  s += shapes.tower!(w * 0.2, floor, 0.85, 0) + shapes.tower!(w * 0.8, floor, 0.85, 0);
  s += `<path d="M ${w * 0.62} ${h} q 20 -150 140 -150 h 170 q 60 0 60 80 v 70 z" fill="#0d121c"/>`;
  write("lifestyle-living-room.svg", svg(w, h, "#3e2f24", s));
})();
(() => {
  const w = 1200, h = 1500, desk = h * 0.66;
  let s = room(w, h, desk, w * 0.5);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) s += `<rect x="${140 + i * 320}" y="${160 + j * 300}" width="280" height="260" fill="#0e1626" stroke="${C.line}"/>`;
  s += `<rect x="${w * 0.33}" y="${desk - 380}" width="${w * 0.34}" height="230" fill="#05070b" stroke="${C.line}"/>`;
  s += `<polyline points="${Array.from({ length: 40 }, (_, i) => `${w * 0.35 + i * 10},${desk - 265 + Math.sin(i * 0.9) * 30 * Math.sin(i * 0.2)}`).join(" ")}" fill="none" stroke="${C.gold}" stroke-opacity="0.7" stroke-width="2"/>`;
  s += `<rect x="${w * 0.48}" y="${desk - 150}" width="${w * 0.04}" height="150" fill="#0b0f18"/>`;
  s += shapes.bookshelf!(w * 0.2, desk, 0.62, 0) + shapes.bookshelf!(w * 0.8, desk, 0.62, 0);
  s += `<rect x="0" y="${desk}" width="${w}" height="24" fill="#1a2232"/>`;
  write("lifestyle-studio.svg", svg(w, h, "#17191e", s));
})();
(() => {
  const w = 1200, h = 1500, floor = h * 0.76;
  let s = `<rect width="${w}" height="${h}" fill="#04060a"/><rect y="${floor}" width="${w}" height="${h - floor}" fill="url(#floor)"/>`;
  s += `<rect x="0" y="120" width="${w}" height="10" fill="${C.line}"/>`;
  for (const x of [0.25, 0.5, 0.75]) s += `<polygon points="${w * x - 14},130 ${w * x + 14},130 ${w * x + 260},${floor} ${w * x - 260},${floor}" fill="url(#shaft)" opacity="0.7"/>`;
  s += shapes.pa!(w * 0.24, floor, 0.75, 60) + shapes.pa!(w * 0.76, floor, 0.75, 60);
  write("lifestyle-stage.svg", svg(w, h, "#16181d", s));
})();

// Collection tiles (distinct compositions from product shots)
const tile = (name: string, finish: string, inner: (w: number, h: number) => string) => write(name, svg(1200, 1500, finish, inner(1200, 1500)));
tile("collection-hifi.svg", "#2b2f36", (w, h) => { const f = h * 0.82; return room(w, h, f, w * 0.62, { rings: true }) + `<polygon points="${w * 0.4},0 ${w * 0.55},0 ${w * 0.8},${f} ${w * 0.45},${f}" fill="url(#shaft)"/>` + shapes.tower!(w * 0.62, f, 1.05, 60); });
tile("collection-home.svg", "#6b5440", (w, h) => { const f = h * 0.7; return room(w, h, h * 0.85, w * 0.4) + `<rect x="${w * 0.1}" y="${f}" width="${w * 0.8}" height="40" fill="#1a2232"/><rect x="${w * 0.12}" y="${f + 40}" width="${w * 0.76}" height="${h * 0.15 - 40}" fill="#0f1522"/>` + shapes.bookshelf!(w * 0.32, f, 0.9, 50) + `<rect x="${w * 0.6}" y="${f - 160}" width="22" height="160" fill="${C.line}"/><rect x="${w * 0.64}" y="${f - 110}" width="22" height="110" fill="#1d2738"/><rect x="${w * 0.68}" y="${f - 190}" width="22" height="190" fill="#141c2b"/>`; });
tile("collection-portable.svg", "#cbb89a", (w, h) => { const f = h * 0.66; return `<rect width="${w}" height="${h}" fill="#0a0f19"/><rect x="0" y="${f}" width="${w}" height="${h - f}" fill="#141b28"/><rect x="0" y="${f}" width="${w}" height="2" fill="${C.champagne}" opacity="0.25"/><ellipse cx="${w * 0.7}" cy="${h * 0.2}" rx="${w * 0.6}" ry="${h * 0.5}" fill="url(#pool)"/>` + shapes.pebble!(w * 0.45, f, 1.2, 0); });
tile("collection-theatre.svg", "#1c1f26", (w, h) => { const f = h * 0.78; return room(w, h, f, w * 0.5) + `<g transform="translate(${w * 0.5} ${f}) scale(0.75) translate(${-w * 0.5} ${-f})">${shapes.soundbar!(w * 0.5, f - 240, 1.1, 40)}</g>` + `<rect x="${w * 0.18}" y="${f - 210}" width="${w * 0.64}" height="30" fill="#141a26"/>` + shapes.sub!(w * 0.8, f, 0.55, 40); });
tile("collection-pro.svg", "#121419", (w, h) => { const f = h * 0.8; return `<rect width="${w}" height="${h}" fill="#04060a"/><rect y="${f}" width="${w}" height="${h - f}" fill="url(#floor)"/><polygon points="${w * 0.48},0 ${w * 0.56},0 ${w * 0.95},${f} ${w * 0.2},${f}" fill="url(#shaft)"/>` + shapes.pa!(w * 0.52, f, 1.1, 80); });
tile("collection-install.svg", "#d9dbe0", (w, h) => `<rect width="${w}" height="${h}" fill="#0d1626"/><ellipse cx="${w * 0.5}" cy="${h * 0.3}" rx="${w * 0.7}" ry="${h * 0.5}" fill="url(#pool)"/>` + `<g transform="translate(${w / 2} ${h * 0.45}) scale(1 0.6) translate(${-w / 2} ${-h * 0.45})">${shapes.ceiling!(w / 2, h * 0.45, 1.1, 0)}</g>` + `<rect x="0" y="${h * 0.8}" width="${w}" height="${h * 0.2}" fill="#0a111e"/>`);

console.log("Demo media written to", OUT);
