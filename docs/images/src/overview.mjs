// Fig 1: the whole planned flow on one bench. Every station is PLANNED.
import { k, makeScene, frame, writeFigure } from "./lib.mjs";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../arthai-overview.svg", import.meta.url));
const W = 1200, H = 1096, DRAW = 620;
const BENCH = { x: 0, y: 0, w: 860, d: 410, r: 10 };
const P = k.fitProjection([...k.boxCorners(BENCH, -15, 70)], W, DRAW - 40, { pad: 30, azimuth: 62 });
P.origin[1] += 10;
const s = makeScene(P);

// Station plans (x left to right, y back to front).
const ST = {
  build: { x: 30, y: 28, w: 140, d: 74, r: 4 },
  mock: { x: 220, y: 28, w: 140, d: 74, r: 4 },
  remit: { x: 410, y: 28, w: 140, d: 74, r: 4 },
  gate: { x: 600, y: 28, w: 158, d: 74, r: 4 },
  ar: { x: 30, y: 262, w: 140, d: 74, r: 4 },
  voice: { x: 220, y: 262, w: 140, d: 74, r: 4 },
  appeal: { x: 410, y: 262, w: 140, d: 74, r: 4 },
  review: { x: 600, y: 262, w: 150, d: 74, r: 4 },
};
const EVAL = { x: 776, y: 150, w: 64, d: 60, r: 3 };
const H0 = 36;
const AMBER = "#b26a00";
const fy = (p) => p.y + p.d + 6;   // a point on the bench just in front of a station
const body = [frame({
  W, H, drawH: DRAW,
  fig: "Fig 1",
  title: "Arthai Health: planned flow",
  hint: "Synthetic data only. Design from PR #9 / #14 research, not yet decided. None is built.",
  readout: "9 stations · all planned",
  cols: 1,
  legend: [
    "1  Claim builder and scrubber: builds the 837 claim file and runs the NCCI and MUE edits.",
    "2  Payer and clearinghouse mock: our own fake payer. It sends 835 and 277 files.",
    "3  Remit posting: reads the 835 remittance and finds each denied line.",
    "4  Triage + CCI gate: the triage step (LLM by default, LAYA optional) and the CCI gate pick the path.",
    "5  Review console + audit: the human queue, the approvals and the audit trail.",
    "6  Appeal writer: an LLM drafts the letter (Muse planned, D-011 proposed). Each statement cites a source.",
    "7  Voice agent: a browser call to the mock payer rep.",
    "8  AR follow-up: reads the 276/277 claim status and ranks the open claims for the next action.",
    "9  Eval and feedback loop: reviewer edits become eval cases.",
    "Tracks. Chevrons show the direction.",
    "   black: the claim goes to the next step (1 to 2 to 3 to 4, then 6 to 7).",
    "   green: the gate is sure. The claim goes from 4 to 6.",
    "   red: the gate is not sure. The claim goes from 4 to the human queue in 5.",
    "   amber: the human decides, and the claim goes from 5 to 6.",
    "   In the hackathon, 6 to 7 starts only after a human approves in the console (tier 2).",
    "   grey: the 276/277 claim status goes from the payer mock in 2 to AR follow-up in 8.",
    "   dashed: the call goes only to our mock payer in 2.",
    "   blue dotted: reviewer edits go from 5 to 9, then recalibrate the gate in 4.",
    "   Fig 4 shows how the call outcome goes back to the console.",
  ],
})];

body.push(s.bench(BENCH, 12));

// Tracks on the bench top (drawn before the stations so stations sit on them).
const z = 0.4;
const row = 65;
body.push(s.track([[ST.build.x + ST.build.w + 6, row], [ST.mock.x - 6, row]], z, "hi"));
body.push(s.track([[ST.mock.x + ST.mock.w + 6, row], [ST.remit.x - 6, row]], z, "hi"));
body.push(s.track([[ST.remit.x + ST.remit.w + 6, row], [ST.gate.x - 6, row]], z, "hi"));
// gate -> appeal (sure) and gate -> review (not sure), through the open aisle
body.push(s.track([[630, fy(ST.gate)], [630, 160], [470, 160], [470, ST.appeal.y - 2]], z, "green", { width: 2.4 }));
body.push(s.track([[690, fy(ST.gate)], [690, ST.review.y - 2]], z, "red", { width: 2.4 }));
// Front aisles (bench y 342..400). Verticals never cross another track's horizontal span.
const out = (p) => p.y + p.d + 6;
// 5 -> 6: a human decides, then the writer drafts (amber)
body.push(s.track([[640, out(ST.review)], [640, 352], [520, 352], [520, out(ST.appeal)]], z, "hi", { width: 2.4, color: AMBER }));
// 6 -> 7: after tier-2 approval in the console, the appeal is sent and the call starts
body.push(s.link(ST.appeal, 440, ST.voice, 330, 352));
// 2 -> 8: 276/277 claim status to AR follow-up (grey)
body.push(s.track([[240, fy(ST.mock)], [240, 200], [100, 200], [100, ST.ar.y - 6]], z, "mid", { width: 2.4 }));
// voice -> payer mock (the call goes only to our own mock)
body.push(s.track([[290, ST.voice.y - 6], [290, fy(ST.mock)]], z, "hi", { dashed: true }));
// review -> eval -> gate (feedback loop) on the right side
body.push(s.track([[ST.review.x + ST.review.w + 6, 300], [808, 300], [808, EVAL.y + EVAL.d + 6]], z, "blue", { dotted: true, width: 2.4 }));
body.push(s.track([[808, EVAL.y - 6], [808, row], [ST.gate.x + ST.gate.w + 6, row]], z, "blue", { dotted: true, width: 2.4 }));

// Station machines. Each returns markup drawn on top of its plinth (top z = H0).
const machines = {
  build(p) {
    const o = [];
    o.push(s.cards(p.x + 12, p.y + 30, H0, { n: 3, w: 34, d: 24, id: "SYN-C-000001", idSize: 3.4 }));
    // scrubber comb: a bridge with teeth over the card
    o.push(s.slab({ x: p.x + 60, y: p.y + 10, w: 8, d: 44, r: 1 }, H0, 20, { tone: "mid" }));
    o.push(s.slab({ x: p.x + 60, y: p.y + 10, w: 50, d: 8, r: 1 }, H0 + 20, 6, { tone: "mid" }));
    for (let i = 0; i < 6; i++) o.push(s.slab({ x: p.x + 72 + i * 6, y: p.y + 12, w: 2, d: 4, r: 0.4 }, H0 + 8, 12, { tone: "hi" }, 2, 0));
    o.push(s.slab({ x: p.x + 102, y: p.y + 10, w: 8, d: 44, r: 1 }, H0, 20, { tone: "mid" }));
    o.push(s.led(p.x + 106, p.y + 50, H0 + 20, "green"));
    return o.join("");
  },
  mock(p) {
    const o = [];
    const cab = { x: p.x + 14, y: p.y + 8, w: 70, d: 40, r: 2 };
    o.push(s.slab(cab, H0, 38, { tone: "mid" }, 3, 0.8));
    for (let r = 0; r < 3; r++) o.push(s.L(k.segment([cab.x + 8, cab.y + cab.d, H0 + 30 - r * 10], [cab.x + cab.w - 8, cab.y + cab.d, H0 + 30 - r * 10], P), { tone: "lo" }));
        // handset cradle for the phone rep
    o.push(s.slab({ x: p.x + 92, y: p.y + 20, w: 26, d: 22, r: 3 }, H0, 6, { tone: "mid" }));
    o.push(s.slab({ x: p.x + 94, y: p.y + 24, w: 22, d: 7, r: 3 }, H0 + 6, 4, { tone: "hi" }));
    o.push(s.cards(p.x + 96, p.y + 48, H0, { n: 2, w: 22, d: 14, id: "835", rules: 1 }));
    return o.join("");
  },
  remit(p) {
    const o = [];
    // reader with a slot and a roll of remit paper
    o.push(s.slab({ x: p.x + 10, y: p.y + 10, w: 66, d: 46, r: 3 }, H0, 22, { tone: "mid" }, 4, 0.8));
    o.push(s.L(k.lineOnTop([p.x + 18, p.y + 30], [p.x + 68, p.y + 30], H0 + 22, P), { tone: "hi" }));
    o.push(s.cyl(p.x + 98, p.y + 24, 10, H0, 26, { tone: "hi" }, 40));
    o.push(s.L(k.ring(p.x + 98, p.y + 24, 3, H0 + 26, P, 20), { tone: "mid" }));
    o.push(s.cards(p.x + 84, p.y + 44, H0, { n: 1, w: 30, d: 16, id: "CO-197", lit: true, rules: 1 }));
    return o.join("");
  },
  gate(p) {
    const o = [];
    o.push(s.slab({ x: p.x + 10, y: p.y + 10, w: 60, d: 46, r: 3 }, H0, 14, { tone: "mid" }, 4, 0.8));
    o.push(s.gauge(p.x + 40, p.y + 33, H0 + 14, 16, 0.3));
    // diverter flap, two lanes
    o.push(s.slab({ x: p.x + 84, y: p.y + 12, w: 54, d: 18, r: 2 }, H0, 8, { tone: "mid" }));
    o.push(s.slab({ x: p.x + 84, y: p.y + 36, w: 54, d: 18, r: 2 }, H0, 8, { tone: "mid" }));
    o.push(s.L(k.lineOnTop([p.x + 88, p.y + 21], [p.x + 134, p.y + 21], H0 + 8, P), { tone: "green" }));
    o.push(s.L(k.lineOnTop([p.x + 88, p.y + 45], [p.x + 134, p.y + 45], H0 + 8, P), { tone: "red" }));
    o.push(s.knob(p.x + 76, p.y + 33, H0, 3, 10));
    return o.join("");
  },
  ar(p) {
    const o = [];
    const t = s.tray({ x: p.x + 10, y: p.y + 10, w: 76, d: 48, r: 1 }, H0, 8);
    o.push(t.back);
    for (let i = 0; i < 5; i++) o.push(s.slab({ x: p.x + 16 + i * 13, y: p.y + 14, w: 2, d: 40, r: 0.4 }, H0 + 1.2, 14 - i * 2, { tone: i === 0 ? "hi" : "mid", lit: i === 0 }, 2, 0));
    o.push(t.front);
    o.push(s.gauge(p.x + 106, p.y + 34, H0, 12, 0.8, { lit: false }));
    return o.join("");
  },
  voice(p) {
    const o = [];
    // laptop: base and screen
    o.push(s.slab({ x: p.x + 10, y: p.y + 24, w: 54, d: 34, r: 2 }, H0, 3, { tone: "mid" }));
    o.push(s.slab({ x: p.x + 10, y: p.y + 20, w: 54, d: 3, r: 1 }, H0, 34, { tone: "hi" }, 2, 0.4));
        // mic and speaker
    o.push(s.cyl(p.x + 84, p.y + 40, 6, H0, 3, { tone: "mid" }));
    o.push(s.cyl(p.x + 84, p.y + 40, 1.4, H0 + 3, 20, { tone: "mid" }, 12));
    o.push(s.cyl(p.x + 84, p.y + 40, 4, H0 + 23, 8, { tone: "hi", lit: true }, 20));
    o.push(s.cyl(p.x + 110, p.y + 30, 12, H0, 18, { tone: "mid" }, 40, 0.6));
    o.push(s.D(k.dotGrid(p.x + 104, p.y + 24, 4, 4, 4, H0 + 18, P), { size: 0.6, tone: "lo" }));
    return o.join("");
  },
  appeal(p) {
    const o = [];
    o.push(s.track([[p.x + 60, p.y + 2], [p.x + 60, p.y + 15]], H0 + 0.1, "green", { width: 2.4 }).replace(/<g class="iso-dots"[^]*?<\/g>/, ""));
    // writer body with a sheet standing in the platen
    o.push(s.slab({ x: p.x + 10, y: p.y + 18, w: 80, d: 40, r: 4 }, H0, 14, { tone: "mid" }, 5, 0.8));
    o.push(s.cyl(p.x + 50, p.y + 22, 4, H0 + 14, 3, { tone: "mid" }));
    o.push(s.slab({ x: p.x + 24, y: p.y + 18, w: 52, d: 2, r: 0.4 }, H0 + 14, 30, { tone: "hi", lit: true }, 2, 0));
    for (let r = 0; r < 4; r++) o.push(s.L(k.segment([p.x + 28, p.y + 20, H0 + 40 - r * 5], [p.x + 70 - r * 6, p.y + 20, H0 + 40 - r * 5], P), { tone: "lo", free: true }));
    for (let c = 0; c < 8; c++) o.push(s.cyl(p.x + 18 + c * 9, p.y + 48, 2.4, H0 + 14, 1.6, { tone: "hi" }, 12));
    // approval stamp
    o.push(s.cyl(p.x + 108, p.y + 36, 7, H0, 4, { tone: "mid" }));
    o.push(s.cyl(p.x + 108, p.y + 36, 2.6, H0 + 4, 12, { tone: "mid" }, 16));
    o.push(s.cyl(p.x + 108, p.y + 36, 4.4, H0 + 16, 4, { tone: "hi" }, 20));
    return o.join("");
  },
  review(p) {
    const o = [];
    // red lane on the plinth top, into the human queue tray
    o.push(s.track([[90 + 600, p.y + 2], [90 + 600, p.y + 16]], H0 + 0.1, "red", { width: 2.4 }).replace(/<g class="iso-dots"[^]*?<\/g>/, ""));
    const q = s.tray({ x: p.x + 76, y: p.y + 16, w: 30, d: 22, r: 1 }, H0, 5);
    o.push(q.back, s.cards(p.x + 80, p.y + 32, H0 + 1.2, { n: 2, w: 20, d: 12, rules: 0 }), q.front);
    o.push(s.screen({ x: p.x + 10, y: p.y + 8, w: 58, d: 4, r: 1 }, H0, 38, [{ text: "QUEUE", size: 5 }, { text: "AUDIT", size: 5, tone: "mid" }]));
    o.push(s.slab({ x: p.x + 12, y: p.y + 34, w: 54, d: 20, r: 2 }, H0, 3, { tone: "mid" }));
    o.push(s.D(k.dotGrid(p.x + 17, p.y + 38, 8, 3, 6.2, H0 + 3, P), { size: 0.8, tone: "mid" }));
    // audit chain: three linked blocks
    for (let i = 0; i < 3; i++) o.push(s.slab({ x: p.x + 114 + i * 11, y: p.y + 48 - i * 14, w: 10, d: 10, r: 1 }, H0, 8 + i * 4, { tone: i === 2 ? "hi" : "mid" }, 2, 0.4));
    return o.join("");
  },
};

const labels = {
  build: ["1", "CLAIM BUILDER"],
  mock: ["2", "PAYER MOCK"],
  remit: ["3", "REMIT POSTING"],
  gate: ["4", "TRIAGE + CCI GATE"],
  ar: ["8", "AR FOLLOW-UP"],
  voice: ["7", "VOICE AGENT"],
  appeal: ["6", "APPEAL WRITER"],
  review: ["5", "REVIEW CONSOLE"],
};

// Paint back row first, then the eval station, then the front row.
for (const key of ["build", "mock", "remit", "gate"]) {
  const p = ST[key];
  const [num, name] = labels[key];
  body.push(s.plinth({ ...p }, H0, { num, name, size: 12 }));
  body.push(machines[key](p));
}
body.push(s.plinth(EVAL, 32, { num: "9", name: "EVAL", size: 10, tag: "PLANNED" }));
body.push(s.knob(EVAL.x + 52, EVAL.y + 16, 32, 4, 4));
body.push(s.led(EVAL.x + 36, EVAL.y + 16, 32, "blue"));
for (const key of ["ar", "voice", "appeal", "review"]) {
  const p = ST[key];
  const [num, name] = labels[key];
  body.push(s.plinth({ ...p }, H0, { num, name, size: 12 }));
  body.push(machines[key](p));
}

writeFigure(OUT, {
  W, H,
  label: "Fig 1. The planned Arthai Health flow. All nine steps are planned and none is built. A claim goes from the claim builder to the payer mock, remit posting and the triage step with the CCI gate. If the gate is sure, the claim goes to the appeal writer. If not, it goes to a human in the review console. After human approval, the voice agent calls only the payer mock. AR follow-up reads claim status from the payer mock. Reviewer edits go to eval and then back to the gate.",
  body,
});
console.log("wrote", OUT);
