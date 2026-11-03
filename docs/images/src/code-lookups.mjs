// Fig 5: code lookups. A catalog of public CMS and X12 code values. No CPT. PLANNED.
import { k, makeScene, frame, writeFigure } from "./lib.mjs";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../arthai-code-lookups.svg", import.meta.url));
const W = 1200, H = 910, DRAW = 620;
const BENCH = { x: 0, y: 0, w: 760, d: 392, r: 10 };
const P = k.fitProjection(k.boxCorners(BENCH, -15, 150), W, DRAW - 40, { pad: 30, azimuth: 62 });
P.origin[1] += 14;
const s = makeScene(P);
const HP = 44;

const CAB = { x: 40, y: 40, w: 300, d: 110, r: 4 };
const QUERY = { x: 390, y: 40, w: 150, d: 100, r: 4 };
const RESULT = { x: 580, y: 40, w: 150, d: 100, r: 4 };
const VERIFY = { x: 40, y: 282, w: 340, d: 84, r: 4 };

const body = [frame({
  W, H, drawH: DRAW,
  fig: "Fig 5",
  title: "Code lookups (planned)",
  hint: "Code values only. No CPT. Design from data-plan and D-009. Not built.",
  readout: "agents pick codes from the catalog only",
  legend: [
    "1  The catalog holds small public subsets: HCPCS Level II (CMS) and ICD-10-CM (CDC/NCHS),",
    "   with attribution. CARC and RARC hold code values with our own labels, not X12 text.",
    "   The CPT drawer stays locked. We use no CPT codes or descriptors, and no AMA license (D-009).",
    "2  An agent asks for a code value. Example: CARC 197 from the adjustment CO-197 (group code CO).",
    "3  The catalog returns the value and our own category label (example: prior_auth).",
    "4  Planned repo tests (not a step at run time) check each code value in the catalog against its format.",
    "   HCPCS II is a letter and 4 digits. ICD-10-CM is a letter, a digit and up to 5 more. CARC has 1 to 3",
    "   characters. RARC is M, MA or N and digits. A test fails on a CPT code (docs/data-plan.md section 5).",
    "   No free-text codes go into a claim, a prompt or a letter.",
    "Tracks. Chevrons show the direction.",
    "   black: 2 to 1 (the agent asks the catalog) and 1 to 3 (the catalog answers). Station 4 has no track.",
  ],
  cols: 1,
})];
body.push(s.bench(BENCH, 12));
const z = 0.4;
body.push(s.link(QUERY, QUERY.x + 16, CAB, CAB.x + CAB.w - 14, 172));
body.push(s.link(CAB, CAB.x + CAB.w - 40, RESULT, RESULT.x + 16, 188));

// 1 the card catalog cabinet: five drawers in a row, one locked
body.push(s.plinth(CAB, HP, { num: "1", name: "CODE CATALOG", sub: "PUBLIC SUBSETS", size: 13 }));
const drawers = [
  ["HCPCS II", "CMS", false],
  ["ICD-10-CM", "CDC/NCHS", false],
  ["CARC", "VALUES", false],
  ["RARC", "VALUES", false],
  ["CPT", "NOT USED", true],
];
const DW = 54, DH = 70, base = HP;
const shell = { x: CAB.x + 10, y: CAB.y + 14, w: DW * 5 + 10, d: 80, r: 2 };
body.push(s.slab(shell, base, DH + 10, { tone: "mid" }, 3, 0.8));
body.push(s.L(k.planOutline(k.insetPlan(shell, 3), base + DH + 10, P, 3), { tone: "faint" }));
body.push(s.screws(shell, 6, base + DH + 10, 0.6));
body.push(s.slab({ x: shell.x + 20, y: shell.y + 24, w: 120, d: 30, r: 2 }, base + DH + 10, 1, { tone: "lo", crease: "none" }, 2, 0));
body.push(s.top(shell.x + 26, shell.y + 38, base + DH + 11, "ARTHAI CODE CATALOG", 6.4, "hi"));
body.push(s.top(shell.x + 26, shell.y + 48, base + DH + 11, "VALUES ONLY · NO CPT", 5.2, "mid"));
for (let i = 0; i < 3; i++) body.push(s.knob(shell.x + 180 + i * 26, shell.y + 40, base + DH + 10, 5, 4));
drawers.forEach(([name, sub, locked], i) => {
  const x = shell.x + 5 + i * DW;
  const fy = shell.y + shell.d;
  const pulled = 0;
  const front = { x: x + 2, y: fy - 2 + pulled, w: DW - 4, d: 4, r: 1 };
  if (pulled) {
    const box = { x: x + 4, y: fy - 40 + pulled, w: DW - 8, d: 38, r: 1 };
    body.push(s.slab(box, base + 8, 30, { tone: "mid" }, 2, 0.4));
    for (let c = 0; c < 4; c++) body.push(s.slab({ x: box.x + 4, y: box.y + 4 + c * 7, w: box.w - 8, d: 1.4, r: 0.3 }, base + 38, 8 - c, { tone: c === 3 ? "hi" : "mid", lit: c === 3 }, 2, 0));
  }
  body.push(s.slab(front, base + 6, DH - 4, { tone: locked ? "mid" : "hi", lit: i === 2 }, 2, 0.5));
  const ffy = front.y + front.d;
  body.push(s.front(x + 5, ffy, base + DH - 13, name, 8.4, "hi"));
    // label holder and pull
  body.push(s.L(k.segment([x + 6, ffy, base + DH - 24], [x + DW - 8, ffy, base + DH - 24], P), { tone: "lo" }));
  if (!locked) body.push(s.cyl(x + DW / 2, ffy + 2, 3, base + 30, 4, { tone: "mid" }, 16));
  if (locked) {
    body.push(s.slab({ x: x + 8, y: ffy, w: DW - 18, d: 2, r: 0.4 }, base + 14, 4, { tone: "mid" }, 2, 0));
    body.push(s.L(k.segment([x + 8, ffy + 2.1, base + 16], [x + DW - 10, ffy + 2.1, base + 16], P), { tone: "red" }).replace("<path", '<path style="stroke-width:2.4px"'));
    // padlock: a body on the drawer front and a U-shaped shackle above it
    const lx = x + DW / 2 - 6;
    body.push(s.slab({ x: lx, y: ffy, w: 12, d: 3, r: 1 }, base + 22, 10, { tone: "hi" }, 2, 0.4));
    body.push(s.L(k.segment([lx + 2.5, ffy + 1.5, base + 32], [lx + 2.5, ffy + 1.5, base + 37], P) + k.segment([lx + 2.5, ffy + 1.5, base + 37], [lx + 9.5, ffy + 1.5, base + 37], P) + k.segment([lx + 9.5, ffy + 1.5, base + 37], [lx + 9.5, ffy + 1.5, base + 32], P), { tone: "hi" }).replace("<path", '<path style="stroke-width:2px"'));
  }
});

// 3 query terminal, 4 result card, 5 verifier
body.push(s.plinth(QUERY, HP, { num: "2", name: "AGENT ASKS", sub: "LOOKUP BY VALUE", size: 13 }));
body.push(s.cards(QUERY.x + 14, QUERY.y + 18, HP, { n: 2, w: 120, d: 60, id: "ASK: CARC 197", rules: 2, idSize: 9.4 }));
body.push(s.plinth(RESULT, HP, { num: "3", name: "CATALOG ANSWERS", sub: "VALUE + OUR LABEL", size: 13 }));
body.push(s.cards(RESULT.x + 14, RESULT.y + 18, HP, { n: 3, w: 120, d: 60, id: "CARC 197: prior_auth", rules: 2, lit: true, idSize: 9 }));
body.push(s.plinth(VERIFY, HP, { num: "4", name: "FORMAT TESTS", sub: "REPO TESTS", size: 13 }));
[
  ["HCPCS II: LETTER + 4 DIGITS", "green"],
  ["ICD-10-CM: LETTER, DIGIT, UP TO 5 MORE", "green"],
  ["CARC: 1 TO 3 CHARACTERS", "green"],
  ["RARC: M, MA OR N + DIGITS", "green"],
  ["CPT CODE: REJECTED", "red"],
].forEach(([text, tone], i) => {
  const row = { x: VERIFY.x + 140, y: VERIFY.y + 5 + i * 15.5, w: 192, d: 13, r: 1.5 };
  const hh = 9 + (4 - i) * 7;
  body.push(s.slab(row, HP, hh, { tone: "mid" }, 2, 0.4));
  body.push(s.front(row.x + 5, row.y + row.d, HP + hh - 7.2, text, 6.2, "hi"));
  body.push(s.led(row.x + row.w - 8, row.y + 6.5, HP + hh, tone));
});
body.push(s.cards(VERIFY.x + 22, VERIFY.y + 20, HP, { n: 2, w: 100, d: 40, id: "SYN-C-000042", rules: 3, idSize: 7 }));

writeFigure(OUT, {
  W, H,
  label: "Fig 5. Planned code lookups. A card catalog has five drawers for the code sets in the legend. The fifth drawer has a padlock and a red bar, because we use no CPT. An agent asks the catalog for a code on a black track. The catalog answers on a black track. Planned repo tests check the format of each code value.",
  body,
});
console.log("wrote", OUT);
