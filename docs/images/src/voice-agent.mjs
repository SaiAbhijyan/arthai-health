// Fig 4: the voice agent. Browser call to our own mock payer rep, local STT and TTS. PLANNED.
import { k, makeScene, frame, writeFigure } from "./lib.mjs";
import { fileURLToPath } from "node:url";
const OUT = fileURLToPath(new URL("../arthai-voice-agent.svg", import.meta.url));
const W = 1200, H = 912, DRAW = 600;
const BENCH = { x: 0, y: 0, w: 800, d: 386, r: 10 };
const P = k.fitProjection(k.boxCorners(BENCH, -15, 90), W, DRAW - 40, { pad: 30, azimuth: 62 });
P.origin[1] += 14;
const s = makeScene(P);
const HP = 44;

const BROWSER = { x: 24, y: 30, w: 160, d: 110, r: 4 };
const STT = { x: 224, y: 30, w: 150, d: 110, r: 4 };
const AGENT = { x: 414, y: 30, w: 150, d: 110, r: 4 };
const TTS = { x: 604, y: 30, w: 170, d: 110, r: 4 };
const REP = { x: 224, y: 266, w: 190, d: 84, r: 4 };
const OUTC = { x: 454, y: 266, w: 150, d: 84, r: 4 };

const body = [frame({
  W, H, drawH: DRAW,
  fig: "Fig 4",
  title: "Voice agent (planned)",
  hint: "No phone line. No real payer. Design from D-018 and PR #9. Not built.",
  readout: "calls go only to our own mock",
  legend: [
    "1  The call runs in the browser (WebRTC and Web Audio). There is no paid phone line.",
    "2  Local speech-to-text turns the rep's voice into text. Candidates: Whisper or faster-whisper.",
    "3  An LLM picks the next turn (Muse planned, D-011 proposed). The agent says that it is an AI and announces the recording.",
    "4  Local text-to-speech speaks the agent's turn. Candidates: Piper or Kokoro.",
    "   Each voice model gets a license check. D-018 does not allow non-commercial voices.",
    "5  The rep is our own mock payer rep on the payer mock. Never call a real payer.",
    "6  The agent records the rep name, the reference number and the time, and reads them back.",
    "   The call outcome updates the claim in the review console.",
    "Tracks. Chevrons show the direction.",
    "   blue (no chevrons): the two-way call line between 1 and 5. The voice of the rep comes in on this line.",
    "   black: the audio of the rep goes from 1 to 2, the text to 3 and the reply to 4.",
    "   dashed: the spoken reply goes from 4 back into the call. green: the call result goes to 6.",
  ],
  cols: 1,
})];
body.push(s.bench(BENCH, 12));
const z = 0.4;
body.push(s.link(BROWSER, BROWSER.x + BROWSER.w - 14, STT, STT.x + 16, 156));
body.push(s.link(STT, STT.x + STT.w - 14, AGENT, AGENT.x + 16, 156));
body.push(s.link(AGENT, AGENT.x + AGENT.w - 14, TTS, TTS.x + 16, 156));
body.push(s.link(TTS, TTS.x + TTS.w - 14, BROWSER, BROWSER.x + 60, 176, "hi", { dashed: true, chevMin: 200 }));
body.push(s.track([[BROWSER.x + 20, BROWSER.y + BROWSER.d + 6], [BROWSER.x + 20, 308], [REP.x - 6, 308]], z, "blue", { width: 2.4, chev: false }));
body.push(s.link(REP, REP.x + REP.w - 14, OUTC, OUTC.x + 16, 366, "green", { width: 2.4 }));

// 1 browser on a laptop with a headset mic
body.push(s.plinth(BROWSER, HP, { num: "1", name: "BROWSER CALL", sub: "WEBRTC, WEB AUDIO", size: 13 }));
{
  const b = BROWSER;
  body.push(s.slab({ x: b.x + 14, y: b.y + 50, w: 100, d: 50, r: 3 }, HP, 4, { tone: "mid" }, 3, 0.6));
  body.push(s.D(k.dotGrid(b.x + 22, b.y + 58, 12, 4, 7.6, HP + 4, P), { size: 0.8, tone: "mid" }));
  body.push(s.slab({ x: b.x + 14, y: b.y + 44, w: 100, d: 4, r: 1 }, HP, 58, { tone: "hi" }, 2, 0.5));
  const fy = b.y + 48;
  body.push(s.front(b.x + 20, fy, HP + 46, "ARTHAI  ·  CALL", 5.6, "hi"));
  body.push(s.front(b.x + 20, fy, HP + 36, "TO: MOCK REP ZZP01", 4.6, "mid"));
  body.push(s.front(b.x + 20, fy, HP + 28, "00:42  REC ON", 4.6, "mid"));
  for (let i = 0; i < 9; i++) {
    const hgt = [3, 7, 11, 6, 13, 8, 4, 10, 5][i];
    body.push(s.L(k.segment([b.x + 22 + i * 5, fy, HP + 10], [b.x + 22 + i * 5, fy, HP + 10 + hgt], P), { tone: "blue" }).replace("<path", '<path style="stroke-width:1.6px"'));
  }
  body.push(s.cyl(b.x + 136, b.y + 70, 8, HP, 3, { tone: "mid" }, 28));
  body.push(s.cyl(b.x + 136, b.y + 70, 1.6, HP + 3, 28, { tone: "mid" }, 12));
  body.push(s.cyl(b.x + 136, b.y + 70, 5, HP + 31, 10, { tone: "hi", lit: true }, 24));
}
// 2 STT box, 3 agent box, 4 TTS box
function unit(p, num, name, sub, extra) {
  body.push(s.plinth(p, HP, { num, name, sub, size: 13 }));
  const b = { x: p.x + 14, y: p.y + 16, w: p.w - 28, d: 70, r: 4 };
  body.push(s.slab(b, HP, 26, { tone: "mid" }, 4, 0.9));
  body.push(s.L(k.planOutline(k.insetPlan(b, 4), HP + 26, P, 3), { tone: "faint" }));
  body.push(s.screws(b, 4, HP + 26, 0.5));
  extra(b, HP + 26);
}
unit(STT, "2", "LOCAL STT", "WHISPER (CANDIDATE)", (b, zt) => {
  for (let i = 0; i < 8; i++) body.push(s.slab({ x: b.x + 12 + i * 12, y: b.y + 14, w: 5, d: 40, r: 1 }, zt, 2 + (i % 3) * 2, { tone: "hi" }, 2, 0));
  body.push(s.front(b.x + 6, b.y + b.d, zt - 6, "AUDIO -> TEXT", 5.2, "hi"));
});
unit(AGENT, "3", "AGENT TURN", "LLM PICKS NEXT LINE", (b, zt) => {
  body.push(s.gauge(b.x + 30, b.y + 34, zt, 18, 0.55));
  body.push(s.knob(b.x + 82, b.y + 22, zt, 5, 5));
  body.push(s.led(b.x + 82, b.y + 50, zt, "green"));
  body.push(s.front(b.x + 6, b.y + b.d, zt - 6, "AI DISCLOSED", 9, "hi"));
});
unit(TTS, "4", "LOCAL TTS", "PIPER / KOKORO (CAND.)", (b, zt) => {
  body.push(s.cyl(b.x + 40, b.y + 36, 24, zt, 6, { tone: "hi" }, 56, 0.6));
  body.push(s.L(k.ring(b.x + 40, b.y + 36, 18, zt + 6, P, 48) + k.ring(b.x + 40, b.y + 36, 11, zt + 6, P, 40), { tone: "lo" }));
  body.push(s.cyl(b.x + 40, b.y + 36, 5, zt + 6, 2, { tone: "mid" }, 24));
  body.push(s.cyl(b.x + 100, b.y + 36, 13, zt, 4, { tone: "hi" }, 40, 0.4));
  body.push(s.L(k.ring(b.x + 100, b.y + 36, 8, zt + 4, P, 32), { tone: "lo" }));
  body.push(s.front(b.x + 6, b.y + b.d, zt - 6, "TEXT -> AUDIO", 5.2, "hi"));
});
// 5 mock rep booth with headset
body.push(s.plinth(REP, HP, { num: "5", name: "MOCK PAYER REP", sub: "OUR OWN PAYER MOCK", size: 13 }));
{
  const b = REP;
  body.push(s.slab({ x: b.x + 14, y: b.y + 10, w: 120, d: 6, r: 1 }, HP, 24, { tone: "mid" }, 2, 0.5));
  body.push(s.front(b.x + 20, b.y + 16, HP + 9, "NOT REAL", 11, "hi"));
  body.push(s.cyl(b.x + 156, b.y + 40, 10, HP, 3, { tone: "mid" }, 32));
  body.push(s.cyl(b.x + 156, b.y + 40, 2, HP + 3, 22, { tone: "mid" }, 12));
  body.push(s.slab({ x: b.x + 144, y: b.y + 36, w: 24, d: 8, r: 3.6 }, HP + 25, 6, { tone: "hi" }, 5, 0));
  body.push(s.cyl(b.x + 146, b.y + 40, 5, HP + 14, 10, { tone: "hi", lit: true }, 24));
  body.push(s.cyl(b.x + 166, b.y + 40, 5, HP + 14, 10, { tone: "hi" }, 24));
  body.push(s.cards(b.x + 30, b.y + 40, HP, { n: 2, w: 80, d: 30, id: "IVR SCRIPT", rules: 2 }));
}
// 6 outcome card
body.push(s.plinth(OUTC, HP, { num: "6", name: "CALL OUTCOME", sub: "READ BACK, LOGGED", size: 13 }));
body.push(s.cards(OUTC.x + 14, OUTC.y + 16, HP, { n: 3, w: 116, d: 50, id: "REF SYN-REF-0007", rules: 3, lit: true, idSize: 9 }));

writeFigure(OUT, {
  W, H,
  label: "Fig 4. Planned voice agent. A browser call links on a blue two-way line to our own mock payer rep. Black tracks take the rep audio to local speech-to-text. They take the text to the agent turn and the reply to local text-to-speech (TTS). The agent turn uses an LLM and says that it is an AI. A dashed track takes the spoken reply back into the call. A green track takes the result to a call outcome card. The card shows an example reference number.",
  body,
});
console.log("wrote", OUT);
