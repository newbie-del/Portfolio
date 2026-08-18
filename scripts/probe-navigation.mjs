/**
 * Zero-dependency CDP probe: reproduce the "blank until refresh" navigation bug.
 * Drives real Chrome headless via the DevTools Protocol (Node 24 global WebSocket).
 *
 * This is the minimal reproduction, kept alongside the full suite in
 * verify-navigation.mjs so the original failure stays reproducible.
 *
 * Overridable: BASE (default http://localhost:3123), CHROME (path to Chrome).
 */
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME =
  process.env.CHROME || "C:/Program Files/Google/Chrome/Application/chrome.exe";
const BASE = process.env.BASE || "http://localhost:3123";
const PORT = 9411;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const profile = mkdtempSync(join(tmpdir(), "cdp-"));
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${profile}`,
  "--headless=new",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  "--window-size=1440,900",
  `${BASE}/`,
], { stdio: "ignore" });

async function target() {
  for (let i = 0; i < 80; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
      // Only our own app tab — Edge/Chrome expose extra internal page targets.
      const page = list.find(
        (t) => t.type === "page" && t.url.startsWith("http://localhost:3123"),
      );
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error("app page target never appeared");
}

const ws = new WebSocket(await target());
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
const consoleErrors = [];
ws.onmessage = (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  }
  if (msg.method === "Log.entryAdded" && msg.params.entry.level === "error") {
    consoleErrors.push(msg.params.entry.text);
  }
  if (msg.method === "Runtime.exceptionThrown") {
    consoleErrors.push(msg.params.exceptionDetails.exception?.description || "exception");
  }
};
const send = (method, params = {}) =>
  new Promise((resolve, reject) => {
    const n = ++id;
    pending.set(n, { resolve, reject });
    ws.send(JSON.stringify({ id: n, method, params }));
  });

await send("Page.enable");
await send("Runtime.enable");
await send("Log.enable");

const evalJs = async (expression) => {
  const r = await send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description);
  return r.result.value;
};

/** Everything we need to tell the four candidate failure modes apart. */
const PROBE = `(() => {
  const main = document.querySelector('main');
  const curtains = [...document.querySelectorAll('[aria-hidden].fixed.inset-0')]
    .filter(el => getComputedStyle(el).zIndex === '60');
  const text = (main?.innerText || '').trim();
  // How much of the visible viewport is actually painted with content?
  const vis = [...(main?.querySelectorAll('section, h1, h2, p, article, li') || [])].filter(el => {
    const r = el.getBoundingClientRect();
    const s = getComputedStyle(el);
    return r.bottom > 0 && r.top < innerHeight && r.height > 0 &&
           parseFloat(s.opacity) > 0.01 && s.visibility !== 'hidden';
  }).length;
  const zeroOpacity = [...(main?.querySelectorAll('*') || [])]
    .filter(el => parseFloat(getComputedStyle(el).opacity) < 0.01).length;
  return {
    path: location.pathname,
    scrollY: Math.round(scrollY),
    docHeight: document.documentElement.scrollHeight,
    mainExists: !!main,
    mainOpacity: main ? getComputedStyle(main).opacity : null,
    mainTransform: main ? getComputedStyle(main).transform : null,
    mainTextLen: text.length,
    mainTextHead: text.slice(0, 60).replace(/\\s+/g, ' '),
    visibleContentEls: vis,
    zeroOpacityEls: zeroOpacity,
    curtains: curtains.map(c => ({
      transform: getComputedStyle(c).transform,
      opacity: getComputedStyle(c).opacity,
      bg: getComputedStyle(c).backgroundColor,
    })),
  };
})()`;

const shot = async (label) => {
  const s = await evalJs(PROBE);
  // Is the viewport actually black? Sample the rendered pixels.
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  const buf = Buffer.from(data, "base64");
  console.log(`\n===== ${label} =====`);
  console.log(JSON.stringify(s, null, 2));
  console.log(`screenshot bytes: ${buf.length} (a flat/blank frame compresses very small)`);
  return { ...s, bytes: buf.length };
};

const goto = async (url) => {
  await send("Page.navigate", { url });
  await sleep(2500);
};

console.log("### STEP 1 — hard load the homepage");
await goto(`${BASE}/`);
await shot("HOME (hard load)");

console.log("\n### STEP 2 — client-side click on the ABOUT rail link (no refresh)");
await evalJs(`(() => {
  const a = [...document.querySelectorAll('a[href="/about"]')][0];
  a.scrollIntoView(); a.click(); return true;
})()`);
await sleep(3000);
const about = await shot("ABOUT (after client-side nav)");

console.log("\n### STEP 3 — same URL, but hard refresh");
await goto(`${BASE}/about`);
const aboutFresh = await shot("ABOUT (hard refresh)");

console.log("\n### STEP 4 — home -> scroll down -> click WORK (client-side nav)");
await goto(`${BASE}/`);
await evalJs(`scrollTo(0, document.documentElement.scrollHeight * 0.6)`);
await sleep(600);
await evalJs(`(() => {
  const a = [...document.querySelectorAll('a[href="/work"]')][0];
  a.click(); return true;
})()`);
await sleep(3000);
const work = await shot("WORK (after client-side nav from scrolled home)");

console.log("\n### STEP 5 — WORK hard refresh");
await goto(`${BASE}/work`);
const workFresh = await shot("WORK (hard refresh)");

console.log("\n\n================ VERDICT ================");
const cmp = (navd, fresh, name) => {
  console.log(`\n${name}:`);
  console.log(`  client-nav : opacity=${navd.mainOpacity} textLen=${navd.mainTextLen} visibleEls=${navd.visibleContentEls} scrollY=${navd.scrollY} bytes=${navd.bytes}`);
  console.log(`  refresh    : opacity=${fresh.mainOpacity} textLen=${fresh.mainTextLen} visibleEls=${fresh.visibleContentEls} scrollY=${fresh.scrollY} bytes=${fresh.bytes}`);
  const blank = navd.visibleContentEls === 0 || Number(navd.mainOpacity) < 0.01 || navd.mainTextLen === 0;
  console.log(`  => ${blank ? "*** BLANK ON CLIENT NAV — REPRODUCED ***" : "renders on client nav"}`);
};
cmp(about, aboutFresh, "/about");
cmp(work, workFresh, "/work");
if (consoleErrors.length) {
  console.log("\nconsole errors:");
  for (const e of [...new Set(consoleErrors)].slice(0, 10)) console.log("  - " + e.slice(0, 300));
} else {
  console.log("\nno console errors captured (so it is not a thrown/chunk-load error)");
}

try { ws.close(); } catch {}
chrome.kill();
await sleep(300);
process.exit(0);
