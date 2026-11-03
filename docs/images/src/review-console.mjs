// Fig 6: review console and audit trail. PLANNED.
import { k, makeScene, frame, writeFigure } from "./lib.mjs";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../arthai-review-console.svg", import.meta.url));
const W = 1200, H = 910, DRAW = 620;
const BENCH = { x: 0, y: 0, w: 780, d: 364, r: 10 };
const P = k.fitProjection(k.boxCorners(BENCH, -15, 110), W, DRAW - 40, { pad: 30, azimuth: 62 });
P.origin[1] += 20;
const s = makeScene(P);
const HP = 44;

const QUEUES = { x: 24, y: 30, w: 170, d: 110, r: 4 };
const CONSOLE = { x: 234, y: 30, w: 250, d: 110, r: 4 };
const AUDIT = { x: 524, y: 30, w: 230, d: 110, r: 4 };
const APPROVE = { x: 234, y: 240, w: 250, d: 84, r: 4 };
const FEED = { x: 524, y: 240, w: 230, d: 84, r: 4 };

const body = [frame({
  W, H, drawH: DRAW,
  fig: "Fig 6",
  title: "Review console + audit (planned)",
  hint: "Synthetic claims only. Design from PR #9 / #14 research, not yet decided. Not built.",
  readout: "every AI action writes an audit_event",
  legend: [
    "1  Two queues: claims the AI flags (wide set, guardrail hit, high dollar) and a random QA",
    "   sample of claims that the AI handled alone. The random sample measures true quality.",
    "2  The claim timeline shows each AI and human action, the model, the prompt version and the sources.",
    "3  The audit trail is append-only. Each row stores the hash of the row before it.",
    "4  External or money actions (send an appeal, place a call) wait for a human click.",
    "   Write-offs and refunds need two people.",
    "5  A reviewer edit, with a reason, becomes an eval case. The eval loop then recalibrates the gate.",
    "Tracks. Chevrons show the direction.",
    "   black: 1 to 2 (a claim opens). 2 to 3 (each action is logged). 2 to 4 (an action waits for approval).",
    "   blue dotted: 4 to 5 (a reviewer edit becomes feedback). Short links join the audit blocks.",
    "Small text on the parts (IDs, tags) is an example. The legend gives the facts.",
  ],
  cols: 1,
})];
body.push(s.bench(BENCH, 12));
const z = 0.4;
body.push(s.link(QUEUES, QUEUES.x + QUEUES.w - 14, CONSOLE, CONSOLE.x + 16, 156));
body.push(s.link(CONSOLE, CONSOLE.x + CONSOLE.w - 14, AUDIT, AUDIT.x + 16, 156));
// 2 -> 4: around the left end of the approvals plinth to its front edge
body.push(s.track([[440, CONSOLE.y + CONSOLE.d + 6], [440, 190], [500, 190], [500, 282], [APPROVE.x + APPROVE.w + 6, 282]], z, "hi"));
body.push(s.link(APPROVE, APPROVE.x + APPROVE.w - 14, FEED, FEED.x + 16, 344, "blue", { dotted: true, width: 2.4 }));

// 1 queues: two trays
body.push(s.plinth(QUEUES, HP, { num: "1", name: "TWO QUEUES", sub: "FLAGGED + RANDOM QA", size: 13 }));
for (const [i, [id, n, tone]] of [["AI-FLAGGED", 3, "red"], ["RANDOM QA", 2, "blue"]].entries()) {
  const t = s.tray({ x: QUEUES.x + 10 + i * 78, y: QUEUES.y + 14, w: 72, d: 70, r: 1 }, HP, 6);
  body.push(t.back, s.cards(QUEUES.x + 16 + i * 78, QUEUES.y + 22, HP + 1.2, { n, w: 56, d: 52, id, rules: 3, idSize: 7.4 }), t.front);
  body.push(s.led(QUEUES.x + 70 + i * 78, QUEUES.y + 92, HP, tone));
}
// 2 console screen with a claim timeline
body.push(s.plinth(CONSOLE, HP, { num: "2", name: "CLAIM TIMELINE", sub: "ACTIONS, MODEL, SOURCES", size: 13 }));
body.push(s.screen({ x: CONSOLE.x + 14, y: CONSOLE.y + 14, w: 222, d: 5, r: 1 }, HP, 92, [
  { text: "SYN-C-000042", size: 9.6 },
  { text: "TRIAGE: LLM", size: 8.4, tone: "hi" },
  { text: "GATE: SET=3 -> HUMAN", size: 8.4, tone: "hi" },
  { text: "REVIEWER -> WRITER", size: 8.4, tone: "hi" },
  { text: "APPEAL: 4 OF 4 CITED", size: 8.4, tone: "hi" },
  { text: "APPROVAL: WAITING", size: 8.4, tone: "hi" },
]));
body.push(s.slab({ x: CONSOLE.x + 40, y: CONSOLE.y + 56, w: 170, d: 40, r: 3 }, HP, 4, { tone: "mid" }, 3, 0.6));
body.push(s.D(k.dotGrid(CONSOLE.x + 48, CONSOLE.y + 62, 18, 4, 8.6, HP + 4, P), { size: 0.9, tone: "mid" }));
// 3 audit chain: linked blocks with hash links
body.push(s.plinth(AUDIT, HP, { num: "3", name: "AUDIT TRAIL", sub: "APPEND-ONLY, HASH CHAIN", size: 13 }));
for (let i = 0; i < 5; i++) {
  const b = { x: AUDIT.x + 14 + i * 42, y: AUDIT.y + 30, w: 30, d: 44, r: 2 };
  body.push(s.slab(b, HP, 14, { tone: i === 4 ? "hi" : "mid", lit: i === 4 }, 3, 0.6));
  body.push(s.front(b.x + 3, b.y + b.d, HP + 4.6, `#${41 + i}`, 7, "hi"));
  body.push(s.top(b.x + 3, b.y + 12, HP + 14, "hash", 4.4, "mid"));
  if (i < 4) body.push(s.slab({ x: b.x + b.w, y: b.y + 18, w: 12, d: 8, r: 1 }, HP + 4, 4, { tone: "lo" }, 2, 0));
}
body.push(s.slab({ x: AUDIT.x + 14, y: AUDIT.y + 84, w: 200, d: 14, r: 1 }, HP, 1, { tone: "lo", crease: "none" }, 2, 0));
body.push(s.top(AUDIT.x + 18, AUDIT.y + 94, HP + 1, "NO UPDATE · NO DELETE", 9, "hi"));
// 4 approval panel with three buttons
body.push(s.plinth(APPROVE, HP, { num: "4", name: "APPROVALS", sub: "HUMAN CLICK FOR SEND OR CALL", size: 13 }));
[["APPROVE", "green"], ["EDIT", "blue"], ["REJECT", "red"]].forEach(([name, tone], i) => {
  const b = { x: APPROVE.x + 16 + i * 76, y: APPROVE.y + 14, w: 64, d: 40, r: 4 };
  body.push(s.slab(b, HP, 10, { tone: "mid" }, 4, 0.6));
  body.push(s.slab(k.insetPlan(b, 6), HP + 10, i === 0 ? 3 : 6, { tone: "hi", lit: i === 0 }, 4, 0.5));
  body.push(s.front(b.x + 6, b.y + b.d, HP + 1.6, name, 6.6, "hi"));
  body.push(s.led(b.x + b.w - 8, b.y + 8, HP + 10, tone));
});
// 5 feedback to eval
body.push(s.plinth(FEED, HP, { num: "5", name: "FEEDBACK", sub: "EDIT -> EVAL CASE", size: 13 }));
body.push(s.cards(FEED.x + 14, FEED.y + 14, HP, { n: 3, w: 110, d: 46, id: "EDIT: reason=wrong_policy", rules: 2, idSize: 5.4 }));
body.push(s.gauge(FEED.x + 180, FEED.y + 38, HP, 22, 0.7));

writeFigure(OUT, {
  W, H,
  label: "Fig 6. Planned review console and audit trail. Two queue trays hold AI-flagged claims and a random QA sample. A screen shows the timeline of synthetic claim SYN-C-000042. Every action goes to an append-only audit trail of hash-linked blocks. An approvals panel has approve, edit and reject buttons. A blue dotted track takes a reviewer edit to the feedback station.",
  body,
});
console.log("wrote", OUT);
