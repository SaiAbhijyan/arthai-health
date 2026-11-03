// Fig 2: triage scores and the CCI conformal gate. PLANNED, not built.
import { k, makeScene, frame, writeFigure } from "./lib.mjs";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../arthai-triage-gate.svg", import.meta.url));
const W = 1200, H = 936, DRAW = 600;
const BENCH = { x: 0, y: 0, w: 780, d: 342, r: 10 };
const P = k.fitProjection(k.boxCorners(BENCH, -15, 80), W, DRAW - 40, { pad: 30, azimuth: 62 });
P.origin[1] += 10;
const s = makeScene(P);
const HP = 44; // plinth height

const IN = { x: 24, y: 40, w: 130, d: 84, r: 4 };
const LAYA = { x: 196, y: 40, w: 170, d: 84, r: 4 };
const GATE = { x: 410, y: 40, w: 180, d: 140, r: 4 };
const CAL = { x: 24, y: 236, w: 170, d: 70, r: 4 };
const AUTO = { x: 670, y: 40, w: 84, d: 84, r: 4 };
const HUMAN = { x: 670, y: 236, w: 84, d: 84, r: 4 };

const body = [frame({
  W, H, drawH: DRAW,
  fig: "Fig 2",
  title: "Triage + CCI gate (planned)",
  hint: "Synthetic denials only. Planned design, not built.",
  readout: "set = 1 label: auto path · set > 1: human",
  legend: [
    "1  A synthetic denied line arrives from remit posting (example: SYN-D-000042, CO-197).",
    "2  The triage scorer gives three results: the category, the appeal decision (yes or no) and the priority.",
    "   The default scorer is the LLM, with one typed result. LAYA is optional (TRIAGE_BACKEND=laya|llm).",
    "   LAYA becomes the default only after the rule question is answered and LAYA beats the LLM (ADR 0004).",
    "3  The CCI gate turns the scores into a conformal prediction set. Each pin is one",
    "   category: prior auth, coding, eligibility, timely filing, medical necessity,",
    "   duplicate, other. A raised pin is in the set.",
    "4  Claim A: the set has 1 label, so the claim takes the auto path to the appeal writer.",
    "5  Claim B: the set has 3 labels, so the claim goes to the human queue.",
    "6  A synthetic calibration slice sets the gate for a target coverage of 1 - alpha.",
    "   The guarantee is an average over cases, not a promise about one claim.",
    "Tracks. Chevrons show the direction.",
    "   black: the denial and its scores. green: the gate is sure. red: not sure. blue dotted: calibration.",
  ],
  cols: 1,
})];
body.push(s.bench(BENCH, 12));

const z = 0.4;
body.push(s.link(IN, IN.x + IN.w - 14, LAYA, LAYA.x + 18, 144));
body.push(s.link(LAYA, LAYA.x + LAYA.w - 16, GATE, GATE.x + 22, 196));
body.push(s.track([[GATE.x + GATE.w + 6, 82], [AUTO.x - 6, 82]], z, "green", { width: 2.6 }));
body.push(s.track([[GATE.x + GATE.w + 6, 150], [630, 150], [630, 278], [HUMAN.x - 6, 278]], z, "red", { width: 2.6 }));
body.push(s.track([[CAL.x + CAL.w + 6, 272], [440, 272], [440, GATE.y + GATE.d + 6]], z, "blue", { dotted: true, width: 2.4 }));

// 1 intake tray with denial cards
body.push(s.plinth(IN, HP, { num: "1", name: "DENIAL IN", sub: "SYNTHETIC 835 LINE", size: 9.5 }));
{
  const t = s.tray({ x: IN.x + 12, y: IN.y + 10, w: 90, d: 62, r: 1 }, HP, 6);
  body.push(t.back, s.cards(IN.x + 18, IN.y + 18, HP + 1.2, { n: 4, w: 72, d: 46, id: "SYN-D-000042", rules: 0 }), t.front);
  body.push(s.top(IN.x + 24, IN.y + 33, HP + 6.6, "CO-197", 7, "hi"));
  body.push(s.L(k.lineOnTop([IN.x + 24, IN.y + 38], [IN.x + 74, IN.y + 38], HP + 6.6, P) + k.lineOnTop([IN.x + 24, IN.y + 42], [IN.x + 64, IN.y + 42], HP + 6.6, P), { tone: "lo", free: true }));
}
// 2 triage scorer with three dials
body.push(s.plinth(LAYA, HP, { num: "2", name: "TRIAGE SCORER", sub: "LAYA OR LLM", size: 9.5 }));
{
  const box = { x: LAYA.x + 10, y: LAYA.y + 12, w: 150, d: 60, r: 3 };
  body.push(s.slab(box, HP, 12, { tone: "mid" }, 4, 0.8));
  body.push(s.L(k.planOutline(k.insetPlan(box, 3), HP + 12, P, 3), { tone: "faint" }));
  [[0.15, "CAT"], [0.85, "APPEAL"], [0.55, "PRIO"]].forEach(([f, name], i) => {
    const cx = box.x + 26 + i * 49, cy = box.y + 26;
    body.push(s.gauge(cx, cy, HP + 12, 17, f, { lit: i === 0 }));
    body.push(s.front(cx - 14, box.y + box.d, HP + 4, name, 5.2, "hi"));
  });
  body.push(s.led(box.x + box.w - 8, box.y + box.d - 8, HP + 12, "green"));
}
// 6 calibration weights
body.push(s.plinth(CAL, HP, { num: "6", name: "CALIBRATION", sub: "TARGET 1 - ALPHA", size: 9.5 }));
for (let i = 0; i < 5; i++) {
  const cx = CAL.x + 30 + i * 26, cy = CAL.y + 32;
  body.push(s.cyl(cx, cy, 9 - i, HP, 6 + i * 3, { tone: i === 4 ? "hi" : "mid" }, 32, 0.4));
  body.push(s.L(k.ring(cx, cy, 3, HP + 6 + i * 3, P, 16), { tone: "lo" }));
}
// 3 the CCI gate: two comb rows of seven pins
body.push(s.plinth(GATE, HP, { num: "3", name: "CCI GATE", sub: "CONFORMAL SET", size: 9.5 }));
const rows = [
  { y: GATE.y + 22, raised: [0], tone: "green", name: "A: SET = 1" },
  { y: GATE.y + 82, raised: [0, 1, 4], tone: "red", name: "B: SET = 3" },
];
for (const r of rows) {
  const rail = { x: GATE.x + 12, y: r.y, w: 156, d: 30, r: 2 };
  body.push(s.slab(rail, HP, 8, { tone: "mid" }, 3, 0.6));
  body.push(s.front(rail.x + 4, rail.y + rail.d, HP + 1.6, r.name, 5.6, "hi"));
  for (let i = 0; i < 7; i++) {
    const cx = rail.x + 16 + i * 21, cy = rail.y + 12;
    const up = r.raised.includes(i);
    body.push(s.L(k.ring(cx, cy, 4.2, HP + 8, P, 20), { tone: "lo" }));
    body.push(s.cyl(cx, cy, 3.2, HP + 8, up ? 16 : 2, { tone: up ? "hi" : "mid", lit: up }, 20));
    if (up) body.push(s.L(k.ring(cx, cy, 2.2, HP + 24.1, P, 16), { tone: r.tone }).replace("<path", '<path style="stroke-width:2.4px"'));
  }
}
// 4 auto path tray, 5 human queue tray
for (const [p, num, name, sub, tone] of [[AUTO, "4", "AUTO PATH", "TO APPEAL", "green"], [HUMAN, "5", "HUMAN", "QUEUE", "red"]]) {
  body.push(s.plinth(p, HP, { num, name, sub, size: 9 }));
  const t = s.tray({ x: p.x + 12, y: p.y + 10, w: 58, d: 44, r: 1 }, HP, 6);
  body.push(t.back, s.cards(p.x + 18, p.y + 18, HP + 1.2, { n: tone === "red" ? 3 : 1, w: 44, d: 30, id: tone === "red" ? "CLAIM B" : "CLAIM A", rules: 2 }), t.front);
  body.push(s.led(p.x + p.w - 10, p.y + 8, HP, tone));
}

writeFigure(OUT, {
  W, H,
  label: "Fig 2. Planned triage and CCI gate. A synthetic denial goes to a triage scorer (LLM by default, LAYA optional) and then to a gate with seven category pins. Claim A has one raised pin and goes on a green track to the auto path; claim B has three raised pins and goes on a red track to the human queue, and a calibration station feeds the gate on a blue dotted track.",
  body,
});
console.log("wrote", OUT);
