// Shared parts for the Arthai Health README figures.
// Uses only the anatomy kit core (kit/iso-kit.mjs, MIT, wheresryan22/anatomy @ 1482e84).
// Set ANATOMY_KIT to the kit file. Default: the box copy in /workspace/tools/anatomy.
import { writeFileSync } from "node:fs";

const KIT = process.env.ANATOMY_KIT ?? "/workspace/tools/anatomy/kit/iso-kit.mjs";
export const k = await import(KIT);

export function makeScene(P) {
  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const L = (d, style) => k.lineSvg(d, style);
  const D = (pts, style) => k.dotsSvg(pts, style);
  const slab = (plan, z, h, style = {}, steps = 3, bevel = 0.5) => S(k.slabOf(plan, z, h, P, steps, bevel), style);
  const cyl = (cx, cy, r, z, h, style = {}, steps = 28, bevel = 0) => S(k.cylinder(cx, cy, r, z, h, P, steps, bevel), style);
  const screws = (plan, inset, z, size = 0.5) => D(k.corners(plan, inset).map(([x, y]) => at([x, y, z])), { size, tone: "mid" });
  // Text on the front face (y = plan.y + plan.d), reading along +x. zTop is the baseline height.
  const front = (x, y, z, text, size = 6, tone = "hi") => k.faceTextSvg(k.sideMatrix([x, y], z, P, "left"), text, { size, tone });
  const top = (x, y, z, text, size = 5, tone = "hi") => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone });
  const track = (pts, z, tone = "mid", opts = {}) =>
    L(k.onTop(pts, z, P), { tone, ...opts }).replace("<path", `<path style="stroke-width:${opts.width ?? 2}px"`) +
    D([at([...pts[0], z]), at([...pts.at(-1), z])], { size: 2.2, tone });

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
    const lines = [num ? `${num}  ${name}` : name, sub, tag].filter(Boolean);
    const gap = size * 1.25;
    lines.forEach((line, i) => {
      const s = i === 0 ? size : size * 0.78;
      const t = i === 0 ? "hi" : "mid";
      out.push(front(plan.x + 7, y, h - 3 - size - i * gap, line, s, t));
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

  return { at, S, L, D, slab, cyl, screws, front, top, track, bench, plinth, cards, tray, gauge, knob, led, screen };
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
  out.push(t(W - 36, 46, title, 15, "strong", "end", 600));
  out.push(t(36, drawH - 18, hint, 12, "text"));
  out.push(t(W - 36, drawH - 18, readout, 12, "strong", "end"));
  const colW = (W - 72) / cols;
  const rows = Math.ceil(legend.length / cols);
  legend.forEach((item, i) => {
    const c = Math.floor(i / rows), r = i % rows;
    const indent = /^\s+/.test(item) ? 26 : 0;
    out.push(t(36 + c * colW + indent, drawH + 30 + r * 21, item.trim(), 13, "text"));
  });
  return out.join("");
}

export function writeFigure(path, { W, H, label, body }) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" class="iso iso-svg" data-theme="light" role="img" aria-label="${label.replace(/"/g, "&quot;")}"><title>${label.replace(/&/g, "&amp;").replace(/</g, "&lt;")}</title><style>${k.ISO_CSS}</style>${body.join("")}</svg>\n`;
  writeFileSync(path, svg);
}
