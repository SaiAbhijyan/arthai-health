// Fig 3: the appeal writer. Muse drafts, the citation gate checks, a human approves. PLANNED.
import { k, makeScene, frame, writeFigure } from "./lib.mjs";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../arthai-appeal-writer.svg", import.meta.url));
const W = 1200, H = 890, DRAW = 600;
const BENCH = { x: 0, y: 0, w: 800, d: 372, r: 10 };
const P = k.fitProjection(k.boxCorners(BENCH, -15, 90), W, DRAW - 40, { pad: 30, azimuth: 62 });
P.origin[1] += 14;
const s = makeScene(P);
const HP = 44;

const FACTS = { x: 24, y: 30, w: 150, d: 110, r: 4 };
const MUSE = { x: 214, y: 30, w: 170, d: 110, r: 4 };
const CITE = { x: 424, y: 30, w: 150, d: 110, r: 4 };
const APPROVE = { x: 424, y: 266, w: 150, d: 84, r: 4 };
const SEND = { x: 620, y: 266, w: 150, d: 84, r: 4 };

const body = [frame({
  W, H, drawH: DRAW,
  fig: "Fig 3",
  title: "Appeal writer (planned)",
  hint: "Fictional payer policy. Synthetic claim. Planned design, not built.",
  readout: "no citation, no letter · no approval, no send",
  legend: [
    "1  Inputs: the synthetic denial record, the facts from the record, and retrieved chunks",
    "   of a fictional payer policy (example payer ZZP01).",
    "2  Muse (a Meta model) drafts the letter. Muse writes the text. It does not make the decision.",
    "3  The citation gate checks that each statement maps to a retrieved chunk ID.",
    "   If a statement has no source, the draft goes back to the writer (red track).",
    "4  A human approves the letter in the review console (tier 2). In the hackathon,",
    "   every external action needs approval.",
    "5  The appeal goes out only after approval. Then the voice agent follows up.",
    "Tracks. Chevrons show the direction.",
    "   black: 1 to 2 (the facts), 2 to 3 (the draft). red: 3 to 2 (a statement has no source).",
    "   green: 3 to 4 (all statements cited), 4 to 5 (the human approved).",
  ],
  cols: 1,
})];
body.push(s.bench(BENCH, 12));
const z = 0.4;
body.push(s.link(FACTS, FACTS.x + FACTS.w - 14, MUSE, MUSE.x + 16, 156));
// 2 -> 3 and 3 -> 2 run in the open aisle in front of the plinths, so that both stay visible.
const fr = MUSE.y + MUSE.d + 6;
body.push(s.track([[364, fr], [364, 166], [444, 166], [444, fr]], z, "hi"));
body.push(s.track([[466, fr], [466, 184], [330, 184], [330, fr]], z, "red", { width: 2.6 }));
body.push(s.track([[500, CITE.y + CITE.d + 6], [500, APPROVE.y - 6]], z, "green", { width: 2.6 }));
body.push(s.track([[APPROVE.x + APPROVE.w + 6, 308], [SEND.x - 6, 308]], z, "green", { width: 2.6 }));

// 1 facts: three cards side by side
body.push(s.plinth(FACTS, HP, { num: "1", name: "FACTS IN", sub: "RECORD + POLICY", size: 9.5 }));
body.push(s.cards(FACTS.x + 10, FACTS.y + 14, HP, { n: 2, w: 60, d: 36, id: "SYN-D-000042", rules: 3 }));
body.push(s.cards(FACTS.x + 80, FACTS.y + 14, HP, { n: 3, w: 60, d: 36, id: "ZZP01 POLICY", rules: 3 }));
body.push(s.cards(FACTS.x + 10, FACTS.y + 58, HP, { n: 1, w: 130, d: 30, id: "CHUNK IDS: P-4.2  P-7.1", rules: 1 }));

// 2 the writer: body, platen, sheet, keys
body.push(s.plinth(MUSE, HP, { num: "2", name: "MUSE WRITER", sub: "META MODEL DRAFTS", size: 9.5 }));
{
  const b = { x: MUSE.x + 14, y: MUSE.y + 34, w: 142, d: 62, r: 6 };
  body.push(s.slab(b, HP, 18, { tone: "mid" }, 6, 1));
  body.push(s.cyl(MUSE.x + 24, MUSE.y + 40, 5, HP + 18, 6, { tone: "mid" }));
  body.push(s.knob(MUSE.x + 146, MUSE.y + 40, HP + 18, 5, 6));
  body.push(s.slab({ x: MUSE.x + 32, y: MUSE.y + 36, w: 106, d: 3, r: 0.5 }, HP + 18, 52, { tone: "hi", lit: true }, 2, 0));
  const fy = MUSE.y + 39;
  body.push(s.front(MUSE.x + 38, fy, HP + 62, "RE: SYN-C-000042", 5.2, "hi"));
  for (let r = 0; r < 5; r++) {
    const zz = HP + 54 - r * 7;
    body.push(s.L(k.segment([MUSE.x + 38, fy, zz], [MUSE.x + 112 - r * 5, fy, zz], P), { tone: "lo", free: true }));
    body.push(s.front(MUSE.x + 116 - r * 5, fy, zz + 1.6, `[P-${r % 2 ? "7.1" : "4.2"}]`, 4, "mid"));
  }
  for (let rr = 0; rr < 3; rr++) for (let c = 0; c < 10; c++) body.push(s.cyl(MUSE.x + 32 + c * 12 + rr * 3, MUSE.y + 60 + rr * 10, 3, HP + 18, 2, { tone: "hi" }, 14));
}

// 3 citation gate: two rollers and a check window
body.push(s.plinth(CITE, HP, { num: "3", name: "CITATION GATE", sub: "EVERY LINE HAS A SOURCE", size: 9.5 }));
{
  const frameL = { x: CITE.x + 14, y: CITE.y + 20, w: 8, d: 70, r: 1 };
  const frameR = { x: CITE.x + 126, y: CITE.y + 20, w: 8, d: 70, r: 1 };
  body.push(s.slab(frameL, HP, 30, { tone: "mid" }), s.slab(frameR, HP, 30, { tone: "mid" }));
  for (const [y, zz] of [[CITE.y + 36, HP + 22], [CITE.y + 66, HP + 22]]) {
    body.push(s.slab({ x: CITE.x + 22, y: y - 5, w: 104, d: 10, r: 4.6 }, zz - 5, 10, { tone: "hi" }, 6, 0));
  }
  body.push(s.led(CITE.x + 130, CITE.y + 26, HP + 30, "green"));
  body.push(s.led(CITE.x + 130, CITE.y + 40, HP + 30, "red"));
  body.push(s.cards(CITE.x + 40, CITE.y + 86, HP, { n: 1, w: 70, d: 14, id: "4 OF 4 CITED", rules: 0, lit: true }));
}

// 4 approval stamp and console button
body.push(s.plinth(APPROVE, HP, { num: "4", name: "HUMAN APPROVAL", sub: "TIER 2, IN CONSOLE", size: 9.5 }));
{
  const x = APPROVE.x + 40, y = APPROVE.y + 36;
  body.push(s.cyl(x, y, 14, HP, 5, { tone: "mid" }, 40, 0.6));
  body.push(s.cyl(x, y, 4, HP + 5, 18, { tone: "mid" }, 20));
  body.push(s.cyl(x, y, 9, HP + 23, 6, { tone: "hi" }, 32, 0.4));
  body.push(s.cards(APPROVE.x + 76, APPROVE.y + 22, HP, { n: 2, w: 60, d: 34, id: "APPROVED BY", rules: 2 }));
}
// 5 out tray
body.push(s.plinth(SEND, HP, { num: "5", name: "SEND", sub: "ONLY AFTER APPROVAL", size: 9.5 }));
{
  const t = s.tray({ x: SEND.x + 20, y: SEND.y + 12, w: 96, d: 56, r: 1 }, HP, 7);
  body.push(t.back, s.cards(SEND.x + 28, SEND.y + 20, HP + 1.2, { n: 3, w: 78, d: 40, id: "APPEAL L1", rules: 3 }), t.front);
  body.push(s.led(SEND.x + 132, SEND.y + 14, HP, "green"));
}

writeFigure(OUT, {
  W, H,
  label: "Fig 3. Planned appeal writer. Facts and a fictional payer policy go to the Muse writer, and a citation gate checks that each statement cites a chunk ID, with a red track back to the writer for a statement with no source. Green tracks take the draft to human approval (tier 2) and then to the send tray.",
  body,
});
console.log("wrote", OUT);
