/**
 * ABOUT — identity stage probe.
 *
 * Answers the questions the brief itself asks, rather than "did it crash":
 *
 *   "If I pause the animation at 40%, does it look like a designed scene?"
 *   "If I remove all animation, does the composition still look intentional?"
 *
 * It drives the pinned stage to fixed points in its own scroll range, asserts
 * the invariants that must hold at each, and writes a PNG per stop to
 * .about-frames/ so the frames can actually be looked at — an assertion can
 * prove the statement is opaque, it cannot prove the composition is good.
 *
 * Three passes: cinematic (1440x900), flow (390x844), and reduced motion.
 *
 *   npm run build && npx next start -p 3123
 *   node scripts/probe-about-stage.mjs
 *
 * Overridable: BASE (default http://localhost:3123), CHROME (path to Chrome).
 *
 * Run against a PRODUCTION build. `next dev` compiles routes on demand and
 * serves stale chunk URLs once files have changed under it, both of which look
 * exactly like product bugs here (see scripts/verify-navigation.mjs).
 */
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync, rmSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME =
  process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.BASE || "http://localhost:3123";
const PORT = 9417;
const OUT = ".about-frames";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const profile = mkdtempSync(join(tmpdir(), "about-"));
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--headless=new",
  "--no-first-run", "--no-default-browser-check", "--disable-extensions",
  "--hide-scrollbars", "--window-size=1440,900", "about:blank",
], { stdio: "ignore" });

let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const p = list.find((t) => t.type === "page");
    if (p?.webSocketDebuggerUrl) wsUrl = p.webSocketDebuggerUrl;
  } catch {}
  if (!wsUrl) await sleep(250);
}
const ws = new WebSocket(wsUrl);
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
};
const send = (method, params = {}) =>
  new Promise((r) => { const n = ++id; pending.set(n, r); ws.send(JSON.stringify({ id: n, method, params })); });

await send("Page.enable");
await send("Runtime.enable");

const evalJs = async (expression) => {
  const r = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || "eval failed");
  return r.result.value;
};

const shot = async (name) => {
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  const bytes = Buffer.from(data, "base64");
  writeFileSync(join(OUT, `${name}.png`), bytes);
  return bytes.length;
};

/** Everything worth knowing about the stage at one scroll position. */
const PROBE = `(() => {
  const op = (sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    return Math.round(parseFloat(getComputedStyle(el).opacity) * 100) / 100;
  };
  const stage = document.querySelector('[aria-labelledby="identity-heading"]');
  const frame = stage && stage.firstElementChild;
  const heading = document.querySelector('[data-heading]');
  const main = document.querySelector('main');
  const lineOffsets = [...document.querySelectorAll('[data-statement-line]')]
    .map(el => Math.round(el.getBoundingClientRect().top - el.parentElement.getBoundingClientRect().top));
  return {
    scrollY: Math.round(scrollY),
    mainOpacity: main ? getComputedStyle(main).opacity : null,
    frameTop: frame ? Math.round(frame.getBoundingClientRect().top) : null,
    stageHeight: stage ? Math.round(stage.getBoundingClientRect().height) : null,
    heading: op('[data-heading]'),
    headingText: heading ? heading.textContent.trim().slice(0, 24) : null,
    terminal: op('[data-block="terminal"]'),
    statement: op('[data-block="statement"]'),
    spec: op('[data-block="spec"]'),
    portrait: op('[data-portrait]'),
    counts: [...document.querySelectorAll('[data-count]')].map(el => el.textContent),
    lineOffsets,
    overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    canvases: document.querySelectorAll('canvas').length,
  };
})()`;

let pass = 0, fail = 0;
const check = (label, ok, detail = "") => {
  console.log(`  ${ok ? "PASS" : "**** FAIL ****"}  ${label}${detail ? `  ${detail}` : ""}`);
  ok ? pass++ : fail++;
};

/**
 * Scroll to a fraction of the stage's own choreography range and settle.
 * `scrub: 1` means the timeline chases the scroll position over ~1s, so the
 * wait is not politeness — sampling earlier reads a frame mid-catch-up.
 */
async function seek(fraction) {
  await evalJs(`(() => {
    const stage = document.querySelector('[aria-labelledby="identity-heading"]');
    const top = stage.getBoundingClientRect().top + scrollY;
    const travel = innerHeight * 1.15;           // matches TRAVEL in IdentityStage
    scrollTo(0, Math.round(top + travel * ${fraction}));
    return 1;
  })()`);
  await sleep(1500);
}

async function runPass({ name, width, height, reduced, stops }) {
  console.log(`\n=== ${name} (${width}x${height}${reduced ? ", reduced motion" : ""}) ===`);
  await send("Emulation.setDeviceMetricsOverride", {
    width, height, deviceScaleFactor: 1, mobile: width < 800,
  });
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: reduced ? "reduce" : "no-preference" }],
  });

  await send("Page.navigate", { url: `${BASE}/about` });
  await sleep(3000);                     // fonts, hydration, mode upgrade, canvas

  const first = await evalJs(PROBE);
  check("heading rendered", first.headingText === "WHO IS BEHIND THIS", `got "${first.headingText}"`);
  check("no horizontal overflow", first.overflowX <= 1, `overflowX=${first.overflowX}`);
  check("main is opaque", Number(first.mainOpacity) > 0.99, `opacity=${first.mainOpacity}`);

  if (reduced) {
    // The design test: with motion removed the whole composition must be there.
    check("statement present at rest", first.statement === null || first.statement > 0.99, `op=${first.statement}`);
    check("spec present at rest", first.spec === null || first.spec > 0.99, `op=${first.spec}`);
    check("counters show real values", first.counts.every((c) => c !== "00"), first.counts.join(","));
    check("no WebGL canvas (photo path)", first.canvases === 0, `canvases=${first.canvases}`);
    const px = await shot(`${name}-rest`);
    console.log(`  frame: ${OUT}/${name}-rest.png (${px} bytes)`);
    return;
  }

  for (const f of stops) {
    await seek(f);
    const s = await evalJs(PROBE);
    const px = await shot(`${name}-${String(Math.round(f * 100)).padStart(3, "0")}`);
    console.log(
      `  @${String(Math.round(f * 100)).padStart(3)}%  frameTop=${String(s.frameTop).padStart(5)} ` +
      `head=${s.heading} term=${s.terminal} stmt=${s.statement} spec=${s.spec} ` +
      `counts=${s.counts.join("/")} px=${px}`,
    );

    if (name === "cinematic") {
      // The pin is the load-bearing claim: the frame must stay at the top of
      // the viewport for the whole choreography. If pinType were wrong this is
      // the assertion that catches it.
      if (f > 0.05 && f < 0.95) {
        check(`pin holds at ${Math.round(f * 100)}%`, Math.abs(s.frameTop) <= 4, `frameTop=${s.frameTop}`);
      }
      if (Math.abs(f - 0.4) < 0.01) {
        check("40%: statement at focal plane", s.statement > 0.85, `op=${s.statement}`);
        check("40%: statement lines unmasked", s.lineOffsets.every((o) => Math.abs(o) <= 4), s.lineOffsets.join(","));
        check("40%: terminal has receded", s.terminal < 0.5, `op=${s.terminal}`);
      }
      if (Math.abs(f - 0.7) < 0.01) {
        check("70%: specification at focal plane", s.spec > 0.85, `op=${s.spec}`);
        check("70%: values counted", s.counts.some((c) => c !== "00"), s.counts.join(","));
      }
      if (Math.abs(f - 1) < 0.01) {
        check("100%: heading has left the field", s.heading < 0.25, `op=${s.heading}`);
      }
    }
  }
}

await runPass({
  name: "cinematic", width: 1440, height: 900, reduced: false,
  stops: [0, 0.25, 0.4, 0.55, 0.7, 0.85, 1],
});
await runPass({
  name: "flow", width: 390, height: 844, reduced: false,
  stops: [0, 0.4, 0.8],
});
await runPass({ name: "reduced", width: 1440, height: 900, reduced: true, stops: [] });

console.log(`\n================ ${fail === 0 ? "ALL PASS" : "FAILURES PRESENT"} ================`);
console.log(`pass=${pass} fail=${fail}   frames in ${OUT}/`);

try { ws.close(); } catch {}
chrome.kill();
await sleep(300);
process.exit(fail === 0 ? 0 : 1);
