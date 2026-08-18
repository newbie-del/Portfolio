/**
 * Aggressive verification: hammer client-side navigation every way that can
 * strand a route wrapper, and assert the page is actually painted each time.
 *
 * Covers: every route, cold and scrolled, rapid double-navigation, back/forward,
 * and a re-visit of a route already in the router cache.
 *
 * Guards the bug fixed in components/layout/Shell.tsx, where a route could be
 * fully present in the DOM at opacity 0 until a manual reload.
 *
 * RUN IT AGAINST A PRODUCTION BUILD:
 *
 *   npm run build && npx next start -p 3123    # one terminal
 *   npm run verify:nav                         # another
 *
 * `next dev` produces two false failures that look exactly like product bugs.
 * A route's first-ever request is compiled on demand (/journey took 3.7s here
 * against 33ms warm) and the App Router does not change the URL until the RSC
 * payload lands, so a click can still be in flight when the probe samples. And
 * a dev server left running while files change under it serves stale chunk
 * URLs — `ChunkLoadError: Loading chunk app/contact/page failed` with a 404,
 * which surfaces as the error boundary and reads as a broken page. Both are the
 * dev server, not the site.
 *
 * Overridable: BASE (default http://localhost:3123), CHROME (path to Chrome).
 * Zero dependencies — drives real headless Chrome over the DevTools Protocol
 * using Node's global WebSocket.
 */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME =
  process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.BASE || "http://localhost:3123";
const PORT = 9413;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = mkdtempSync(join(tmpdir(), "cdpv-"));
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`, "--headless=new",
  "--no-first-run", "--no-default-browser-check", "--disable-extensions",
  "--window-size=1440,900", `${BASE}/`,
], { stdio: "ignore" });

let wsUrl;
for (let i = 0; i < 80 && !wsUrl; i++) {
  try {
    const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    const p = list.find((t) => t.type === "page" && t.url.startsWith(BASE));
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
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description);
  return r.result.value;
};

const PROBE = `(() => {
  const main = document.querySelector('main');
  const cs = main && getComputedStyle(main);
  const curtain = document.querySelector('.route-curtain');
  const ccs = curtain && getComputedStyle(curtain);
  const text = (main?.innerText || '').trim();
  const vis = [...(main?.querySelectorAll('section, h1, h2, p, article, li') || [])].filter(el => {
    const r = el.getBoundingClientRect(); const s = getComputedStyle(el);
    return r.bottom > 0 && r.top < innerHeight && r.height > 0 &&
           parseFloat(s.opacity) > 0.01 && s.visibility !== 'hidden';
  }).length;
  return {
    path: location.pathname, scrollY: Math.round(scrollY),
    mainOpacity: cs ? cs.opacity : null, mainTransform: cs ? cs.transform : null,
    textLen: text.length, visibleEls: vis,
    curtainTransform: ccs ? ccs.transform : 'none',
  };
})()`;

/**
 * Wait until the URL actually reaches `expected`, up to `budget` ms.
 *
 * This is not politeness about slow machines. In the App Router the URL does
 * not change until the RSC payload for the new route has arrived, and in `next
 * dev` the first request for a route compiles it on demand — /journey took
 * 3.7s and /contact 2.5s on their first hit here, against 20-50ms once warm.
 * A fixed sleep shorter than that leaves the probe reading the OLD page, which
 * is exactly how a navigation that never happened can look like a pass.
 *
 * Returns the last-seen path either way; the assertion belongs to the caller.
 */
async function waitForPath(expected, budget = 12000) {
  const step = 100;
  let seen = await evalJs("location.pathname");
  for (let waited = 0; waited < budget && seen !== expected; waited += step) {
    await sleep(step);
    seen = await evalJs("location.pathname");
  }
  // The URL commits before the paint; give the entrance animation its window.
  if (seen === expected) await sleep(700);
  return seen;
}

/**
 * A route counts as painted only if we ARRIVED (`expected`), the wrapper is
 * opaque, and pixels are actually there.
 *
 * The path check is load-bearing. Without it this harness reported PASS for
 * "click /journey" while the browser was still sitting on the home page: home
 * was painted, so every other condition held. Any check that can be satisfied
 * by the wrong page is not a check.
 *
 * It POLLS rather than screenshotting once after a fixed sleep. A hard document
 * load commits the URL before anything renders, and above-the-fold content
 * starts at opacity 0 until its reveal fires — so a single early sample catches
 * a legitimately-loading page mid-blank. Polling also means no sleep constant
 * has to be re-tuned for a slower machine or a colder cache.
 *
 * This stays a real assertion: the bug it guards against left routes blank
 * until a manual reload, which no budget would have rescued.
 *
 * Pass `expected` as null only where the destination is genuinely not known.
 */
async function assertPainted(label, expected, budget = 9000) {
  const step = 250;
  let s, bytes, arrived, curtainUp, ok = false;

  for (let waited = 0; ; waited += step) {
    s = await evalJs(PROBE);
    const { data } = await send("Page.captureScreenshot", { format: "png" });
    bytes = Buffer.from(data, "base64").length;
    // curtain must be collapsed (scaleY 0 -> matrix with d=0) or absent
    curtainUp = /matrix\(1, 0, 0, 1[^)]*\)/.test(s.curtainTransform);
    arrived = expected === null || s.path === expected;
    ok =
      arrived &&
      Number(s.mainOpacity) > 0.99 &&
      s.textLen > 200 &&
      s.visibleEls > 0 &&
      bytes > 60000 &&
      !curtainUp;
    if (ok || waited >= budget) break;
    await sleep(step);
  }

  const flag = ok ? "PASS" : "**** FAIL ****";
  const why = arrived ? "" : `  <-- expected ${expected}, still on ${s.path}`;
  console.log(
    `${flag}  ${label.padEnd(46)} path=${s.path.padEnd(9)} op=${s.mainOpacity} ` +
    `tf=${s.mainTransform === "none" ? "none" : s.mainTransform} text=${s.textLen} ` +
    `vis=${s.visibleEls} y=${s.scrollY} px=${bytes} curtain=${s.curtainTransform}${why}`,
  );
  return ok;
}

const hardLoad = async (path) => {
  await send("Page.navigate", { url: BASE + path });
  await waitForPath(path);
};
const click = async (href) => {
  await evalJs(`(() => { const a=[...document.querySelectorAll('a[href="${href}"]')][0]; if(!a) throw new Error('no link ${href}'); a.click(); return 1; })()`);
};
/** Click a link and wait until the browser has actually arrived. */
const go = async (href) => {
  await click(href);
  await waitForPath(href);
};

const ROUTES = ["/about", "/work", "/stack", "/journey", "/playground", "/contact"];
let pass = 0, fail = 0;
const tally = (ok) => (ok ? pass++ : fail++);

console.log("\n=== A. cold home -> each route by click (no refresh) ===");
for (const r of ROUTES) {
  await hardLoad("/");
  await go(r);
  tally(await assertPainted(`click ${r} from top of home`, r));
}

console.log("\n=== B. scrolled home -> each route by click (the original trigger) ===");
for (const r of ROUTES) {
  await hardLoad("/");
  await evalJs(`scrollTo(0, document.documentElement.scrollHeight * 0.6)`);
  await sleep(500);
  await go(r);
  tally(await assertPainted(`click ${r} from scrolled home`, r));
}

console.log("\n=== C. route -> route chains (cached targets) ===");
await hardLoad("/");
for (const r of [...ROUTES, "/about", "/work", "/about", "/work"]) {
  await go(r);
  tally(await assertPainted(`chain -> ${r}`, r));
}

console.log("\n=== D. rapid double-navigation (interrupt mid-transition) ===");
for (const [a, b] of [["/about", "/work"], ["/work", "/stack"], ["/contact", "/about"]]) {
  await hardLoad("/");
  await click(a);
  await sleep(120);            // interrupt while the first transition is still running
  await click(b);
  await waitForPath(b);
  tally(await assertPainted(`${a} then ${b} after 120ms`, b));
}

console.log("\n=== E. browser back / forward ===");
await hardLoad("/");
await go("/about");
await go("/work");
await evalJs("history.back()"); await waitForPath("/about");
tally(await assertPainted("history.back() to /about", "/about"));
await evalJs("history.forward()"); await waitForPath("/work");
tally(await assertPainted("history.forward() to /work", "/work"));
await evalJs("history.go(-2)"); await waitForPath("/");
tally(await assertPainted("history.go(-2) to /", "/"));

console.log("\n=== F. hard refresh still fine (regression check) ===");
for (const r of ["/", ...ROUTES]) {
  await hardLoad(r);
  tally(await assertPainted(`hard load ${r}`, r));
}

console.log(`\n================ ${fail === 0 ? "ALL PASS" : "FAILURES PRESENT"} ================`);
console.log(`pass=${pass} fail=${fail}`);

try { ws.close(); } catch {}
chrome.kill();
await sleep(300);
process.exit(fail === 0 ? 0 : 1);
