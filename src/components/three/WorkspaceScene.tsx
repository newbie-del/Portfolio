"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import { BEAT, WAKE, ramp, smootherstep } from "@/lib/motion";

/* ===========================================================================
   THE WORKSPACE
   ---------------------------------------------------------------------------
   ref-visual1.png rebuilt as a running room rather than a lit photograph.

   The composition is weighted to the right of frame because the headline
   overlays the left third. Read left to right the shot is: rain on a night
   window, a poster, a warm lamp, a laptop showing real work, then a wall of
   five screens climbing away to the right, and a machine breathing violet at
   the far edge.

   Three grading rules, all taken off the reference:
     - Lime is the only accent with authority. Violet, azure and amber appear
       once each, attached to a specific object (the tower, the map, the lamp),
       never sprayed across the scene.
     - Nothing is pure black. The floor is #050506 and the fog is #04040 6, so
       depth survives.
     - Light comes from things that would actually emit it: five screens, one
       bulb, one window, one keyboard, one set of fans. There is no invisible
       studio fill making everything pleasant.
   ========================================================================= */

/* --- SCREEN PALETTE -------------------------------------------------------
 * Deliberately narrower than a syntax theme. Six values, so five screens
 * running different content still read as one room.
 */
const S = {
  bg: "#07070b",
  chrome: "#0e0e14",
  grid: "#181820",
  dim: "#3a3a46",
  text: "#8e909c",
  bright: "#d6d8de",
  lime: "#b4e34a",
  violet: "#a78bfa",
  azure: "#6aa9e9",
  amber: "#d9a343",
  rose: "#e08a8a",
};

/** Deterministic PRNG. Screen content must be identical on every reload — a
 *  workspace that reshuffles itself on refresh reads as generated. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Canvas monospace. Named stacks only: next/font hashes its family names, so
 *  they are not addressable from a 2D context. */
const MONO = (px: number, weight = 400) =>
  `${weight} ${px}px ui-monospace, "Cascadia Mono", Consolas, "DejaVu Sans Mono", monospace`;

interface Painter {
  texture: THREE.CanvasTexture;
  paint: (t: number) => void;
  /** Seconds between repaints. Content that changes slowly is drawn slowly. */
  interval: number;
}

function makeCanvas(w: number, h: number) {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return { ctx, texture, w, h };
}

/* ===========================================================================
   SCREEN 01/02 — EDITORS
   ---------------------------------------------------------------------------
   Real lines, not coloured bars. At this scale you cannot read them, but word
   shapes and indent rhythm are what the eye uses to decide whether something
   is code, and random bars fail that test immediately.
   ========================================================================= */

type Tok = [string, string];

const EDITOR_A: Tok[][] = [
  [["import", S.violet], [" * as ", S.text], ["THREE", S.lime], [" from ", S.text], ['"three"', S.amber]],
  [["import", S.violet], [" { useFrame } ", S.text], ["from", S.violet], [' "@react-three/fiber"', S.amber]],
  [],
  [["export function ", S.violet], ["Monitor", S.azure], ["({ position, kind }) {", S.text]],
  [["  const", S.violet], [" screen = ", S.text], ["useMemo", S.azure], ["(() => ", S.text]],
  [["    createScreen", S.azure], ["(kind, ", S.text], ["640", S.rose], [", ", S.text], ["400", S.rose], ["), [kind])", S.text]],
  [],
  [["  useFrame", S.azure], ["(({ clock }, delta) => {", S.text]],
  [["    const", S.violet], [" t = clock.elapsedTime", S.text]],
  [["    if", S.violet], [" (t - last.current > screen.interval) {", S.text]],
  [["      screen.", S.text], ["paint", S.azure], ["(t)", S.text]],
  [["      last.current = t", S.text]],
  [["    }", S.text]],
  [["  })", S.text]],
  [],
  [["  return", S.violet], [" (", S.text]],
  [["    <group ", S.text], ["position", S.lime], ["={position}>", S.text]],
  [["      <mesh>", S.text]],
  [["        <planeGeometry ", S.text], ["args", S.lime], ["={size} />", S.text]],
  [["        <meshBasicMaterial ", S.text], ["map", S.lime], ["={screen.texture} />", S.text]],
  [["      </mesh>", S.text]],
  [["    </group>", S.text]],
  [["  )", S.text]],
  [["}", S.text]],
  [],
  [["// damping stays frame-rate independent", S.dim]],
  [["const", S.violet], [" k = ", S.text], ["1", S.rose], [" - Math.", S.text], ["pow", S.azure], ["(", S.text], ["0.001", S.rose], [", delta)", S.text]],
  [["camera.position.x += (target.x - camera.position.x) * k", S.text]],
];

const EDITOR_B: Tok[][] = [
  [["export async function ", S.violet], ["POST", S.azure], ["(req: ", S.text], ["Request", S.lime], [") {", S.text]],
  [["  const", S.violet], [" { messages, model } = ", S.text], ["await", S.violet], [" req.", S.text], ["json", S.azure], ["()", S.text]],
  [],
  [["  const", S.violet], [" stream = ", S.text], ["await", S.violet], [" client.messages.", S.text], ["stream", S.azure], ["({", S.text]],
  [["    model,", S.text]],
  [["    max_tokens: ", S.text], ["4096", S.rose], [",", S.text]],
  [["    system: SYSTEM_PROMPT,", S.text]],
  [["    messages,", S.text]],
  [["  })", S.text]],
  [],
  [["  for await", S.violet], [" (", S.text], ["const", S.violet], [" event ", S.violet], ["of", S.violet], [" stream) {", S.text]],
  [["    if", S.violet], [" (event.type === ", S.text], ['"content_block_delta"', S.amber], [") {", S.text]],
  [["      controller.", S.text], ["enqueue", S.azure], ["(encode(event.delta.text))", S.text]],
  [["    }", S.text]],
  [["  }", S.text]],
  [],
  [["  return new", S.violet], [" Response(readable, {", S.text]],
  [["    headers: { ", S.text], ['"content-type"', S.amber], [": ", S.text], ['"text/event-stream"', S.amber], [" },", S.text]],
  [["  })", S.text]],
  [["}", S.text]],
  [],
  [["// retry with jitter so a spike never becomes a stampede", S.dim]],
  [["const", S.violet], [" wait = base * ", S.text], ["2", S.rose], [" ** attempt + Math.", S.text], ["random", S.azure], ["() * ", S.text], ["120", S.rose]],
];

function createEditor(seed: number, accent: string): Painter {
  const { ctx, texture, w, h } = makeCanvas(640, 400);
  const lines = seed % 2 === 0 ? EDITOR_A : EDITOR_B;
  const lineH = 12.4;
  const top = 30;
  const gutter = 30;

  return {
    texture,
    interval: 1 / 5,
    paint(t) {
      ctx.fillStyle = S.bg;
      ctx.fillRect(0, 0, w, h);

      // Window chrome: tab strip and a sidebar. Without it the plane reads as
      // a poster of code rather than an editor.
      ctx.fillStyle = S.chrome;
      ctx.fillRect(0, 0, w, 20);
      ctx.fillRect(0, 20, 20, h - 20);
      ctx.fillStyle = accent;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(0, 20, 2, h - 20);
      ctx.globalAlpha = 1;

      ctx.font = MONO(9);
      ctx.textBaseline = "middle";
      ctx.fillStyle = S.text;
      ctx.fillText(seed % 2 === 0 ? "Monitor.tsx" : "route.ts", 30, 10);
      ctx.fillStyle = S.dim;
      ctx.fillText(seed % 2 === 0 ? "screens.ts" : "client.ts", 110, 10);
      // active tab underline
      ctx.fillStyle = accent;
      ctx.fillRect(28, 18, 58, 1.5);

      // The active line travels down the file every few seconds, the way a
      // cursor does when someone is actually reading.
      const activeRow = Math.floor(t * 0.55) % lines.length;
      ctx.fillStyle = "rgba(255,255,255,0.035)";
      ctx.fillRect(20, top + activeRow * lineH - lineH / 2, w - 20, lineH);

      ctx.font = MONO(10);
      lines.forEach((toks, i) => {
        const y = top + i * lineH;
        if (y > h - 8) return;

        ctx.fillStyle = i === activeRow ? S.text : S.dim;
        ctx.fillText(String(i + 1).padStart(2, " "), gutter - 22, y);

        let x = gutter;
        toks.forEach(([str, color]) => {
          ctx.fillStyle = color;
          ctx.globalAlpha = i === activeRow ? 1 : 0.82;
          ctx.fillText(str, x, y);
          x += ctx.measureText(str).width;
        });
        ctx.globalAlpha = 1;

        // Block caret parked at the end of the active line.
        if (i === activeRow && Math.floor(t * 1.9) % 2 === 0) {
          ctx.fillStyle = accent;
          ctx.fillRect(x + 1, y - 5, 5, 10);
        }
      });

      // Minimap. Cheap, and it is the detail that makes an editor an editor.
      ctx.globalAlpha = 0.32;
      lines.forEach((toks, i) => {
        let x = w - 46;
        toks.forEach(([str, color]) => {
          const bw = str.length * 0.72;
          ctx.fillStyle = color;
          ctx.fillRect(x, 30 + i * 4.4, bw, 1.6);
          x += bw + 1.4;
        });
      });
      ctx.globalAlpha = 1;

      texture.needsUpdate = true;
    },
  };
}

/* ===========================================================================
   SCREEN 03 — NODE GRAPH
   ---------------------------------------------------------------------------
   A service topology. Edges light up one at a time, so the graph reads as
   traffic moving through a system rather than as decoration.
   ========================================================================= */

function createGraph(seed: number): Painter {
  const { ctx, texture, w, h } = makeCanvas(512, 330);
  const rand = rng(seed);

  const nodes = [
    { x: 0.16, y: 0.22, label: "ingest" },
    { x: 0.16, y: 0.56, label: "queue" },
    { x: 0.16, y: 0.86, label: "cache" },
    { x: 0.5, y: 0.2, label: "router" },
    { x: 0.5, y: 0.5, label: "agent" },
    { x: 0.5, y: 0.8, label: "store" },
    { x: 0.84, y: 0.3, label: "stream" },
    { x: 0.84, y: 0.66, label: "client" },
  ].map((n) => ({ ...n, px: 20 + n.x * (w - 60), py: 26 + n.y * (h - 62) }));

  const edges: [number, number][] = [
    [0, 3], [0, 4], [1, 4], [2, 4], [3, 4], [3, 6],
    [4, 5], [4, 6], [5, 7], [6, 7], [1, 5],
  ];
  const phases = edges.map(() => rand() * 6.28);

  return {
    texture,
    interval: 1 / 12,
    paint(t) {
      ctx.fillStyle = S.bg;
      ctx.fillRect(0, 0, w, h);

      // Faint measurement grid. 32px so it never competes with the graph.
      ctx.strokeStyle = S.grid;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      for (let x = 0; x < w; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x + 0.5, 22);
        ctx.lineTo(x + 0.5, h);
        ctx.stroke();
      }
      for (let y = 22; y < h; y += 32) {
        ctx.beginPath();
        ctx.moveTo(0, y + 0.5);
        ctx.lineTo(w, y + 0.5);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      ctx.fillStyle = S.chrome;
      ctx.fillRect(0, 0, w, 22);
      ctx.font = MONO(9);
      ctx.textBaseline = "middle";
      ctx.fillStyle = S.text;
      ctx.fillText("SERVICE GRAPH", 10, 11);
      ctx.fillStyle = S.lime;
      ctx.fillText("11 EDGES", w - 68, 11);

      // Edges, with one travelling packet each.
      edges.forEach(([a, b], i) => {
        const A = nodes[a];
        const B = nodes[b];
        ctx.strokeStyle = S.dim;
        ctx.globalAlpha = 0.55;
        ctx.beginPath();
        ctx.moveTo(A.px, A.py);
        ctx.lineTo(B.px, B.py);
        ctx.stroke();

        const p = ((t * 0.42 + phases[i]) % 1);
        ctx.globalAlpha = Math.sin(p * Math.PI) * 0.95;
        ctx.fillStyle = i % 4 === 0 ? S.azure : S.lime;
        ctx.beginPath();
        ctx.arc(A.px + (B.px - A.px) * p, A.py + (B.py - A.py) * p, 2.2, 0, 6.29);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      // Nodes as labelled boxes, since a real topology names its services.
      ctx.font = MONO(8);
      nodes.forEach((n, i) => {
        const lit = Math.sin(t * 1.3 + i * 1.7) > 0.55;
        const bw = 52;
        const bh = 17;
        ctx.fillStyle = S.chrome;
        ctx.fillRect(n.px - bw / 2, n.py - bh / 2, bw, bh);
        ctx.strokeStyle = lit ? S.lime : S.dim;
        ctx.globalAlpha = lit ? 0.95 : 0.6;
        ctx.strokeRect(n.px - bw / 2 + 0.5, n.py - bh / 2 + 0.5, bw - 1, bh - 1);
        ctx.globalAlpha = 1;
        ctx.fillStyle = lit ? S.bright : S.text;
        ctx.fillText(n.label, n.px - bw / 2 + 6, n.py);
      });

      texture.needsUpdate = true;
    },
  };
}

/* ===========================================================================
   SCREEN 04 — LOG TABLE
   ---------------------------------------------------------------------------
   Densest of the five. Rows arrive from the bottom on a real cadence so the
   screen has a pulse the others do not.
   ========================================================================= */

const LOG_ROWS: [string, string, string][] = [
  ["GET", "/api/agents/stream", "200"],
  ["POST", "/api/session/init", "201"],
  ["GET", "/api/projects", "200"],
  ["POST", "/api/embed/batch", "202"],
  ["GET", "/api/health", "200"],
  ["POST", "/api/agents/tool", "200"],
  ["GET", "/api/metrics/live", "200"],
  ["POST", "/api/upload/chunk", "204"],
  ["GET", "/api/session/state", "200"],
  ["POST", "/api/index/rebuild", "202"],
  ["GET", "/api/agents/stream", "200"],
  ["PATCH", "/api/prefs", "200"],
  ["GET", "/api/queue/depth", "200"],
  ["POST", "/api/agents/spawn", "201"],
];

function createLogs(seed: number): Painter {
  const { ctx, texture, w, h } = makeCanvas(512, 330);
  const rand = rng(seed);
  const ms = LOG_ROWS.map(() => 8 + Math.floor(rand() * 180));
  const rowH = 15.5;
  const visible = Math.floor((h - 34) / rowH);

  return {
    texture,
    interval: 1 / 6,
    paint(t) {
      ctx.fillStyle = S.bg;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = S.chrome;
      ctx.fillRect(0, 0, w, 22);
      ctx.font = MONO(9);
      ctx.textBaseline = "middle";
      ctx.fillStyle = S.text;
      ctx.fillText("REQUEST LOG", 10, 11);
      ctx.fillStyle = S.lime;
      ctx.fillText("LIVE", w - 34, 11);

      // Column rules keep the table aligned, which is what makes it read as
      // tabular data instead of stacked sentences.
      const cols = [10, 52, 240, 320, 400];
      ctx.strokeStyle = S.grid;
      cols.slice(1).forEach((c) => {
        ctx.beginPath();
        ctx.moveTo(c - 8.5, 22);
        ctx.lineTo(c - 8.5, h);
        ctx.stroke();
      });

      const head = Math.floor(t * 0.85);
      ctx.font = MONO(9);

      for (let r = 0; r < visible; r++) {
        const idx = (head - r + LOG_ROWS.length * 4) % LOG_ROWS.length;
        const [verb, path, code] = LOG_ROWS[idx];
        const y = 34 + r * rowH;
        const fresh = r === 0;

        if (r % 2 === 0) {
          ctx.fillStyle = "rgba(255,255,255,0.018)";
          ctx.fillRect(0, y - rowH / 2, w, rowH);
        }
        if (fresh) {
          ctx.fillStyle = "rgba(180,227,74,0.07)";
          ctx.fillRect(0, y - rowH / 2, w, rowH);
        }

        // Time descends with the rows, so the newest row is the newest time.
        const secs = 2461 - r * 3;
        const stamp = `${String(Math.floor(secs / 60) % 24).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}`;
        ctx.fillStyle = S.dim;
        ctx.fillText(stamp, cols[0], y);

        ctx.fillStyle = verb === "GET" ? S.azure : verb === "POST" ? S.violet : S.amber;
        ctx.globalAlpha = fresh ? 1 : 0.8;
        ctx.fillText(verb, cols[1], y);

        ctx.fillStyle = fresh ? S.bright : S.text;
        ctx.fillText(path, cols[2] - 180, y);

        ctx.fillStyle = code.startsWith("2") ? S.lime : S.rose;
        ctx.fillText(code, cols[3], y);

        ctx.fillStyle = S.dim;
        ctx.fillText(`${ms[idx]}ms`, cols[4], y);
        ctx.globalAlpha = 1;

        // Inline latency bar. One glance tells you which call was slow.
        ctx.fillStyle = ms[idx] > 120 ? S.amber : S.lime;
        ctx.globalAlpha = 0.42;
        ctx.fillRect(cols[4] + 42, y - 3, (ms[idx] / 190) * 52, 6);
        ctx.globalAlpha = 1;
      }

      texture.needsUpdate = true;
    },
  };
}

/* ===========================================================================
   SCREEN 05 — CONNECTION MAP
   ---------------------------------------------------------------------------
   A dot-matrix world with arcs between nodes. The reference labels this
   "VISUALIZING CONNECTIONS", so the arcs are the point and the landmass is
   only there to give them somewhere to land.
   ========================================================================= */

const LAND = [
  "................................................",
  "...#####......................######............",
  "..###########..............############.........",
  ".##############...........###############.......",
  "..#############....####..################.......",
  "...##########.....#####..################.......",
  "....########......#####...###############.......",
  ".....#####........####.....############.........",
  "......###..........###......##########..........",
  ".......#...........###.......########...........",
  "......##...........####......#######............",
  ".....###...........####.......#####.......##....",
  ".....####..........####.......####......#####...",
  "......###..........####.......###.......######..",
  "......###..........###........###........####...",
  ".......##..........###.........#..........##....",
  ".......##...........#...........................",
  "........#.......................................",
];

function createMap(seed: number): Painter {
  const { ctx, texture, w, h } = makeCanvas(512, 330);
  const rand = rng(seed);

  const cols = LAND[0].length;
  const rows = LAND.length;
  const cell = Math.min((w - 28) / cols, (h - 54) / rows);
  const ox = (w - cell * cols) / 2;
  const oy = 30 + (h - 44 - cell * rows) / 2;

  // Nodes are pinned to actual land cells, so no marker floats in the ocean.
  const landCells: [number, number][] = [];
  LAND.forEach((row, r) =>
    [...row].forEach((c, i) => {
      if (c === "#") landCells.push([i, r]);
    }),
  );
  const nodes = Array.from({ length: 7 }, () => {
    const [cx, cy] = landCells[Math.floor(rand() * landCells.length)];
    return { x: ox + cx * cell + cell / 2, y: oy + cy * cell + cell / 2 };
  });
  const arcs = Array.from({ length: 6 }, (_, i) => ({
    a: nodes[i],
    b: nodes[(i + 2 + Math.floor(rand() * 3)) % nodes.length],
    phase: rand() * 6.28,
  }));

  return {
    texture,
    interval: 1 / 12,
    paint(t) {
      ctx.fillStyle = S.bg;
      ctx.fillRect(0, 0, w, h);

      ctx.fillStyle = S.chrome;
      ctx.fillRect(0, 0, w, 22);
      ctx.font = MONO(9);
      ctx.textBaseline = "middle";
      ctx.fillStyle = S.text;
      ctx.fillText("VISUALIZING CONNECTIONS", 10, 11);

      // Landmass. Dots, not fills: a matrix reads as a readout, a silhouette
      // reads as an illustration.
      const d = Math.max(1.1, cell * 0.3);
      LAND.forEach((row, r) => {
        [...row].forEach((c, i) => {
          if (c !== "#") return;
          const x = ox + i * cell + cell / 2;
          const y = oy + r * cell + cell / 2;
          // Slow horizontal shimmer, like a refresh sweeping the globe.
          const sweep = Math.sin(t * 0.6 - i * 0.18) * 0.5 + 0.5;
          ctx.globalAlpha = 0.22 + sweep * 0.3;
          ctx.fillStyle = S.azure;
          ctx.beginPath();
          ctx.arc(x, y, d, 0, 6.29);
          ctx.fill();
        });
      });
      ctx.globalAlpha = 1;

      // Arcs bow upward so overlapping routes stay distinguishable.
      arcs.forEach((arc, i) => {
        const { a, b } = arc;
        const mx = (a.x + b.x) / 2;
        const my = (a.y + b.y) / 2 - Math.abs(b.x - a.x) * 0.34 - 10;

        ctx.strokeStyle = S.lime;
        ctx.globalAlpha = 0.2;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.quadraticCurveTo(mx, my, b.x, b.y);
        ctx.stroke();

        // Packet riding the curve.
        const p = (t * 0.3 + arc.phase / 6.28 + i * 0.13) % 1;
        const q = 1 - p;
        const px = q * q * a.x + 2 * q * p * mx + p * p * b.x;
        const py = q * q * a.y + 2 * q * p * my + p * p * b.y;
        ctx.globalAlpha = Math.sin(p * Math.PI);
        ctx.fillStyle = S.lime;
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, 6.29);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      nodes.forEach((n, i) => {
        const pulse = (Math.sin(t * 1.6 + i * 1.1) + 1) / 2;
        ctx.strokeStyle = S.lime;
        ctx.globalAlpha = 0.5 - pulse * 0.4;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 3 + pulse * 7, 0, 6.29);
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.fillStyle = S.lime;
        ctx.beginPath();
        ctx.arc(n.x, n.y, 2.1, 0, 6.29);
        ctx.fill();
      });

      // Footer readout, so the panel has a baseline like the others.
      ctx.font = MONO(8);
      ctx.fillStyle = S.dim;
      ctx.fillText("NODES 07", 10, h - 10);
      ctx.fillStyle = S.lime;
      ctx.fillText("ALL REGIONS NOMINAL", w - 132, h - 10);

      texture.needsUpdate = true;
    },
  };
}

/* ===========================================================================
   WINDOW — NIGHT CITY
   ---------------------------------------------------------------------------
   Two layers. The skyline is a canvas repainted slowly, because lit windows
   flicker on a scale of seconds. Rain is a separate static texture scrolled by
   UV offset, which is continuous and costs nothing — repainting rain at 12fps
   would strobe.
   ========================================================================= */

function createCity(seed: number): Painter {
  /* PORTRAIT. The reference window is 164x407px on screen — a tall slot, not a
     picture window — so a square canvas was stretching the skyline into
     something twice as wide as the aperture could ever show. */
  const { ctx, texture, w, h } = makeCanvas(336, 768);
  const rand = rng(seed);

  /* Three ranks. Depth in a night skyline comes almost entirely from how much
     haze sits in front of each rank, so the ranks differ in alpha before they
     differ in height. */
  const ranks = [0, 1, 2].map((rankIdx) => {
    let x = -14;
    const out: { x: number; w: number; h: number; lights: [number, number][] }[] = [];
    while (x < w + 14) {
      const bw = 22 + rand() * 46;
      const bh = (rankIdx === 0 ? 120 : rankIdx === 1 ? 170 : 90) + rand() * 190;
      /* Windows on a per-floor grid. Dense: the reference's buildings read as
         near-black masses studded with HUNDREDS of small lights, and a sparse
         grid is what makes a canvas skyline look like a placeholder. */
      const lights: [number, number][] = [];
      for (let ly = 7; ly < bh - 5; ly += 7) {
        for (let lx = 3; lx < bw - 4; lx += 6) {
          if (rand() > 0.34) lights.push([lx, ly]);
        }
      }
      out.push({ x, w: bw, h: bh, lights });
      x += bw + 2 + rand() * 8;
    }
    return out;
  });

  /* The landmark, measured off the reference: a stepped tower with a lit spire
     occupying u 0.128..0.317, tip at v 0.354, base at v 0.658. */
  const LM = { x0: w * 0.128, x1: w * 0.317, tipY: h * 0.354, baseY: h * 0.658 };

  return {
    texture,
    interval: 1 / 3,
    paint(t) {
      /* Sky is LIGHTER than the buildings. This is the correction that makes
         the whole window read: a night city photographed from inside is
         silhouettes against sodium-lit cloud, not lit shapes against black. */
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#080b14");
      sky.addColorStop(0.42, "#111a2c");
      sky.addColorStop(0.74, "#22304c");
      sky.addColorStop(1, "#2e3c58");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      /* Light pollution: a warm bloom sitting on the skyline, brightest where
         the buildings are densest. */
      const glow = ctx.createRadialGradient(w * 0.46, h * 0.86, 0, w * 0.46, h * 0.86, h * 0.46);
      glow.addColorStop(0, "rgba(150,116,74,0.30)");
      glow.addColorStop(0.5, "rgba(96,84,72,0.13)");
      glow.addColorStop(1, "rgba(60,70,90,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, h * 0.4, w, h * 0.6);

      /* A bucketed clock, so windows switch on and off every few seconds but
         the pattern is identical on every reload. Deterministic, not static. */
      const bucket = Math.floor(t / 3);

      const drawRank = (
        rank: typeof ranks[number],
        baseY: number,
        fill: string,
        alpha: number,
        litAlpha: number,
        offset: number,
        step: number,
      ) => {
        rank.forEach((b, bi) => {
          ctx.globalAlpha = alpha;
          ctx.fillStyle = fill;
          ctx.fillRect(b.x + offset, baseY - b.h, b.w, b.h);
          /* Roof line catches the sky, which is what separates one dark mass
             from the dark mass behind it. */
          ctx.globalAlpha = alpha * 0.5;
          ctx.fillStyle = "#26334c";
          ctx.fillRect(b.x + offset, baseY - b.h, b.w, 1);
          ctx.globalAlpha = 1;

          b.lights.forEach(([lx, ly], li) => {
            const key = (bi * 31 + li * 17 + bucket * 7) % 97;
            if (key < 26) return;                       // dark tonight
            /* Predominantly warm. Cool windows are the exception, which is the
               opposite of the usual blue-office-block cliche. */
            const warm = (bi + li) % 7 !== 0;
            ctx.globalAlpha = litAlpha * (warm ? 0.62 + (key % 11) / 26 : 0.4);
            ctx.fillStyle = warm ? (key % 5 === 0 ? "#ffcf8e" : "#e8b478") : "#9fbfe4";
            ctx.fillRect(b.x + offset + lx, baseY - b.h + ly, 2.2, step);
          });
        });
        ctx.globalAlpha = 1;
      };

      /* Back to front. Dense band begins at v 0.493, per the reference. */
      drawRank(ranks[2], h * 0.74, "#131c2c", 0.86, 0.3, 9, 2.2);
      drawRank(ranks[1], h * 0.88, "#0d1523", 0.94, 0.5, 4, 2.6);
      drawRank(ranks[0], h * 1.02, "#070b13", 1, 0.82, 0, 3);

      /* The landmark. Stepped setbacks, then a lit spire — a shape with a
         silhouette you could name, which is what a skyline needs to stop
         looking procedural. */
      const lx0 = LM.x0;
      const lw = LM.x1 - LM.x0;
      const cx = (LM.x0 + LM.x1) / 2;
      ctx.fillStyle = "#080c15";
      ctx.fillRect(lx0, LM.baseY - (LM.baseY - LM.tipY) * 0.42, lw, h - LM.baseY + (LM.baseY - LM.tipY) * 0.42);
      ctx.fillRect(lx0 + lw * 0.14, LM.tipY + (LM.baseY - LM.tipY) * 0.24, lw * 0.72, (LM.baseY - LM.tipY) * 0.36);
      ctx.fillRect(cx - lw * 0.16, LM.tipY + (LM.baseY - LM.tipY) * 0.1, lw * 0.32, (LM.baseY - LM.tipY) * 0.2);
      ctx.fillRect(cx - 1.6, LM.tipY, 3.2, (LM.baseY - LM.tipY) * 0.12);

      /* Floor bands up the tower, brighter than the surrounding blocks. */
      for (let ly = 0; ly < 34; ly++) {
        const y = LM.baseY - (LM.baseY - LM.tipY) * 0.4 + ly * 7;
        if (y > h) break;
        ctx.globalAlpha = 0.42 + 0.3 * Math.sin(bucket + ly * 0.9);
        ctx.fillStyle = "#f0c58c";
        ctx.fillRect(lx0 + 3, y, lw - 6, 1.8);
      }
      /* Aircraft warning light. The only thing in the window that blinks. */
      ctx.globalAlpha = Math.sin(t * 1.7) > 0.72 ? 1 : 0.1;
      ctx.fillStyle = "#ff6b6b";
      ctx.fillRect(cx - 1.6, LM.tipY - 3, 3.2, 3.2);
      ctx.globalAlpha = 1;

      /* Wet-air haze, lifting the bottom third toward the sodium glow. */
      const haze = ctx.createLinearGradient(0, h * 0.56, 0, h);
      haze.addColorStop(0, "rgba(52,66,96,0)");
      haze.addColorStop(0.55, "rgba(66,74,94,0.2)");
      haze.addColorStop(1, "rgba(88,86,94,0.42)");
      ctx.fillStyle = haze;
      ctx.fillRect(0, h * 0.56, w, h * 0.44);

      texture.needsUpdate = true;
    },
  };
}

/** Static rain streaks, tiled and scrolled by UV offset. */
function createRainTexture(): THREE.CanvasTexture {
  const { ctx, texture, w, h } = makeCanvas(256, 256);
  const rand = rng(99);
  ctx.clearRect(0, 0, w, h);
  ctx.lineCap = "round";
  for (let i = 0; i < 190; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const len = 9 + rand() * 26;
    const a = 0.06 + rand() * 0.3;
    ctx.strokeStyle = `rgba(190,215,245,${a})`;
    ctx.lineWidth = rand() > 0.85 ? 1.4 : 0.7;
    ctx.beginPath();
    // Wind-driven, so every streak shares one angle.
    ctx.moveTo(x, y);
    ctx.lineTo(x - len * 0.22, y + len);
    ctx.stroke();
  }
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.needsUpdate = true;
  return texture;
}

/** Droplets clinging to the inside of the glass. Static: they belong to the
 *  pane, not to the weather, and moving them would fight the streaks. */
function createGlassTexture(): THREE.CanvasTexture {
  const { ctx, texture, w, h } = makeCanvas(256, 256);
  const rand = rng(4242);
  ctx.clearRect(0, 0, w, h);
  for (let i = 0; i < 130; i++) {
    const x = rand() * w;
    const y = rand() * h;
    const r = 0.7 + rand() * 2.4;
    ctx.fillStyle = `rgba(200,220,250,${0.05 + rand() * 0.17})`;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * (1 + rand() * 0.9), 0, 0, 6.29);
    ctx.fill();
  }
  texture.needsUpdate = true;
  return texture;
}

/* ===========================================================================
   THE DESK SURFACE
   ---------------------------------------------------------------------------
   At the reference framing the desk is the single largest area in the shot —
   it fills the whole lower two thirds. A flat colour there is what made the
   previous build read as a UI mockup rather than a room, so it gets a real
   surface: warm plank grain, seams, a few marks, and a broad warm-to-cool
   gradient that follows where the lamp actually is.

   Light POOLS are deliberately not baked in. Those come from the scene's own
   point lights, so if the lamp moves the pool moves with it.

   Canvas mapping (a separate plane, not the box, so the UVs are predictable):
     canvas x 0..w   ->  world x -3.70 .. 3.90
     canvas y 0..h   ->  world z -2.60 .. 3.20   (row 0 is the BACK edge)
   ========================================================================= */

function createDeskTop(): THREE.CanvasTexture {
  const { ctx, texture, w, h } = makeCanvas(1024, 782);
  const rand = rng(6161);

  // Base: dark warm walnut. Reads near-black at the scene's exposure, but the
  // hue survives, and hue is the whole difference between wood and plastic.
  ctx.fillStyle = "#1a140f";
  ctx.fillRect(0, 0, w, h);

  // Broad shading — warmer and lighter at back-left under the lamp, falling
  // away to a cool near-black at the front-right corner.
  const wash = ctx.createLinearGradient(w * 0.28, 0, w, h);
  wash.addColorStop(0, "rgba(72,52,34,0.5)");
  wash.addColorStop(0.45, "rgba(34,26,20,0.24)");
  wash.addColorStop(1, "rgba(8,8,11,0.6)");
  ctx.fillStyle = wash;
  ctx.fillRect(0, 0, w, h);

  // Grain. Long strokes along the desk's length, bundled so the figure varies
  // across the width instead of reading as uniform hatching.
  for (let i = 0; i < 2600; i++) {
    const y = rand() * h;
    const x = rand() * w;
    const len = 40 + rand() * 260;
    const light = rand() > 0.55;
    ctx.strokeStyle = light
      ? `rgba(126,96,64,${0.018 + rand() * 0.05})`
      : `rgba(6,5,4,${0.03 + rand() * 0.09})`;
    ctx.lineWidth = rand() > 0.9 ? 1.8 : 0.8;
    ctx.beginPath();
    ctx.moveTo(x, y);
    // A slight bow, so the grain follows the board rather than ruling it.
    ctx.bezierCurveTo(x + len * 0.35, y + (rand() - 0.5) * 3.4, x + len * 0.7, y + (rand() - 0.5) * 3.4, x + len, y);
    ctx.stroke();
  }

  // Plank seams, at constant z (horizontal here). Four boards across a 2.8m
  // desk, which is what a real slab of this width is made from.
  for (const fy of [0.19, 0.42, 0.63, 0.85]) {
    const y = fy * h + (rand() - 0.5) * 8;
    ctx.strokeStyle = "rgba(4,3,3,0.55)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
    // The lit edge of the next board up. Without it a seam reads as a scratch.
    ctx.strokeStyle = "rgba(122,94,62,0.16)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y + 1.8);
    ctx.lineTo(w, y + 1.8);
    ctx.stroke();
  }

  // Wear: a handful of rings and scuffs. Six, not sixty — a surface covered in
  // procedural marks looks generated, one with a few looks used.
  for (let i = 0; i < 6; i++) {
    const x = 140 + rand() * (w - 280);
    const y = 90 + rand() * (h - 180);
    const r = 12 + rand() * 26;
    ctx.strokeStyle = `rgba(96,74,50,${0.05 + rand() * 0.06})`;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.62, rand(), 0, 6.29);
    ctx.stroke();
  }

  // Fine tooth, so the specular from the lamp breaks up instead of sheeting.
  for (let i = 0; i < 14000; i++) {
    ctx.fillStyle = rand() > 0.5 ? "rgba(150,120,86,0.035)" : "rgba(0,0,0,0.05)";
    ctx.fillRect(rand() * w, rand() * h, 1, 1);
  }

  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}
/* The aperture, solved from the reference: a tall slot 164x407px on screen,
   which at this camera is 1.361 wide by 3.07 high on the wall plane. Its lower
   sixth is cut off by the desk's own back edge — which is why the reference
   window appears to stop at y=419 rather than carrying on to the floor. So the
   glass runs lower than it reads, and the desk does the cropping. */
const WIN = { W: 1.361, H: 3.07, x: -2.369, y: 0.485, z: -3.42 };

function CityWindow({ reduced }: { reduced: boolean }) {
  const city = useMemo(() => createCity(1207), []);
  const rain = useMemo(() => createRainTexture(), []);
  const glass = useMemo(() => createGlassTexture(), []);
  const last = useRef(0);
  const rainRef = useRef<THREE.MeshBasicMaterial>(null);
  const cityRef = useRef<THREE.MeshBasicMaterial>(null);
  const spill = useRef<THREE.PointLight>(null);

  useEffect(
    () => () => {
      city.texture.dispose();
      rain.dispose();
      glass.dispose();
    },
    [city, rain, glass],
  );

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (reduced) return;
    if (t - last.current > city.interval) {
      city.paint(t);
      last.current = t;
    }
    // Rain falls by UV offset: continuous at any frame rate.
    rain.offset.y = -(t * 0.62) % 1;
    rain.offset.x = (t * 0.13) % 1;

    /* The city is the FIRST thing to resolve — before the lamp, before any
       screen. For a beat the room is nothing but a rainy skyline and a
       silhouetted desk, which is what gives the rest of the wake-up somewhere
       to arrive from. */
    const up = smootherstep(ramp(t, WAKE.city.at, WAKE.city.dur));
    if (cityRef.current) cityRef.current.opacity = up;
    if (rainRef.current) {
      // Gusts, so the rain has weather rather than a constant rate.
      rainRef.current.opacity = up * (0.3 + Math.sin(t * 0.31) * 0.1);
    }
    if (spill.current) spill.current.intensity = up * 6.4;
  });

  const { W, H } = WIN;

  return (
    <group position={[WIN.x, WIN.y, WIN.z]}>
      {/* recess, so the window has depth instead of being a sticker */}
      <mesh position={[0, 0, -0.09]}>
        <planeGeometry args={[W + 0.2, H + 0.2]} />
        <meshBasicMaterial color="#04060b" toneMapped={false} fog={false} />
      </mesh>

      <mesh>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial
          ref={cityRef}
          map={city.texture}
          transparent
          opacity={reduced ? 1 : 0}
          toneMapped={false}
          fog={false}
        />
      </mesh>

      <mesh position={[0, 0, 0.012]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial
          ref={rainRef}
          map={rain}
          transparent
          opacity={reduced ? 0.28 : 0}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
        />
      </mesh>

      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[W, H]} />
        <meshBasicMaterial
          map={glass}
          transparent
          opacity={0.42}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
        />
      </mesh>

      {/* ONE continuous pane, jambs and rails only. The mullions that used to
          sit here were my invention, not the reference's — and a grid across the
          only bright shape in frame was fighting the composition. */}
      {[-W / 2 - 0.05, W / 2 + 0.05].map((x) => (
        <mesh key={`jamb${x}`} position={[x, 0, 0.03]}>
          <boxGeometry args={[0.1, H + 0.2, 0.1]} />
          <meshStandardMaterial color="#0b0b0f" roughness={0.62} metalness={0.38} />
        </mesh>
      ))}
      {[H / 2 + 0.05, -H / 2 - 0.05].map((y) => (
        <mesh key={`rail${y}`} position={[0, y, 0.03]}>
          <boxGeometry args={[W + 0.2, 0.1, 0.1]} />
          <meshStandardMaterial color="#0b0b0f" roughness={0.62} metalness={0.38} />
        </mesh>
      ))}

      {/* Cold spill from outside. Sits in front of the pane so it lights the
          room rather than the glass. */}
      <pointLight
        ref={spill}
        position={[0.5, -0.5, 1.7]}
        color="#4e7fbe"
        intensity={reduced ? 6.4 : 0}
        distance={7.5}
        decay={2}
      />
    </group>
  );
}

/* ===========================================================================
   MONITOR
   ========================================================================= */

type ScreenKind = "editor" | "graph" | "logs" | "map";

function Monitor({
  position,
  rotation = [0, 0, 0],
  size,
  kind,
  seed,
  tone,
  reduced,
  stand = "arm",
  armLen = 0.28,
  wakeAt = 0,
  glow = 1.2,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  kind: ScreenKind;
  seed: number;
  tone: string;
  reduced: boolean;
  stand?: "arm" | "foot" | "none";
  /**
   * Length of the vertical post, so the base plate lands on whatever surface is
   * actually under this monitor. A floating stand is the single fastest way to
   * make a room read as a render, and at the reference framing the riser and
   * the arm feet are both in shot.
   */
  armLen?: number;
  /** Seconds from mount at which this panel switches on. */
  wakeAt?: number;
  glow?: number;
}) {
  const screen = useMemo<Painter>(() => {
    if (kind === "editor") return createEditor(seed, tone);
    if (kind === "graph") return createGraph(seed);
    if (kind === "logs") return createLogs(seed);
    return createMap(seed);
  }, [kind, seed, tone]);

  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const panelRef = useRef<THREE.Group>(null);
  const sweepRef = useRef<THREE.Mesh>(null);
  // Stagger first paint per monitor so five canvases never repaint on one frame.
  const last = useRef(-((seed % 13) / 13) * screen.interval);

  useEffect(() => () => screen.texture.dispose(), [screen]);

  const [w, h] = size;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!reduced && t - last.current > screen.interval) {
      screen.paint(t);
      last.current = t;
    }

    /* POWER-ON. Three things happen at once, and the order inside them is the
       whole effect:
         1. the image unrolls vertically out of a bright line — an LCD panel
            energising row by row,
         2. the backlight overshoots to ~1.5x before settling, because every
            real panel does and reproducing it is the difference between "the
            texture faded in" and "the monitor came on",
         3. a single bright band travels down the glass once, then never again.
       After that the panel just breathes. */
    const p = reduced ? 1 : ramp(t, wakeAt, WAKE.panel);
    const unroll = smootherstep(Math.min(1, p / 0.4));

    if (panelRef.current) panelRef.current.scale.y = 0.04 + 0.96 * unroll;

    if (matRef.current) {
      // Panel flicker: two desynced sines, amplitude under 4%. Anything larger
      // reads as a fault rather than as a live display.
      const settled =
        0.955 + Math.sin(t * 31 + seed) * 0.008 + Math.sin(t * 2.7 + seed * 1.7) * 0.026;
      matRef.current.opacity = reduced ? 1 : unroll * settled;
      // Backlight overshoot, decaying over the second half of the ramp.
      const over = p < 1 ? 1 + 0.55 * Math.sin(Math.PI * Math.min(1, p / 0.85)) : 1;
      matRef.current.color.setScalar(over);
    }

    if (sweepRef.current) {
      const on = p > 0.02 && p < 1;
      sweepRef.current.visible = !reduced && on;
      if (on) sweepRef.current.position.y = h * (0.5 - p);
    }

    if (lightRef.current) {
      lightRef.current.intensity = reduced
        ? glow
        : unroll * (glow + Math.sin(t * 1.4 + seed) * 0.22) * (p < 1 ? 1.5 : 1);
    }
  });

  return (
    <group position={position} rotation={rotation}>
      {/* bezel */}
      <mesh castShadow>
        <boxGeometry args={[w + 0.045, h + 0.055, 0.045]} />
        <meshStandardMaterial color="#0c0c11" roughness={0.72} metalness={0.4} />
      </mesh>
      {/* back shell, so the monitor has mass from a raking angle */}
      <mesh position={[0, 0, -0.075]}>
        <boxGeometry args={[w * 0.55, h * 0.55, 0.11]} />
        <meshStandardMaterial color="#08080b" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Everything that lights up lives in one group so the unroll scales the
          image and its bloom together. */}
      <group ref={panelRef}>
        {/* fog={false} on every emitter in the scene: fog is depth for *surfaces*,
            but a lit panel should not go grey, it should stay the brightest
            thing in frame. */}
        <mesh position={[0, 0, 0.027]}>
          <planeGeometry args={[w, h]} />
          <meshBasicMaterial
            ref={matRef}
            map={screen.texture}
            toneMapped={false}
            transparent
            opacity={reduced ? 1 : 0}
            fog={false}
          />
        </mesh>

        {/* Bloom stand-in: an additive wash on the glass. Cheaper than a
            post-processing pass and it survives the mobile downgrade. */}
        <mesh position={[0, 0, 0.031]}>
          <planeGeometry args={[w * 1.02, h * 1.02]} />
          <meshBasicMaterial
            color={tone}
            transparent
            opacity={0.05}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            fog={false}
          />
        </mesh>
      </group>

      {/* The one-shot scan band. Outside the unroll group, so it keeps its own
          height while the image is still opening. */}
      <mesh ref={sweepRef} position={[0, 0, 0.034]} visible={false}>
        <planeGeometry args={[w, h * 0.07]} />
        <meshBasicMaterial
          color={tone}
          transparent
          opacity={0.3}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
          fog={false}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={[0, 0, 0.45]}
        color={tone}
        intensity={reduced ? glow : 0}
        distance={3.2}
        decay={2}
      />

      {stand === "arm" && (
        <>
          <mesh position={[0, -h / 2 - armLen / 2, -0.09]}>
            <boxGeometry args={[0.045, armLen, 0.045]} />
            <meshStandardMaterial color="#0a0a0d" roughness={0.55} metalness={0.55} />
          </mesh>
          <mesh position={[0, -h / 2 - armLen - 0.01, -0.02]}>
            <boxGeometry args={[0.3, 0.02, 0.2]} />
            <meshStandardMaterial color="#0a0a0d" roughness={0.55} metalness={0.55} />
          </mesh>
        </>
      )}
      {stand === "foot" && (
        /* `armLen` doubles as the drop to the desk here: the reference row has
           three panels whose tops align and whose bottoms do not, which only
           works if the feet are different heights. */
        <>
          <mesh position={[0, -h / 2 - armLen / 2, -0.02]}>
            <boxGeometry args={[0.07, armLen, 0.05]} />
            <meshStandardMaterial color="#0a0a0d" roughness={0.6} metalness={0.5} />
          </mesh>
          <mesh position={[0, -h / 2 - armLen + 0.012, 0.03]}>
            <boxGeometry args={[w * 0.4, 0.024, 0.17]} />
            <meshStandardMaterial color="#0a0a0d" roughness={0.6} metalness={0.5} />
          </mesh>
        </>
      )}
    </group>
  );
}

/* ===========================================================================
   LAPTOP — shows the real Connex AI thumbnail
   ---------------------------------------------------------------------------
   The reference puts an actual project on this screen, so this one does too:
   /projects/connex-ai.png, the same asset the work page uses. Nothing here is
   a generated stand-in.
   ========================================================================= */

function Laptop({ reduced }: { reduced: boolean }) {
  const tex = useLoader(THREE.TextureLoader, "/projects/connex-ai.png");
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useEffect(() => {
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
  }, [tex]);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    // Wakes last of the screens: it is the machine you carried in, not the one
    // already running. Then a slow refresh-rate shimmer, nothing more.
    const p = ramp(t, WAKE.laptop, WAKE.panel);
    const on = smootherstep(p);
    if (matRef.current) matRef.current.opacity = on * (0.94 + Math.sin(t * 2.3) * 0.03);
    if (lightRef.current) lightRef.current.intensity = on * 1.5 * (p < 1 ? 1.4 : 1);
  });

  const SW = 1.34;
  const SH = 0.92;

  return (
    // Scaled to the reference's 253x218px box: 0.55 puts the overall width at
    // 0.77 world units. Under the hero's scrim it reads as a lit silhouette,
    // which is the job — the real thumbnail is on the work page.
    <group
      position={[-1.49, DESK_TOP + 0.014 * 0.55, 1.036]}
      rotation={[0, 0.34, 0]}
      scale={0.55}
    >
      {/* base */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[SW + 0.06, 0.028, 0.94]} />
        <meshStandardMaterial color="#0d0d12" roughness={0.42} metalness={0.62} />
      </mesh>
      {/* trackpad + key bed, faint so they do not read as texture noise */}
      <mesh position={[0, 0.016, 0.29]}>
        <boxGeometry args={[0.44, 0.002, 0.28]} />
        <meshStandardMaterial color="#131319" roughness={0.35} metalness={0.5} />
      </mesh>
      <mesh position={[0, 0.016, -0.09]}>
        <boxGeometry args={[SW - 0.14, 0.002, 0.42]} />
        <meshStandardMaterial color="#0a0a0e" roughness={0.7} metalness={0.3} />
      </mesh>

      {/* lid, hinged at the back edge */}
      <group position={[0, 0.014, -0.47]} rotation={[-0.28, 0, 0]}>
        <mesh position={[0, SH / 2, -0.012]} castShadow>
          <boxGeometry args={[SW + 0.05, SH + 0.06, 0.022]} />
          <meshStandardMaterial color="#0d0d12" roughness={0.45} metalness={0.6} />
        </mesh>
        <mesh position={[0, SH / 2, 0.002]}>
          <planeGeometry args={[SW, SH]} />
          <meshBasicMaterial
            ref={matRef}
            map={tex}
            transparent
            opacity={reduced ? 0.96 : 0}
            toneMapped={false}
            fog={false}
          />
        </mesh>
        {/* the laptop is the closest light source to the hero copy */}
        <pointLight
          ref={lightRef}
          position={[0, SH / 2, 0.5]}
          color="#8fb4e8"
          intensity={reduced ? 1.5 : 0}
          distance={2.6}
          decay={2}
        />
      </group>
    </group>
  );
}

/* ===========================================================================
   DESK LAMP
   ---------------------------------------------------------------------------
   The scene's only warm source. It is what keeps the room from reading as an
   all-blue stock render, so it gets a real bulb, a real cone and a pool of
   light on the desk.
   ========================================================================= */

/** Filament colours. A cold tungsten filament glows red before it runs white. */
const FILAMENT_COLD = new THREE.Color("#4a1703");
const FILAMENT_HOT = new THREE.Color("#ffc987");

function DeskLamp({ reduced }: { reduced: boolean }) {
  const bulbRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const bounceRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;

    /* Incandescent warm-up, which is the reason this lamp leads the sequence.
       An LED would be a step function and there would be nothing to animate.
       A filament climbs: dull red, then orange, then white, overshooting as it
       passes its working temperature before the resistance rises and pulls it
       back. `surge` is that overshoot; the colour lerp is the temperature. */
    const p = ramp(t, WAKE.lamp.at, WAKE.lamp.dur);
    const w = smootherstep(p);
    const surge = p < 1 ? 1 + 0.3 * Math.sin(Math.PI * Math.min(1, p / 0.92)) : 1;
    // Filament wobble, once lit. Slow and shallow: a lamp, not a candle.
    const f = 1 + Math.sin(t * 1.9) * 0.03 + Math.sin(t * 7.3) * 0.012;

    if (bulbRef.current) {
      bulbRef.current.opacity = Math.min(1, w * surge * 0.92 * f);
      bulbRef.current.color.lerpColors(FILAMENT_COLD, FILAMENT_HOT, smootherstep(Math.min(1, p / 0.7)));
    }
    if (lightRef.current) lightRef.current.intensity = w * surge * f * 9.2;
    if (bounceRef.current) bounceRef.current.intensity = w * f * 2.4;
  });

  return (
    /* Back-left corner of the desk, arm swung out over the work surface. The
       group is yawed so the arm reaches toward the camera-left of the keyboard;
       the shade then lands at world (-1.14, 0.31, -1.45), which is where the
       reference's pool of light is centred. */
    <group position={[-1.85, DESK_TOP, -2.15]} rotation={[0, -0.776, 0]}>
      {/* weighted base */}
      <mesh position={[0, 0.028, 0]} castShadow>
        <cylinderGeometry args={[0.19, 0.23, 0.056, 24]} />
        <meshStandardMaterial color="#0b0b0f" roughness={0.42} metalness={0.68} />
      </mesh>
      <mesh position={[0, 0.062, 0]}>
        <cylinderGeometry args={[0.075, 0.1, 0.05, 20]} />
        <meshStandardMaterial color="#0d0d13" roughness={0.38} metalness={0.72} />
      </mesh>
      {/* column */}
      <mesh position={[0, 0.58, 0]} castShadow>
        <cylinderGeometry args={[0.026, 0.03, 1.02, 12]} />
        <meshStandardMaterial color="#0c0c11" roughness={0.4} metalness={0.75} />
      </mesh>
      {/* pivot knuckle, then the arm out to the shade */}
      <mesh position={[0, 1.09, 0]}>
        <sphereGeometry args={[0.045, 16, 12]} />
        <meshStandardMaterial color="#101017" roughness={0.35} metalness={0.8} />
      </mesh>
      <mesh position={[0.5, 1.055, 0]} rotation={[0, 0, -Math.PI / 2 - 0.068]} castShadow>
        <cylinderGeometry args={[0.022, 0.022, 1.005, 12]} />
        <meshStandardMaterial color="#0c0c11" roughness={0.4} metalness={0.75} />
      </mesh>

      {/* Shade at local x 1.0, opening down. Tilted 7 degrees so the metal
          catches a rim highlight instead of reading as a flat silhouette. */}
      <group position={[1.0, 1.02, 0]} rotation={[0, 0, -0.12]}>
        <mesh castShadow>
          <coneGeometry args={[0.1675, 0.266, 26, 1, true]} />
          <meshStandardMaterial
            color="#12121a"
            roughness={0.44}
            metalness={0.62}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* the mouth: hot, and the brightest pixel in the room */}
        <mesh position={[0, -0.128, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.152, 24]} />
          <meshBasicMaterial
            ref={bulbRef}
            color="#ffc987"
            transparent
            opacity={reduced ? 0.92 : 0}
            toneMapped={false}
            fog={false}
          />
        </mesh>
      </group>

      {/* the pool. Warm, tight, decaying — it must not become ambient fill. */}
      <pointLight
        ref={lightRef}
        position={[1.0, 0.85, 0.02]}
        color="#ffb063"
        intensity={reduced ? 9.2 : 0}
        distance={3.3}
        decay={2}
        castShadow
      />
      {/* bounce off the desk, so the underside of the arm is not pitch black */}
      <pointLight
        ref={bounceRef}
        position={[1.0, 0.1, 0.16]}
        color="#c98a4a"
        intensity={reduced ? 2.4 : 0}
        distance={1.6}
        decay={2}
      />
    </group>
  );
}

/* ===========================================================================
   POSTER
   ---------------------------------------------------------------------------
   Wall art, so the words are drawn into the texture — this is a physical
   object in the room, not an interface label. Interface text stays in HTML.
   ========================================================================= */

function Poster() {
  const texture = useMemo(() => {
    // Portrait, 0.55 aspect — measured off the reference, which hangs a tall
    // narrow print rather than the near-square one this used to be.
    const { ctx, texture, w, h } = makeCanvas(260, 472);
    ctx.fillStyle = "#0b0b0e";
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = "#1c1c22";
    ctx.lineWidth = 6;
    ctx.strokeRect(3, 3, w - 6, h - 6);

    // Set in a grotesque, not the mono: a printed poster would not be
    // typewritten, and one costume per scene is plenty.
    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    const words = ["BUILD", "SOLVE", "LEARN", "REPEAT"];
    words.forEach((word, i) => {
      ctx.font = `600 50px "Segoe UI", system-ui, -apple-system, sans-serif`;
      ctx.fillStyle = i === 3 ? "#8d9099" : "#c9cbd2";
      ctx.fillText(word, 26, 98 + i * 92);
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    // Wall left of centre, above the desk's back edge and clear of the window.
    // Solved from the reference's (844..909, 113..238) box, not chosen.
    <group position={[-1.011, 0.948, -3.42]}>
      <mesh>
        <planeGeometry args={[0.464, 0.843]} />
        <meshStandardMaterial map={texture} roughness={0.95} />
      </mesh>
      {/* frame edge catches the lamp, which is what makes it read as hung */}
      <mesh position={[0, 0, -0.008]}>
        <boxGeometry args={[0.496, 0.875, 0.016]} />
        <meshStandardMaterial color="#111117" roughness={0.7} metalness={0.35} />
      </mesh>
    </group>
  );
}

/* ===========================================================================
   FLIP CLOCK — reads the real local time
   ---------------------------------------------------------------------------
   The reference shows a frozen time. A frozen clock on a site that claims to
   be live is a small lie, so this one reads the visitor's actual clock.

   And because it is a FLIP clock, the digits flip. Four independent flaps,
   each hinged at its own top edge, each with its own canvas. A flap starts
   folded back inside the housing (invisible: hinged up, normal facing down,
   back-face culled and occluded by the case) and falls forward into place.
   The fall accelerates and stops dead — that is gravity plus the clack, and
   it is the whole reason to build this out of four meshes instead of one.
   ========================================================================= */

const TILE_W = 0.115;
const TILE_H = 0.14;
/** Flap fall time. Long enough to see, short enough to still read as a snap. */
const FLIP_DUR = 0.3;
/** Symmetric about the housing centre, with a wider gap between HH and MM. */
const tileX = (i: number) => -0.2005 + i * 0.127 + (i >= 2 ? 0.02 : 0);

function FlipClock({ reduced }: { reduced: boolean }) {
  const tiles = useMemo(
    () =>
      Array.from({ length: 4 }, () => {
        const { ctx, texture, w, h } = makeCanvas(96, 128);
        const paint = (d: string) => {
          ctx.fillStyle = "#111117";
          ctx.fillRect(0, 0, w, h);
          // Top half sits a shade lighter — flaps catch light on their upper face.
          ctx.fillStyle = "#16161d";
          ctx.fillRect(0, 0, w, h / 2);
          // The split line, which is the one detail that says "flip".
          ctx.fillStyle = "#050507";
          ctx.fillRect(0, h / 2 - 2, w, 4);
          ctx.font = MONO(86, 500);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillStyle = "#d8dae0";
          ctx.fillText(d, w / 2, h / 2 + 3);
          texture.needsUpdate = true;
        };
        return { texture, paint };
      }),
    [],
  );

  const pivots = useRef<(THREE.Group | null)[]>([null, null, null, null]);
  const shown = useRef(["", "", "", ""]);
  /** When each flap started falling. -1 means "already resting". */
  const fell = useRef([-1, -1, -1, -1]);
  const lightRef = useRef<THREE.PointLight>(null);

  useEffect(() => () => tiles.forEach((t) => t.texture.dispose()), [tiles]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const now = new Date();
    const digits = [
      ...String(now.getHours()).padStart(2, "0"),
      ...String(now.getMinutes()).padStart(2, "0"),
    ];

    for (let i = 0; i < 4; i++) {
      if (digits[i] !== shown.current[i]) {
        shown.current[i] = digits[i];
        /* Repainted at the START of the fall, while the flap is folded back and
           unseen, so the digit is never caught mid-swap. */
        tiles[i].paint(digits[i]);
        // On first mount the flaps wait for their cue instead of falling at t=0.
        fell.current[i] = Math.max(t, WAKE.clock + i * 0.07);
      }
      const g = pivots.current[i];
      if (!g) continue;
      if (reduced) {
        g.rotation.x = 0;
        continue;
      }
      const p = Math.min(1, Math.max(0, (t - fell.current[i]) / FLIP_DUR));
      // 1 - p^2: slow release, fastest at the end, hard stop.
      g.rotation.x = (Math.PI / 2) * (1 - p * p);
    }

    if (lightRef.current) {
      lightRef.current.intensity = reduced ? 0.3 : smootherstep(ramp(t, WAKE.clock, 0.5)) * 0.45;
    }
  });

  return (
    <group position={[0.153, DESK_TOP, -0.061]} rotation={[-0.1, -0.05, 0]}>
      {/* case */}
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.574, 0.2, 0.16]} />
        <meshStandardMaterial color="#0a0a0e" roughness={0.6} metalness={0.4} />
      </mesh>
      {/* recessed well, so a folded-back flap reveals black and not the case */}
      <mesh position={[0, 0.1, 0.0795]}>
        <planeGeometry args={[0.53, 0.15]} />
        <meshStandardMaterial color="#040406" roughness={0.9} />
      </mesh>

      {tiles.map((tile, i) => (
        // Pivot sits on the flap's top edge; the flap hangs below it.
        <group
          key={i}
          ref={(el) => {
            pivots.current[i] = el;
          }}
          position={[tileX(i), 0.17, 0.081]}
        >
          <mesh position={[0, -TILE_H / 2, 0]}>
            <planeGeometry args={[TILE_W, TILE_H]} />
            <meshBasicMaterial map={tile.texture} toneMapped={false} fog={false} />
          </mesh>
        </group>
      ))}

      <pointLight
        ref={lightRef}
        position={[0, 0.05, 0.3]}
        color="#8f93a0"
        intensity={reduced ? 0.3 : 0}
        distance={0.9}
        decay={2}
      />
    </group>
  );
}

/* ===========================================================================
   THE MACHINE — a small-form-factor case, sitting on the desk
   ---------------------------------------------------------------------------
   The reference's box is 175x97px: WIDER than it is tall, so this is not a
   floor tower. It is a cube-ish SFF case on the desk with its three fans in a
   horizontal row, which is also why the fans read at all — stacked vertically
   at this size they fell outside the case.

   The only violet in the room, and the only thing that spins because it has a
   physical reason to.
   ========================================================================= */

function Tower({ reduced }: { reduced: boolean }) {
  const fans = useRef<(THREE.Group | null)[]>([]);
  const stripRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  useFrame(({ clock }, delta) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    /* Spin-up with inertia. smootherstep on the RATE, not the angle: the blades
       start from rest, take the full 1.6s to reach speed, and never snap. A
       fan that arrives already at speed is the single clearest tell that a 3D
       scene was assembled rather than authored. */
    const s = smootherstep(ramp(t, WAKE.fans.at, WAKE.fans.dur));
    fans.current.forEach((g, i) => {
      if (g) g.rotation.z += delta * s * (7.4 + i * 1.3);
    });
    if (stripRef.current) {
      stripRef.current.opacity = s * (0.5 + Math.sin(t * 0.9) * 0.22);
    }
    if (lightRef.current) lightRef.current.intensity = s * 2.6;
  });

  return (
    <group position={[0.812, DESK_TOP + 0.17, 0.539]} rotation={[0, -0.22, 0]}>
      {/* chassis */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.6, 0.34, 0.34]} />
        <meshStandardMaterial color="#0a0a0e" roughness={0.55} metalness={0.6} />
      </mesh>
      {/* smoked glass front, so the fans are behind something */}
      <mesh position={[0, 0, 0.171]}>
        <planeGeometry args={[0.57, 0.31]} />
        <meshBasicMaterial
          color="#0d0b16"
          transparent
          opacity={0.72}
          toneMapped={false}
          fog={false}
        />
      </mesh>

      {/* three fans in a row, lower half of the face */}
      {[-0.18, 0, 0.18].map((x, i) => (
        <group key={x} position={[x, -0.045, 0.173]}>
          <mesh>
            <ringGeometry args={[0.062, 0.078, 28]} />
            <meshBasicMaterial
              color="#a78bfa"
              transparent
              opacity={0.75}
              toneMapped={false}
              fog={false}
            />
          </mesh>
          <group
            ref={(el) => {
              fans.current[i] = el;
            }}
          >
            {[0, 1, 2, 3, 4].map((b) => (
              <mesh key={b} rotation={[0, 0, (b / 5) * Math.PI * 2]}>
                <planeGeometry args={[0.058, 0.018]} />
                <meshBasicMaterial
                  color="#5b4b8a"
                  transparent
                  opacity={0.5}
                  side={THREE.DoubleSide}
                  toneMapped={false}
                  fog={false}
                />
              </mesh>
            ))}
          </group>
        </group>
      ))}

      {/* GPU light bar across the top of the face */}
      <mesh position={[0, 0.1, 0.173]}>
        <planeGeometry args={[0.44, 0.024]} />
        <meshBasicMaterial
          ref={stripRef}
          color="#c4b5fd"
          transparent
          opacity={reduced ? 0.6 : 0}
          toneMapped={false}
          fog={false}
        />
      </mesh>

      <pointLight
        ref={lightRef}
        position={[0, 0, 0.42]}
        color="#9b7cf0"
        intensity={reduced ? 2.6 : 0}
        distance={2.2}
        decay={2}
      />
    </group>
  );
}

/* ===========================================================================
   DESK FAN
   ---------------------------------------------------------------------------
   A small metal fan at the right edge of the desk. It exists for two reasons:
   the reference has one, and it is the second thing in frame that turns —
   which is what stops the case fans from reading as the scene's only idea
   about motion. It spins up on the same cue and at its own rate.
   ========================================================================= */

function DeskFan({ reduced }: { reduced: boolean }) {
  const bladesRef = useRef<THREE.Group>(null);
  /** Own rate so the two fans never phase-lock into looking like one object. */
  const HEAD_Y = 0.185;

  useFrame(({ clock }, delta) => {
    if (reduced || !bladesRef.current) return;
    const s = smootherstep(ramp(clock.elapsedTime, WAKE.fans.at + 0.18, WAKE.fans.dur));
    bladesRef.current.rotation.z -= delta * s * 11.2;
  });

  return (
    // 0.217 wide, 0.257 tall, yawed slightly so it blows across the desk
    // rather than out of frame.
    <group position={[1.169, DESK_TOP, 0.616]} rotation={[0, -0.62, 0]}>
      {/* weighted foot + stem */}
      <mesh position={[0, 0.012, 0]} castShadow>
        <cylinderGeometry args={[0.062, 0.072, 0.024, 18]} />
        <meshStandardMaterial color="#15151c" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0, 0.075, 0]}>
        <cylinderGeometry args={[0.014, 0.016, 0.13, 10]} />
        <meshStandardMaterial color="#15151c" roughness={0.4} metalness={0.75} />
      </mesh>

      <group position={[0, HEAD_Y, 0]} rotation={[0.16, 0, 0]}>
        {/* motor housing behind the blades */}
        <mesh position={[0, 0, -0.032]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.032, 0.038, 0.05, 14]} />
          <meshStandardMaterial color="#12121a" roughness={0.42} metalness={0.72} />
        </mesh>
        {/* blades */}
        <group ref={bladesRef}>
          {[0, 1, 2, 3].map((b) => (
            <mesh key={b} rotation={[0, 0.34, (b / 4) * Math.PI * 2]}>
              <planeGeometry args={[0.076, 0.05]} />
              <meshStandardMaterial
                color="#20202a"
                roughness={0.35}
                metalness={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          ))}
        </group>
        {/* Front cage: two rings rather than a woven grille. At 65px wide a
            real grille is aliasing noise; two rings read as a cage. */}
        {[0.055, 0.088].map((r) => (
          <mesh key={r} position={[0, 0, 0.028]}>
            <ringGeometry args={[r, r + 0.005, 24]} />
            <meshStandardMaterial
              color="#3a3a46"
              roughness={0.3}
              metalness={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}
        {/* hub cap, which is the bit that catches the lamp */}
        <mesh position={[0, 0, 0.03]}>
          <circleGeometry args={[0.018, 14]} />
          <meshStandardMaterial color="#4a4a58" roughness={0.22} metalness={0.9} />
        </mesh>
      </group>
    </group>
  );
}

/* ===========================================================================
   DESK SURFACE + PROPS
   ========================================================================= */

function Keyboard({ reduced }: { reduced: boolean }) {
  const glowRef = useRef<THREE.PointLight>(null);
  const sweepRef = useRef<THREE.Group>(null);
  const stripRef = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;

    /* The backlight SWEEPS on, left to right, the way per-key RGB initialises.
       Built as one strip that wipes rather than 75 animated cap materials: at
       260px wide on screen the per-key version is invisible and costs 75
       material updates a frame, so it would be detail nobody can see. */
    const p = ramp(t, WAKE.keyboard.at, WAKE.keyboard.dur);
    if (sweepRef.current) sweepRef.current.scale.x = p;
    if (stripRef.current) {
      stripRef.current.opacity = p > 0 ? 0.55 + Math.sin(t * 0.8) * 0.14 : 0;
    }
    if (glowRef.current) {
      // The glow rides the leading edge of the wipe, then settles to centre.
      const settle = smootherstep(ramp(t, WAKE.keyboard.at + WAKE.keyboard.dur, 0.45));
      glowRef.current.position.x = (-0.72 + 1.44 * p) * (1 - settle);
      glowRef.current.intensity = smootherstep(p) * (1.1 + Math.sin(t * 0.8) * 0.2);
    }
  });

  // 5 rows x 15 columns of keycaps. Instancing would be overkill at 75 boxes,
  // and the individual caps are what read as a keyboard from this distance.
  const caps = useMemo(() => {
    const out: [number, number, number][] = [];
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 15; c++) {
        out.push([-0.63 + c * 0.09, 0.029, -0.15 + r * 0.075]);
      }
    }
    return out;
  }, []);

  return (
    // Scaled 0.62 to the reference's 260px width, sitting square in front of
    // the seat. Local origin is the desk surface, so the slab rides on 0.015.
    <group position={[-0.593, DESK_TOP, 0.609]} rotation={[0, -0.04, 0]} scale={0.62}>
      <mesh position={[0, 0.015, 0]} receiveShadow castShadow>
        <boxGeometry args={[1.44, 0.03, 0.46]} />
        <meshStandardMaterial color="#0b0b10" roughness={0.5} metalness={0.35} />
      </mesh>
      {caps.map((p, i) => (
        <mesh key={i} position={p}>
          <boxGeometry args={[0.072, 0.008, 0.058]} />
          <meshStandardMaterial color="#131319" roughness={0.85} metalness={0.1} />
        </mesh>
      ))}

      {/* The wipe. Anchored at the left edge by offsetting the mesh inside a
          group whose scale.x is what animates. */}
      <group ref={sweepRef} position={[-0.72, 0.015, 0.2315]} scale-x={reduced ? 1 : 0}>
        <mesh position={[0.72, 0, 0]}>
          <planeGeometry args={[1.44, 0.016]} />
          <meshBasicMaterial
            ref={stripRef}
            color="#b9a0ff"
            transparent
            opacity={reduced ? 0.55 : 0}
            toneMapped={false}
            fog={false}
          />
        </mesh>
      </group>

      {/* underglow. Violet, matching the machine — the lime lives on the
          instrument panels, and two accents is already the limit. */}
      <pointLight
        ref={glowRef}
        position={[0, -0.03, 0]}
        color="#9b7cf0"
        intensity={reduced ? 1.1 : 0}
        distance={1.3}
        decay={2}
      />
    </group>
  );
}

function Mug() {
  const texture = useMemo(() => {
    const { ctx, texture, w, h } = makeCanvas(256, 128);
    ctx.fillStyle = "#12121a";
    ctx.fillRect(0, 0, w, h);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#9aa0ac";
    ctx.font = MONO(30, 600);
    ctx.fillText("GOOD", w / 2, h / 2 - 19);
    ctx.fillText("IDEAS", w / 2, h / 2 + 19);
    /* CylinderGeometry puts u=0 on the +z face and u=0.5 on -z, so a centred
       canvas lands on the side facing AWAY from us. Half a turn of offset
       brings the lettering round to the camera. */
    texture.wrapS = THREE.RepeatWrapping;
    texture.offset.x = 0.5;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={[-0.906, DESK_TOP, -0.078]} scale={1.45}>
      <mesh position={[0, 0.095, 0]} castShadow>
        <cylinderGeometry args={[0.085, 0.075, 0.19, 26]} />
        <meshStandardMaterial map={texture} roughness={0.65} metalness={0.15} />
      </mesh>
      {/* coffee surface, catching the lamp */}
      <mesh position={[0, 0.18, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.072, 20]} />
        <meshStandardMaterial color="#1c1208" roughness={0.25} metalness={0.1} />
      </mesh>
      {/* Handle to +x, i.e. away from the seat — which is where a right-handed
          person leaves it after setting the mug down. */}
      <mesh position={[0.1, 0.095, 0]} rotation={[0, Math.PI / 2, 0]}>
        <torusGeometry args={[0.048, 0.011, 8, 18, Math.PI]} />
        <meshStandardMaterial color="#12121a" roughness={0.65} />
      </mesh>
    </group>
  );
}

function Mouse() {
  return (
    // Squashed sphere. A round one reads as a ball; a mouse is wide, low and long.
    <mesh
      position={[-0.117, DESK_TOP + 0.075 * 0.55 * 1.25, 0.876]}
      rotation={[0, -0.2, 0]}
      scale={[1.25, 0.55 * 1.25, 1.5 * 1.25]}
      castShadow
    >
      <sphereGeometry args={[0.075, 16, 12]} />
      <meshStandardMaterial color="#0d0d13" roughness={0.45} metalness={0.35} />
    </mesh>
  );
}

function Headphones() {
  return (
    // Parked to the right of the keyboard, lying on one cup. Scaled 1.42 to the
    // reference's 152px band.
    <group position={[0.282, DESK_TOP + 0.092 * 1.42, 1.023]} rotation={[0.32, -0.5, 0.1]} scale={1.42}>
      <mesh>
        <torusGeometry args={[0.14, 0.018, 8, 24, Math.PI]} />
        <meshStandardMaterial color="#0e0e14" roughness={0.6} metalness={0.3} />
      </mesh>
      {[-0.14, 0.14].map((x) => (
        <mesh key={x} position={[x, -0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.058, 0.058, 0.05, 18]} />
          <meshStandardMaterial color="#101017" roughness={0.75} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Desk plant, back-left corner, directly in front of the window. It is the one
 * organic silhouette in a room of rectangles, and because the window is behind
 * it, it reads as a backlit shape rather than as another object to parse.
 *
 * It used to stand on the floor. At the corrected camera the floor is barely in
 * frame and entirely behind the HTML content column, so a floor plant was a
 * prop nobody could see.
 */
function Plant() {
  const rand = useMemo(() => rng(808), []);
  const leaves = useMemo(
    () =>
      Array.from({ length: 13 }, () => ({
        rot: [rand() * 0.7 - 0.35, rand() * 6.28, rand() * 0.8 - 0.4] as [number, number, number],
        h: 0.5 + rand() * 0.55,
      })),
    [rand],
  );

  return (
    <group position={[-1.307, DESK_TOP, -1.937]} scale={0.535}>
      {/* pot */}
      <mesh position={[0, 0.21, 0]} castShadow>
        <cylinderGeometry args={[0.2, 0.145, 0.42, 18]} />
        <meshStandardMaterial color="#0d0d11" roughness={0.9} />
      </mesh>
      {/* soil, so the pot is not an open tube from above */}
      <mesh position={[0, 0.418, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.192, 18]} />
        <meshStandardMaterial color="#08080a" roughness={1} />
      </mesh>
      {leaves.map((l, i) => (
        <mesh key={i} position={[0, 0.4 + l.h / 2, 0]} rotation={l.rot}>
          <coneGeometry args={[0.06, l.h, 5]} />
          <meshStandardMaterial color="#16241a" roughness={0.95} />
        </mesh>
      ))}
    </group>
  );
}

function Notebook() {
  const texture = useMemo(() => {
    const { ctx, texture, w, h } = makeCanvas(256, 176);
    const rand = rng(515);
    ctx.fillStyle = "#c9c4b8";
    ctx.fillRect(0, 0, w, h);
    // Ruled lines plus a wireframe sketch: a page someone has worked on.
    ctx.strokeStyle = "rgba(80,80,90,0.22)";
    ctx.lineWidth = 1;
    for (let y = 14; y < h; y += 13) {
      ctx.beginPath();
      ctx.moveTo(10, y);
      ctx.lineTo(w - 10, y);
      ctx.stroke();
    }
    ctx.strokeStyle = "rgba(40,40,50,0.55)";
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 5; i++) {
      const x = 22 + rand() * 90;
      const y = 24 + rand() * 100;
      ctx.strokeRect(x, y, 30 + rand() * 50, 16 + rand() * 34);
    }
    for (let i = 0; i < 22; i++) {
      const y = 22 + rand() * 130;
      ctx.beginPath();
      ctx.moveTo(150 + rand() * 10, y);
      ctx.lineTo(150 + 20 + rand() * 70, y);
      ctx.stroke();
    }
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
  }, []);

  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <group position={[0.717, DESK_TOP + 0.011 * 0.91, 1.138]} rotation={[0, -0.42, 0]} scale={0.91}>
      <mesh castShadow>
        <boxGeometry args={[0.62, 0.022, 0.44]} />
        <meshStandardMaterial color="#15151b" roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.013, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.58, 0.4]} />
        <meshStandardMaterial map={texture} roughness={1} />
      </mesh>
    </group>
  );
}

/**
 * Height of the desk surface. Every prop is seated against this, not eyeballed,
 * because at the reference framing the contact points are all visible and a
 * mug hovering 15mm off the top is the tell that gives a render away.
 */
const DESK_TOP = -0.712;

/**
 * Desk geometry, solved rather than chosen.
 *
 * The desk has to do three jobs at once: fill the whole bottom of the frame so
 * the floor never shows behind it, reach back far enough that its own back edge
 * crops the window's lower sixth (which is why the reference window appears to
 * stop mid-wall), and carry every prop's contact point. Projecting those
 * constraints back through the camera fixes it at x -3.70..3.90, z -2.60..3.20.
 */
const DESK = { x0: -3.7, x1: 3.9, z0: -2.6, z1: 3.2 } as const;
const DESK_W = DESK.x1 - DESK.x0;
const DESK_D = DESK.z1 - DESK.z0;
const DESK_CX = (DESK.x0 + DESK.x1) / 2;
const DESK_CZ = (DESK.z0 + DESK.z1) / 2;

function Room() {
  const grain = useMemo(() => createDeskTop(), []);
  useEffect(() => () => grain.dispose(), [grain]);

  return (
    <group>
      {/* back wall */}
      <mesh position={[0.8, 1.1, -3.55]} receiveShadow>
        <planeGeometry args={[24, 11]} />
        <meshStandardMaterial color="#08080b" roughness={1} />
      </mesh>
      {/* Floor. Only a wedge of it is visible, to the left of the desk, and even
          that sits under the HTML content column — but the plant and the lamp
          both need something to cast onto. */}
      <mesh position={[0.8, -1.72, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[24, 14]} />
        <meshStandardMaterial color="#050506" roughness={0.72} metalness={0.28} />
      </mesh>

      {/* The slab. Dark, matte, and NOT metal — the previous metalness 0.4 is
          what made this read as a black acrylic dashboard surface. */}
      <mesh position={[DESK_CX, DESK_TOP - 0.033, DESK_CZ]} receiveShadow castShadow>
        <boxGeometry args={[DESK_W, 0.065, DESK_D]} />
        <meshStandardMaterial color="#120e0a" roughness={0.72} metalness={0.06} />
      </mesh>
      {/* Grain, on its own plane a millimetre above the slab so the UVs are
          predictable. The box's own UVs would stretch the figure across six
          faces; this maps one canvas to one surface, back edge at row 0. */}
      <mesh
        position={[DESK_CX, DESK_TOP + 0.0015, DESK_CZ]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[DESK_W, DESK_D]} />
        <meshStandardMaterial map={grain} roughness={0.62} metalness={0.12} />
      </mesh>
      {/* front edge highlight: one hairline of specular is what sells a
          finished surface at this light level */}
      <mesh position={[DESK_CX, DESK_TOP, DESK.z1]}>
        <boxGeometry args={[DESK_W, 0.004, 0.03]} />
        <meshStandardMaterial color="#2c2c34" roughness={0.15} metalness={0.9} emissive="#101014" />
      </mesh>
      {/* legs, inset from each end. Both are below the frame; they exist so the
          slab is not floating if the camera ever drifts lower. */}
      {[DESK.x0 + 0.4, DESK.x1 - 0.4].map((x) => (
        <mesh key={x} position={[x, -1.249, DESK_CZ]}>
          <boxGeometry args={[0.07, 0.943, DESK_D - 0.4]} />
          <meshStandardMaterial color="#08080b" roughness={0.6} metalness={0.45} />
        </mesh>
      ))}

      {/* Riser under the wide monitor's arm. Its plate lands at z -2.45, right
          at the back of the desk, and the whole thing is hidden behind the lower
          panel row — but the arm has to stand on something real. */}
      <mesh position={[0.65, DESK_TOP + 0.045, -2.45]}>
        <boxGeometry args={[3.6, 0.09, 0.3]} />
        <meshStandardMaterial color="#0a0a0e" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  );
}

/* ===========================================================================
   CAMERA RIG
   ---------------------------------------------------------------------------
   Framing is solved, not eyeballed, and the solve is the reason this rebuild
   looks like the reference at all.

   The recoverable quantity from a photograph of a horizontal plane is its
   HORIZON — where the plane's parallel edges converge. The reference's keyboard
   gives it away: its two side edges run (817,595)->(837,527) and
   (1077,595)->(1055,527), a 260px gap closing 42px per 68px of height, so they
   meet 421px above y=595. Horizon y = 174.
   Horizon fixes camera pitch alone: y = 512 - (512/tan(fov/2)) * tan(pitch).
   Everything else — height, distance, fov — then follows from two prop widths.
   Result: fov 58 (not 44), camera at [-0.72, 0.42, 3.60] looking at
   [-0.95, -0.885, -1.05]. Pitch 15.66 degrees. One world unit is about 48cm.
   The old rig sat at z 6.35 with fov 44, putting its horizon at y 419 — which
   is why every prop had to be scaled wrong to land in the right place.

   Four layers, in order of how much they matter:

     1. THE ESTABLISHING PUSH-IN. The shot opens close, wide-angle and level —
        you are looking INTO the room, wall and window included — then pulls
        back and tilts down into the reference framing over 2.8 seconds while
        the lens narrows from 63 to 58 degrees.

        Pulling back while zooming in is a dolly-zoom: the desk stays roughly
        the same size on screen while the perspective behind it compresses, so
        the room appears to fold in around the work. It is the one move that
        cannot be faked with a CSS transform, which is exactly why it is worth
        spending a camera on. Driven by smootherstep, not a bezier, so the
        camera starts from rest — a camera that begins at full speed reads as
        a cut, not a move.

        The move is deliberately still settling as the panel row lands, which is
        what ties the 3D entrance to the HTML entrance instead of running two
        unrelated animations at once.

     2. POINTER PARALLAX. Blended in by the entrance's own progress, so the
        pointer cannot fight the establishing move while it is running.

     3. A SLOW FIGURE-EIGHT DRIFT. This matters more than the parallax — it
        means the shot is never dead still even when the pointer has left the
        window, which is the difference between a render and a room.

     4. NOTHING ELSE. No orbit, no auto-rotate, no bob. The room is a place the
        viewer is sitting in, not an object on a turntable.
   ========================================================================= */

const HOME: [number, number, number] = [-0.72, 0.42, 3.6];
const LOOK: [number, number, number] = [-0.95, -0.885, -1.05];
/** Final lens. Recovered from the reference's horizon, not picked. */
const FOV_HOME = 58;

/** Where the shot opens: closer, higher, wider, and looking much more level. */
const OPEN: [number, number, number] = [-1.05, 1.16, 2.35];
/** The opening look-at is lifted, so the move tilts down as it pulls back. */
const OPEN_LOOK: [number, number, number] = [-1.02, -0.16, -1.05];
/** Opening lens. Wider, so the walls bow outward before the shot settles. */
const FOV_OPEN = 74;

function Rig({ reduced }: { reduced: boolean }) {
  const target = useRef({ x: HOME[0], y: HOME[1] });
  const look = useRef(new THREE.Vector3(...OPEN_LOOK));
  /* Own clock. clock.elapsedTime is shared with every animated material in the
     scene, and those must not restart when the rig does. */
  const t0 = useRef(-1);

  useFrame(({ camera, pointer, clock }, delta) => {
    const cam = camera as THREE.PerspectiveCamera;

    if (reduced) {
      cam.position.set(...HOME);
      cam.lookAt(...LOOK);
      if (cam.fov !== FOV_HOME) {
        cam.fov = FOV_HOME;
        cam.updateProjectionMatrix();
      }
      return;
    }

    if (t0.current < 0) t0.current = clock.elapsedTime;
    const since = clock.elapsedTime - t0.current;

    // 0 while the wide shot holds, 1 once the camera has arrived.
    const p = smootherstep((since - BEAT.camera.hold) / BEAT.camera.travel);
    const entering = p < 1;

    const t = clock.elapsedTime;
    // Figure eight: x and y on a 2:1 ratio, so the path never repeats visibly.
    const driftX = Math.sin(t * 0.13) * 0.085;
    const driftY = Math.sin(t * 0.26) * 0.04;

    // Parallax fades in with the entrance rather than competing with it.
    const px = pointer.x * 0.4 * p;
    const py = pointer.y * 0.17 * p;

    const homeX = OPEN[0] + (HOME[0] - OPEN[0]) * p;
    const homeY = OPEN[1] + (HOME[1] - OPEN[1]) * p;
    const homeZ = OPEN[2] + (HOME[2] - OPEN[2]) * p;

    target.current.x = homeX + px + driftX * p;
    target.current.y = homeY + py + driftY * p;

    /* During the entrance the camera is placed, not damped: the smootherstep
       IS the easing, and running it through a second exponential filter would
       flatten the tail that makes the move read as weighted. Damping resumes
       once the shot has arrived, where it is doing a different job — trailing
       the pointer with mass. */
    if (entering) {
      cam.position.set(target.current.x, target.current.y, homeZ);
      /* The zoom half of the dolly-zoom. Only touched while the move is
         running: updateProjectionMatrix every frame forever would be a
         pointless per-frame matrix rebuild once the lens has settled. */
      cam.fov = FOV_OPEN + (FOV_HOME - FOV_OPEN) * p;
      cam.updateProjectionMatrix();
    } else {
      const k = 1 - Math.pow(0.0015, delta);
      cam.position.x += (target.current.x - cam.position.x) * k;
      cam.position.y += (target.current.y - cam.position.y) * k;
      // Pull in very slightly as the pointer rises, which reads as leaning in.
      cam.position.z += (HOME[2] - pointer.y * 0.12 - cam.position.z) * k;
      if (cam.fov !== FOV_HOME) {
        cam.fov = FOV_HOME;
        cam.updateProjectionMatrix();
      }
    }

    // The tilt-down. Lerped on the same progress so it lands with the position.
    look.current.set(
      OPEN_LOOK[0] + (LOOK[0] - OPEN_LOOK[0]) * p,
      OPEN_LOOK[1] + (LOOK[1] - OPEN_LOOK[1]) * p,
      OPEN_LOOK[2] + (LOOK[2] - OPEN_LOOK[2]) * p,
    );
    cam.lookAt(look.current);
  });

  return null;
}

/* ===========================================================================
   SCENE
   ========================================================================= */

export function WorkspaceContents({ reduced }: { reduced: boolean }) {
  return (
    <>
      {/* Fog starts just past the flip clock, so the desk and laptop stay crisp
          and the wall falls away. Tinted, not grey: grey fog on a dark scene
          reads as a washed-out render. Every emitter opts out via fog={false},
          which is what keeps the screens the brightest thing in frame at this
          distance instead of the haziest. Re-tuned for the solved camera, which
          sits 2.75 units nearer the desk than the old one. */}
      <fog attach="fog" args={["#05060a", 4.2, 13]} />

      {/* Everything else in the room emits. Ambient exists only so the far
          corners are not pure black. */}
      <ambientLight intensity={0.075} />
      <hemisphereLight args={["#1b2438", "#050506", 0.14]} />

      <Room />
      <CityWindow reduced={reduced} />
      <Poster />
      <DeskLamp reduced={reduced} />

      {/* --- ONE wide monitor, on an arm rising off the riser ------------------
          Solved from its four measured bezel corners: TL(972,132) TR(1304,99)
          BL(980,309) BR(1304,293). The 6-DOF fit leaves yaw almost free (rms
          moves 9.4->10.9 across 0..-27 degrees), so the yaw here is the physical
          one instead of the rms-minimising one: -25 degrees is what points the
          panel at the chair. Screen 1.94 x 1.01 inside a 1.99 x 1.07 bezel —
          a large 16:10, not an ultrawide. */}
      <Monitor
        position={[0.576, 0.674, -2.45]}
        rotation={[0.03, -0.44, 0]}
        size={[1.94, 1.012]}
        kind="editor"
        seed={8}
        tone={S.violet}
        reduced={reduced}
        stand="arm"
        armLen={0.79}
        wakeAt={WAKE.screens[0]}
        glow={1.5}
      />

      {/* --- lower row: three panels standing on the desk ----------------------
          All three share z=-1.20. Their tops align in the reference (312/315/311)
          but their bottoms do not (450/477/475) — so this is three different
          panels on three different feet, not one row scaled three ways. */}
      <Monitor
        position={[-0.553, -0.217, -1.2]}
        rotation={[0.03, -0.1, 0]}
        size={[0.933, 0.659]}
        kind="graph"
        seed={31}
        tone={S.lime}
        reduced={reduced}
        stand="foot"
        armLen={0.166}
        wakeAt={WAKE.screens[1]}
      />
      <Monitor
        position={[0.472, -0.288, -1.2]}
        rotation={[0.03, -0.2, 0]}
        size={[1.052, 0.778]}
        kind="logs"
        seed={44}
        tone={S.lime}
        reduced={reduced}
        stand="foot"
        armLen={0.035}
        wakeAt={WAKE.screens[2]}
      />
      <Monitor
        position={[1.659, -0.264, -1.2]}
        rotation={[0.03, -0.3, 0]}
        size={[1.347, 0.777]}
        kind="map"
        seed={57}
        tone={S.azure}
        reduced={reduced}
        stand="foot"
        armLen={0.06}
        wakeAt={WAKE.screens[3]}
      />

      <Laptop reduced={reduced} />
      <Keyboard reduced={reduced} />
      <Mouse />
      <Mug />
      <FlipClock reduced={reduced} />
      <Headphones />
      <Notebook />
      <Plant />
      <Tower reduced={reduced} />
      <DeskFan reduced={reduced} />

      <Rig reduced={reduced} />
    </>
  );
}
