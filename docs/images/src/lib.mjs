// Shared parts for the Arthai Health README figures.
// Uses only the anatomy kit core: kit/iso-kit.mjs (MIT, Copyright (c) 2026 Ryan),
// wheresryan22/anatomy at commit 1482e8469b0a9e0d8cc18ea2740a01423d29ae80.
// Set ANATOMY_KIT to the path of that kit/iso-kit.mjs file. The build checks its sha256 before import.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

export const KIT_COMMIT = "1482e8469b0a9e0d8cc18ea2740a01423d29ae80";
export const KIT_SHA256 = "6d3ecc725d30c3b0346da309cf61dfa5a65017c23620bbd4093009d4fb104018";

const KIT = process.env.ANATOMY_KIT;
if (!KIT) {
  console.error("Set ANATOMY_KIT to the path of kit/iso-kit.mjs from wheresryan22/anatomy at " + KIT_COMMIT + ".");
  process.exit(2);
}
// Read the kit once, check the bytes, then import those same bytes. The kit has no import statements.
const bytes = readFileSync(KIT);
const got = createHash("sha256").update(bytes).digest("hex");
if (got !== KIT_SHA256) {
  console.error(`ANATOMY_KIT sha256 is ${got}. Expected ${KIT_SHA256} (commit ${KIT_COMMIT}). Stop.`);
  process.exit(3);
}
export const k = await import("data:text/javascript;base64," + bytes.toString("base64"));

export function makeScene(P) {
  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (pts, style) => k.dotsSvg(pts, style);
  const slab = (plan, z, h, style = {}, steps = 3, bevel = 0.5) => S(k.slabOf(plan, z, h, P, steps, bevel), style);
  const cyl = (cx, cy, r, z, h, style = {}, steps = 28, bevel = 0) => S(k.cylinder(cx, cy, r, z, h, P, steps, bevel), style);
  const screws = (plan, inset, z, size = 0.5) => D(k.corners(plan, inset).map(([x, y]) => at([x, y, z])), { size, tone: "mid" });
  // Text on the front face (y = plan.y + plan.d), reading along +x. zTop is the baseline height.
  // Part text smaller than MIN_TEXT is too small to read at the 830 px GitHub width.
  // It is not drawn. The legend carries those facts.
  const MIN_TEXT = 8;
  const drop = (text) => { DROPPED.add(String(text)); return ""; };
  const front = (x, y, z, text, size = 6, tone = "hi") => (size < MIN_TEXT ? drop(text) : k.faceTextSvg(k.sideMatrix([x, y], z, P, "left"), text, { size, tone }));
  const top = (x, y, z, text, size = 5, tone = "hi") => (size < MIN_TEXT ? drop(text) : k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone }));
  // A painted track on a top face. Chevrons painted on long segments show the direction of flow.
  function track(pts, z, tone = "mid", opts = {}) {
    const w = opts.width ?? 2;
    let out = L(k.onTop(pts, z, P), { tone, ...opts }).replace("<path", `<path style="stroke-width:${w}px"`);
    if (opts.chev !== false) {
      for (let i = 1; i < pts.length; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
        const len = Math.hypot(x1 - x0, y1 - y0);
        if (len < (opts.chevMin ?? 24)) continue;
        const ux = (x1 - x0) / len, uy = (y1 - y0) / len, c = 4.5;
        const mx = (x0 + x1) / 2 + ux * c / 2, my = (y0 + y1) / 2 + uy * c / 2;
        const a = [mx - ux * c - uy * c, my - uy * c + ux * c], b = [mx - ux * c + uy * c, my - uy * c - ux * c];
        out += L(k.lineOnTop(a, [mx, my], z, P) + k.lineOnTop([mx, my], b, z, P), { tone, free: true }).replace("<path", `<path style="stroke-width:${w}px"`);
      }
    }
    out += D([at([...pts[0], z]), at([...pts.at(-1), z])], { size: 2.2, tone });
    // opts.color: a fourth accent colour for the "hi" tone (the kit has red, green and blue only).
    return opts.color ? `<g style="--anatomy-hi:${opts.color};--anatomy-dot:${opts.color}">${out}</g>` : out;
  }

  // A bench: plate, feet, groove, corner screws and a ruler strip on the front edge.
  function bench(plan, h = 10) {
    const out = [`<path class="iso-halo" d="${k.haloOf(plan, -h - 5, h, P)}"/>`];
    for (const [x, y] of k.corners(plan, 18)) {
      out.push(cyl(x, y, 6, -h - 5, 1.4, { tone: "lo" }), cyl(x, y, 4.6, -h - 3.6, 3.6, { tone: "mid" }));
    }
    out.push(slab(plan, -h, h, { tone: "mid" }, 8, 1.4));
    out.push(L(k.planOutline(k.insetPlan(plan, 5), 0, P), { tone: "lo" }));
    const sc = k.corners(plan, 10);
    out.push(L(sc.map(([x, y]) => k.ring(x, y, 2, 0, P, 14)).join(""), { tone: "lo" }));
    out.push(D(sc.map(([x, y]) => at([x, y, 0])), { size: 0.5 }));
    const strip = { x: plan.x + 24, y: plan.y + plan.d - 13, w: plan.w - 48, d: 6, r: 1 };
    out.push(slab(strip, 0, 0.6, { tone: "lo", crease: "none" }));
    const t = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 5, 5, strip.y + 0.6, 0.6, [1.8, 3.4], P);
    out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
    return out.join("");
  }

  // A plinth with a label plate on its front face: number, name, and a PLANNED tag.
  function plinth(plan, h, { num, name, sub, tag = "PLANNED", size = 6.4, tone = "mid" } = {}) {
    const out = [];
    out.push(`<path class="iso-halo" d="${k.haloOf(plan, 0, 0.1, P)}" style="filter:blur(3px)"/>`);
    out.push(slab(plan, 0, h, { tone }, 4, 0.8));
    out.push(L(k.planOutline(k.insetPlan(plan, 3), h, P, 3), { tone: "faint" }));
    out.push(screws(plan, 4, h, 0.45));
    const y = plan.y + plan.d;
    const lines = [num ? `${num} ${name}` : name, tag].filter(Boolean); // sub lines are in the legend
    const gap = size * 1.3;
    lines.forEach((line, i) => {
      const s = i === 0 ? size : size * 0.86;
      const t = "hi";
      const base = h - 3 - size - i * gap;
      if (base < 1) console.warn(`plinth "${name}": line ${i + 1} is below the plinth (baseline ${base.toFixed(1)})`);
      if (line.length * s * 0.62 > plan.w - 12) console.warn(`plinth "${name}": "${line}" is wider than the plinth`);
      out.push(front(plan.x + 7, y, base, line, s, t));
    });
    return out.join("");
  }

  // A stack of synthetic document cards. Top card carries an ID and rule lines.
  function cards(x, y, z, { n = 3, w = 30, d = 20, id, lit = false, rules = 3, idSize } = {}) {
    const out = [];
    for (let i = 0; i < n; i++) {
      const plan = { x: x + i * 1.2, y: y - i * 1.2, w, d, r: 1 };
      out.push(slab(plan, z + i * 1.4, 1.2, { tone: i === n - 1 ? "hi" : "mid", lit: lit && i === n - 1, crease: "none" }, 2, 0));
    }
    const tz = z + n * 1.4 - 0.2;
    const tx = x + (n - 1) * 1.2, ty = y - (n - 1) * 1.2;
    const isz = idSize ?? Math.min(4.2, w / (id?.length * 0.62 || 1));
    if (id) out.push(top(tx + 3, ty + 3 + isz, tz, id, isz, "hi"));
    for (let r = 0; r < rules; r++) {
      const ry = ty + 6 + (idSize ?? 4) + r * 3.4;
      if (ry > ty + d - 2) break;
      out.push(L(k.lineOnTop([tx + 3, ry], [tx + w - 3 - r * 4, ry], tz, P), { tone: "lo", free: true }));
    }
    return out.join("");
  }

  // An open tray: floor plus four walls. Put contents between back() and front().
  function tray(plan, z, h = 5, wall = 1.2) {
    const back = [
      slab(plan, z, 1.2, { tone: "mid" }, 3, 0.4),
      slab({ x: plan.x, y: plan.y, w: plan.w, d: wall, r: 0.4 }, z + 1.2, h, { tone: "mid" }, 2, 0),
      slab({ x: plan.x, y: plan.y, w: wall, d: plan.d, r: 0.4 }, z + 1.2, h, { tone: "mid" }, 2, 0),
    ].join("");
    const frontWalls = [
      slab({ x: plan.x + plan.w - wall, y: plan.y, w: wall, d: plan.d, r: 0.4 }, z + 1.2, h, { tone: "mid" }, 2, 0),
      slab({ x: plan.x, y: plan.y + plan.d - wall, w: plan.w, d: wall, r: 0.4 }, z + 1.2, h, { tone: "mid" }, 2, 0),
    ].join("");
    return { back, front: frontWalls };
  }

  // A round dial gauge lying on a face, with ticks and a needle at a fraction of the scale.
  function gauge(cx, cy, z, r, frac, { lit = true, tone = "hi", h = 4 } = {}) {
    const out = [];
    out.push(cyl(cx, cy, r, z, h, { tone }, 48, 0.6));
    out.push(L(k.ring(cx, cy, r - 1.6, z + h, P, 48), { tone: "lo" }));
    const span = Math.PI * 1.5, from = -Math.PI * 0.75;
    const t = k.radialTicks(cx, cy, r - 2.2, 20, 5, z + h, [1, 2.2], P, from, span);
    out.push(L(t.minor, { tone: "lo" }), L(t.major, { tone: "mid" }));
    const a = from + frac * span;
    out.push(L(k.lineOnTop([cx, cy], [cx + Math.sin(a) * (r - 3), cy - Math.cos(a) * (r - 3)], z + h + 0.1, P), { tone: lit ? "lit" : "hi", free: "end" }));
    out.push(D([at([cx, cy, z + h + 0.1])], { size: 0.9, tone: "hi" }));
    return out.join("");
  }

  const knob = (cx, cy, z, r = 3.4, h = 3) =>
    cyl(cx, cy, r, z, h, { tone: "mid" }, 24) + L(k.knurl(cx, cy, r, z, z + h, 22, P), { tone: "lo" });
  const led = (cx, cy, z, tone = "green") => cyl(cx, cy, 1.4, z, 0.8, { tone: "lo" }, 14) + D([at([cx, cy, z + 0.8])], { size: 1.3, tone });

  // A screen standing on the back of a plinth: thin slab with text rows on its front face.
  function screen(plan, z, h, rows = [], { size = 4.2 } = {}) {
    const out = [slab(plan, z, h, { tone: "mid" }, 3, 0.6)];
    const fy = plan.y + plan.d;
    const inner = { x: plan.x + 2, w: plan.w - 4 };
    out.push(L(k.segment([inner.x, fy, z + 2], [inner.x + inner.w, fy, z + 2], P) + k.segment([inner.x, fy, z + h - 2], [inner.x + inner.w, fy, z + h - 2], P), { tone: "faint" }));
    let zz = z + h - 3;
    rows.forEach((row) => {
      const sz = row.size ?? size;
      zz -= sz * 1.5;
      out.push(front(inner.x + 2, fy, zz, row.text ?? row, sz, row.tone ?? "hi"));
    });
    return out.join("");
  }

  // A link between two stations that runs in the open aisle in front of both, so that no plinth hides it.
  // fromX and toX are x positions on the front edge of each station. aisle is the y of the aisle.
  function link(A, fromX, B, toX, aisle, tone = "hi", opts = {}) {
    const a = A.y + A.d + 6, b = B.y + B.d + 6;
    return track([[fromX, a], [fromX, aisle], [toX, aisle], [toX, b]], z0, tone, opts);
  }
  const z0 = 0.4;

  return { link, at, S, L, D, slab, cyl, screws, front, top, track, bench, plinth, cards, tray, gauge, knob, led, screen };
}

// The card frame around a figure: Fig n, title, hint, readout and a legend under the drawing.
export function frame({ W, H, drawH, fig, title, hint, readout, legend = [], cols = 2 }) {
  const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const out = [];
  out.push(`<rect x="0" y="0" width="${W}" height="${H}" fill="var(--anatomy-page)"/>`);
  out.push(`<rect x="16" y="16" width="${W - 32}" height="${drawH - 16}" rx="14" fill="var(--anatomy-card)" stroke="var(--anatomy-faint)" stroke-width="1"/>`);
  const t = (x, y, s, size, fill, anchor = "start", weight = 400) =>
    `<text x="${x}" y="${y}" font-family="ui-monospace,SFMono-Regular,Menlo,Consolas,monospace" font-size="${size}" fill="var(--anatomy-${fill})" text-anchor="${anchor}" font-weight="${weight}">${esc(s)}</text>`;
  out.push(t(36, 46, fig, 13, "muted"));
  out.push(t(36 + fig.length * 8 + 16, 46, "PLANNED · NOT BUILT", 13, "strong", "start", 700));
  out.push(t(W - 36, 46, title, 15, "strong", "end", 600));
  out.push(t(36, drawH - 18, hint, 12, "text"));
  out.push(t(W - 36, drawH - 18, readout, 12, "strong", "end"));
  const LH = 23;
  const colW = (W - 72) / cols;
  const rows = Math.ceil(legend.length / cols);
  const need = drawH + 32 + (rows - 1) * LH + 24;
  if (need > H) console.warn(`${fig}: legend needs H >= ${need}, H is ${H}`);
  legend.forEach((item, i) => {
    const c = Math.floor(i / rows), r = i % rows;
    if (!item.trim()) return;
    const indent = /^\s+/.test(item) ? 30 : 0;
    const head = /^Tracks/.test(item);
    if (item.trim().length * 15 * 0.6 > colW - indent - 8) console.warn(`${fig}: legend line too long: ${item.trim()}`);
    out.push(t(36 + c * colW + indent, drawH + 32 + r * LH, item.trim(), 15, head ? "strong" : "text", "start", head ? 600 : 400));
  });
  return out.join("");
}

const NOTICE = "<!-- Built with the anatomy kit (kit/iso-kit.mjs), Copyright (c) 2026 Ryan, MIT License. Commit " + KIT_COMMIT + ". The embedded CSS comes from that kit. See docs/images/NOTICE-anatomy-MIT.txt. All data in this figure is synthetic. -->";

// Text that the scene did not draw. The alt text must not name it.
const DROPPED = new Set();

export function writeFigure(path, { W, H, label, body }) {
  const esc = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const bad = [...DROPPED].filter((t) => t.length >= 3 && new RegExp(`\\b${esc(t)}\\b`, "i").test(label));
  if (bad.length) {
    console.error(`${path}: the alt text names text that is not drawn: ${bad.join(", ")}`);
    process.exit(4);
  }
  const svg = NOTICE + "\n" + `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="iso iso-svg" data-theme="light" role="img" aria-label="${label.replace(/"/g, "&quot;")}"><title>${label.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</title><style>${k.ISO_CSS}</style>${body.join("")}</svg>\n`;
  writeFileSync(path, svg);
}
