"use client";

import { seeded, useCanvasLoop, type LoopCtx } from "./useCanvasLoop";

/**
 * SIX EXPERIMENTS
 * ---------------------------------------------------------------------------
 * Each is a real simulation running in the browser right now — not a recording
 * and not a claim about something built previously. They exist on this page
 * and nowhere else.
 *
 * All six share one contract: `running` gates the animation frame entirely, so
 * only the open experiment consumes any CPU. All drawing uses the palette
 * tokens so the playground reads as part of the same system.
 */

const VIOLET = "#a855f7";
const CYAN = "#22d3ee";
const LIME = "#a3e635";
const AMBER = "#fbbf24";
const ROSE = "#fb7185";
const GHOST = "#2e2e36";

export interface ExperimentProps {
  running: boolean;
  resetKey: number;
}

const surface = "size-full touch-none";

/* ------------------------------------------------------------------ 01 --- */
/**
 * FLOW FIELD — particles advected through a curl-like noise field.
 * The pointer adds a local vortex, so you steer the flow rather than watch it.
 */
export function FlowField({ running, resetKey }: ExperimentProps) {
  type P = { x: number; y: number; px: number; py: number; life: number; hue: number };
  type S = { ps: P[]; t: number; w: number; h: number; rnd: () => number };

  const ref = useCanvasLoop<S>(
    running,
    {
      init: (w, h) => {
        const rnd = seeded(20260811);
        const count = Math.round(Math.min(1100, (w * h) / 620));
        const ps: P[] = Array.from({ length: count }, () => {
          const x = rnd() * w;
          const y = rnd() * h;
          return { x, y, px: x, py: y, life: rnd() * 220, hue: rnd() };
        });
        return { ps, t: 0, w, h, rnd };
      },
      frame: (s, { ctx, w, h, dt, pointer }) => {
        s.t += dt * 0.28;

        // Trail decay instead of a hard clear — motion leaves a readable path.
        ctx.fillStyle = "rgba(0,0,0,0.11)";
        ctx.fillRect(0, 0, w, h);
        ctx.lineWidth = 1;

        for (const p of s.ps) {
          // Cheap divergence-free-ish field from layered trig.
          const a =
            Math.sin(p.x * 0.0055 + s.t) * 1.6 +
            Math.cos(p.y * 0.0061 - s.t * 0.8) * 1.6 +
            Math.sin((p.x + p.y) * 0.0027 + s.t * 0.5);

          let vx = Math.cos(a) * 46;
          let vy = Math.sin(a) * 46;

          if (pointer) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 20000 && d2 > 1) {
              const d = Math.sqrt(d2);
              const f = (1 - d / 141) * 130;
              // Perpendicular component = swirl, not push.
              vx += (-dy / d) * f;
              vy += (dx / d) * f;
            }
          }

          p.px = p.x;
          p.py = p.y;
          p.x += vx * dt;
          p.y += vy * dt;
          p.life -= dt * 60;

          if (p.life <= 0 || p.x < 0 || p.x > w || p.y < 0 || p.y > h) {
            p.x = s.rnd() * w;
            p.y = s.rnd() * h;
            p.px = p.x;
            p.py = p.y;
            p.life = 120 + s.rnd() * 160;
            continue;
          }

          ctx.strokeStyle = p.hue < 0.5 ? VIOLET : CYAN;
          ctx.globalAlpha = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.px, p.py);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      },
    },
    resetKey,
  );

  return <canvas ref={ref} className={surface} />;
}

/* ------------------------------------------------------------------ 02 --- */
/**
 * BOIDS — separation, alignment, cohesion. The pointer acts as a predator the
 * flock actively evades, which makes the three rules legible in real time.
 */
export function Boids({ running, resetKey }: ExperimentProps) {
  type B = { x: number; y: number; vx: number; vy: number };
  type S = { bs: B[]; w: number; h: number };

  const ref = useCanvasLoop<S>(
    running,
    {
      init: (w, h) => {
        const rnd = seeded(77213);
        const n = Math.round(Math.min(190, (w * h) / 3200));
        const bs: B[] = Array.from({ length: n }, () => {
          const a = rnd() * Math.PI * 2;
          return {
            x: rnd() * w,
            y: rnd() * h,
            vx: Math.cos(a) * 60,
            vy: Math.sin(a) * 60,
          };
        });
        return { bs, w, h };
      },
      frame: (s, { ctx, w, h, dt, pointer }) => {
        ctx.clearRect(0, 0, w, h);

        const R = 62;
        const R2 = R * R;
        const SEP2 = 20 * 20;

        for (const b of s.bs) {
          let cx = 0, cy = 0, ax = 0, ay = 0, sx = 0, sy = 0, n = 0;

          for (const o of s.bs) {
            if (o === b) continue;
            const dx = o.x - b.x;
            const dy = o.y - b.y;
            const d2 = dx * dx + dy * dy;
            if (d2 > R2) continue;
            n++;
            cx += o.x;
            cy += o.y;
            ax += o.vx;
            ay += o.vy;
            if (d2 < SEP2 && d2 > 0.01) {
              sx -= dx / d2;
              sy -= dy / d2;
            }
          }

          if (n > 0) {
            // cohesion toward the local centre of mass
            b.vx += ((cx / n - b.x) * 0.55 + (ax / n - b.vx) * 0.9 + sx * 900) * dt;
            b.vy += ((cy / n - b.y) * 0.55 + (ay / n - b.vy) * 0.9 + sy * 900) * dt;
          }

          if (pointer) {
            const dx = b.x - pointer.x;
            const dy = b.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 14400 && d2 > 1) {
              const d = Math.sqrt(d2);
              const f = (1 - d / 120) * 900;
              b.vx += (dx / d) * f * dt;
              b.vy += (dy / d) * f * dt;
            }
          }

          // Speed clamp keeps the flock coherent instead of accelerating away.
          const sp = Math.hypot(b.vx, b.vy);
          const max = 132;
          const min = 46;
          if (sp > max) {
            b.vx = (b.vx / sp) * max;
            b.vy = (b.vy / sp) * max;
          } else if (sp < min && sp > 0.01) {
            b.vx = (b.vx / sp) * min;
            b.vy = (b.vy / sp) * min;
          }

          b.x += b.vx * dt;
          b.y += b.vy * dt;

          // Wrap — an edgeless world reads better than bouncing.
          if (b.x < -6) b.x = w + 6;
          if (b.x > w + 6) b.x = -6;
          if (b.y < -6) b.y = h + 6;
          if (b.y > h + 6) b.y = -6;

          const a = Math.atan2(b.vy, b.vx);
          ctx.fillStyle = CYAN;
          ctx.globalAlpha = 0.9;
          ctx.beginPath();
          ctx.moveTo(b.x + Math.cos(a) * 5.5, b.y + Math.sin(a) * 5.5);
          ctx.lineTo(b.x + Math.cos(a + 2.5) * 4, b.y + Math.sin(a + 2.5) * 4);
          ctx.lineTo(b.x + Math.cos(a - 2.5) * 4, b.y + Math.sin(a - 2.5) * 4);
          ctx.closePath();
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      },
    },
    resetKey,
  );

  return <canvas ref={ref} className={surface} />;
}

/* ------------------------------------------------------------------ 03 --- */
/**
 * GAME OF LIFE — Conway on a toroidal grid. Click or drag to seed live cells;
 * the generation counter and population are read straight off the board.
 */
export function GameOfLife({ running, resetKey }: ExperimentProps) {
  type S = {
    cols: number;
    rows: number;
    cell: number;
    a: Uint8Array;
    b: Uint8Array;
    acc: number;
    gen: number;
  };

  const ref = useCanvasLoop<S>(
    running,
    {
      init: (w, h) => {
        const cell = w < 420 ? 7 : 9;
        const cols = Math.max(8, Math.floor(w / cell));
        const rows = Math.max(8, Math.floor(h / cell));
        const a = new Uint8Array(cols * rows);
        const rnd = seeded(4242);
        for (let i = 0; i < a.length; i++) a[i] = rnd() < 0.18 ? 1 : 0;
        return { cols, rows, cell, a, b: new Uint8Array(cols * rows), acc: 0, gen: 0 };
      },
      press: (s, x, y) => {
        // Paint a 3x3 block so a single click is actually visible.
        const cx = Math.floor(x / s.cell);
        const cy = Math.floor(y / s.cell);
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const gx = (cx + dx + s.cols) % s.cols;
            const gy = (cy + dy + s.rows) % s.rows;
            s.a[gy * s.cols + gx] = 1;
          }
        }
      },
      frame: (s, { ctx, w, h, dt }) => {
        s.acc += dt;
        // Fixed 12Hz step — the rules should be readable, not a blur.
        const STEP = 1 / 12;
        if (s.acc >= STEP) {
          s.acc %= STEP;
          const { a, b, cols, rows } = s;
          for (let y = 0; y < rows; y++) {
            const yUp = ((y - 1 + rows) % rows) * cols;
            const yDn = ((y + 1) % rows) * cols;
            const yMd = y * cols;
            for (let x = 0; x < cols; x++) {
              const xL = (x - 1 + cols) % cols;
              const xR = (x + 1) % cols;
              const n =
                a[yUp + xL] + a[yUp + x] + a[yUp + xR] +
                a[yMd + xL] + a[yMd + xR] +
                a[yDn + xL] + a[yDn + x] + a[yDn + xR];
              const alive = a[yMd + x];
              b[yMd + x] = n === 3 || (alive === 1 && n === 2) ? 1 : 0;
            }
          }
          s.a.set(b);
          s.gen++;
        }

        ctx.clearRect(0, 0, w, h);
        const { a, cols, rows, cell } = s;
        const pad = 1;
        ctx.fillStyle = LIME;
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            if (a[y * cols + x]) {
              ctx.fillRect(x * cell, y * cell, cell - pad, cell - pad);
            }
          }
        }
      },
    },
    resetKey,
  );

  return <canvas ref={ref} className={`${surface} cursor-crosshair`} />;
}

/* ------------------------------------------------------------------ 04 --- */
/**
 * GRAVITY WELLS — n-body attraction toward click-placed masses, with softened
 * gravity so a near-miss accelerates rather than diverging to infinity.
 */
export function GravityWells({ running, resetKey }: ExperimentProps) {
  type P = { x: number; y: number; vx: number; vy: number };
  type W = { x: number; y: number; m: number };
  type S = { ps: P[]; ws: W[]; w: number; h: number };

  const ref = useCanvasLoop<S>(
    running,
    {
      init: (w, h) => {
        const rnd = seeded(99137);
        const n = Math.round(Math.min(620, (w * h) / 900));
        const ps: P[] = Array.from({ length: n }, () => {
          const a = rnd() * Math.PI * 2;
          const r = 40 + rnd() * Math.min(w, h) * 0.42;
          const x = w / 2 + Math.cos(a) * r;
          const y = h / 2 + Math.sin(a) * r;
          // Seed on a tangential orbit so the system starts in motion.
          return { x, y, vx: -Math.sin(a) * 42, vy: Math.cos(a) * 42 };
        });
        return { ps, ws: [{ x: w / 2, y: h / 2, m: 5200 }], w, h };
      },
      press: (s, x, y) => {
        s.ws.push({ x, y, m: 4200 });
        if (s.ws.length > 5) s.ws.shift();
      },
      frame: (s, { ctx, w, h, dt }) => {
        ctx.fillStyle = "rgba(0,0,0,0.16)";
        ctx.fillRect(0, 0, w, h);

        for (const p of s.ps) {
          for (const wl of s.ws) {
            const dx = wl.x - p.x;
            const dy = wl.y - p.y;
            // Softening constant prevents the singularity at r -> 0.
            const d2 = dx * dx + dy * dy + 380;
            const inv = wl.m / (d2 * Math.sqrt(d2));
            p.vx += dx * inv * dt * 60;
            p.vy += dy * inv * dt * 60;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;

          if (p.x < -40 || p.x > w + 40 || p.y < -40 || p.y > h + 40) {
            p.x = Math.random() * w;
            p.y = Math.random() * h;
            p.vx = 0;
            p.vy = 0;
          }

          const sp = Math.hypot(p.vx, p.vy);
          ctx.fillStyle = sp > 190 ? ROSE : sp > 105 ? AMBER : VIOLET;
          ctx.globalAlpha = 0.85;
          ctx.fillRect(p.x, p.y, 1.7, 1.7);
        }

        for (const wl of s.ws) {
          ctx.globalAlpha = 1;
          ctx.strokeStyle = CYAN;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(wl.x, wl.y, 7, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      },
    },
    resetKey,
  );

  return <canvas ref={ref} className={`${surface} cursor-crosshair`} />;
}

/* ------------------------------------------------------------------ 05 --- */
/**
 * TYPOGRAPHIC DISSOLVE — the name sampled into particles that scatter under
 * the cursor and reassemble. Same technique as the ABOUT portrait, in 2D.
 */
export function TextDissolve({ running, resetKey }: ExperimentProps) {
  type P = { hx: number; hy: number; x: number; y: number; vx: number; vy: number };
  type S = { ps: P[]; w: number; h: number };

  const ref = useCanvasLoop<S>(
    running,
    {
      init: (w, h) => {
        // Rasterise the word offscreen, then sample its pixels.
        const off = document.createElement("canvas");
        off.width = w;
        off.height = h;
        const c = off.getContext("2d");
        const ps: P[] = [];
        if (c) {
          const size = Math.min(w / 5.4, h / 2.4);
          c.fillStyle = "#fff";
          c.font = `700 ${size}px ui-monospace, monospace`;
          c.textAlign = "center";
          c.textBaseline = "middle";
          c.fillText("BUILD", w / 2, h / 2);

          const img = c.getImageData(0, 0, w, h).data;
          const step = w < 420 ? 4 : 3;
          for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {
              if (img[(y * w + x) * 4 + 3] > 128) {
                ps.push({ hx: x, hy: y, x, y, vx: 0, vy: 0 });
              }
            }
          }
        }
        return { ps, w, h };
      },
      frame: (s, { ctx, w, h, dt, pointer }) => {
        ctx.clearRect(0, 0, w, h);
        // Frame-rate-independent damping toward home.
        const k = 1 - Math.pow(0.0009, dt);

        ctx.fillStyle = VIOLET;
        for (const p of s.ps) {
          if (pointer) {
            const dx = p.x - pointer.x;
            const dy = p.y - pointer.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < 5200 && d2 > 0.01) {
              const d = Math.sqrt(d2);
              const f = (1 - d / 72) * 1400;
              p.vx += (dx / d) * f * dt;
              p.vy += (dy / d) * f * dt;
            }
          }
          // Spring home + velocity bleed = settles, never oscillates forever.
          p.vx *= Math.pow(0.0025, dt);
          p.vy *= Math.pow(0.0025, dt);
          p.x += p.vx * dt + (p.hx - p.x) * k;
          p.y += p.vy * dt + (p.hy - p.y) * k;
          ctx.fillRect(p.x, p.y, 1.8, 1.8);
        }
      },
    },
    resetKey,
  );

  return <canvas ref={ref} className={surface} />;
}

/* ------------------------------------------------------------------ 06 --- */
/**
 * PATHFINDER — A* across a procedurally walled grid, animated one expansion
 * per frame-step so the frontier and the final path are both visible.
 */
export function Pathfinder({ running, resetKey }: ExperimentProps) {
  type S = {
    cols: number;
    rows: number;
    cell: number;
    wall: Uint8Array;
    g: Float32Array;
    f: Float32Array;
    from: Int32Array;
    open: number[];
    closed: Uint8Array;
    goal: number;
    start: number;
    done: boolean;
    path: number[];
    acc: number;
  };

  function build(w: number, h: number, seed: number): S {
    const cell = w < 420 ? 12 : 16;
    const cols = Math.max(10, Math.floor(w / cell));
    const rows = Math.max(10, Math.floor(h / cell));
    const n = cols * rows;
    const rnd = seeded(seed);
    const wall = new Uint8Array(n);
    for (let i = 0; i < n; i++) wall[i] = rnd() < 0.28 ? 1 : 0;

    const start = 0;
    const goal = n - 1;
    wall[start] = 0;
    wall[goal] = 0;

    const g = new Float32Array(n).fill(Infinity);
    const f = new Float32Array(n).fill(Infinity);
    g[start] = 0;
    f[start] = cols + rows;

    return {
      cols, rows, cell, wall, g, f,
      from: new Int32Array(n).fill(-1),
      open: [start],
      closed: new Uint8Array(n),
      goal, start,
      done: false,
      path: [],
      acc: 0,
    };
  }

  const ref = useCanvasLoop<S>(
    running,
    {
      init: (w, h) => build(w, h, 1337 + resetKey * 7919),
      press: (s, x, y) => {
        // Toggle a wall and restart the search from the same board.
        const cx = Math.floor(x / s.cell);
        const cy = Math.floor(y / s.cell);
        if (cx < 0 || cy < 0 || cx >= s.cols || cy >= s.rows) return;
        const i = cy * s.cols + cx;
        if (i === s.start || i === s.goal) return;
        s.wall[i] = s.wall[i] ? 0 : 1;

        const n = s.cols * s.rows;
        s.g = new Float32Array(n).fill(Infinity);
        s.f = new Float32Array(n).fill(Infinity);
        s.from = new Int32Array(n).fill(-1);
        s.closed = new Uint8Array(n);
        s.g[s.start] = 0;
        s.f[s.start] = s.cols + s.rows;
        s.open = [s.start];
        s.done = false;
        s.path = [];
      },
      frame: (s, { ctx, w, h, dt }) => {
        s.acc += dt;
        const STEP = 1 / 90;

        // Several expansions per frame keeps the search legible but not slow.
        while (!s.done && s.acc >= STEP) {
          s.acc -= STEP;
          if (!s.open.length) {
            s.done = true;
            break;
          }

          // Linear scan for the lowest f — the grid is small enough that a
          // binary heap would be more code for no perceptible gain.
          let bi = 0;
          for (let k = 1; k < s.open.length; k++) {
            if (s.f[s.open[k]] < s.f[s.open[bi]]) bi = k;
          }
          const cur = s.open.splice(bi, 1)[0];

          if (cur === s.goal) {
            s.done = true;
            let p = cur;
            const path: number[] = [];
            while (p !== -1) {
              path.push(p);
              p = s.from[p];
            }
            s.path = path;
            break;
          }

          s.closed[cur] = 1;
          const cx = cur % s.cols;
          const cy = (cur / s.cols) | 0;

          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]] as const) {
            const nx = cx + dx;
            const ny = cy + dy;
            if (nx < 0 || ny < 0 || nx >= s.cols || ny >= s.rows) continue;
            const ni = ny * s.cols + nx;
            if (s.wall[ni] || s.closed[ni]) continue;

            const tentative = s.g[cur] + 1;
            if (tentative < s.g[ni]) {
              s.g[ni] = tentative;
              // Manhattan heuristic — admissible on a 4-connected grid.
              s.f[ni] = tentative + Math.abs(nx - (s.cols - 1)) + Math.abs(ny - (s.rows - 1));
              s.from[ni] = cur;
              if (!s.open.includes(ni)) s.open.push(ni);
            }
          }
        }

        ctx.clearRect(0, 0, w, h);
        const { cols, rows, cell } = s;
        const pad = 1;

        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            const i = y * cols + x;
            let col: string | null = null;
            if (s.wall[i]) col = GHOST;
            else if (s.closed[i]) col = "rgba(34,211,238,0.16)";
            if (col) {
              ctx.fillStyle = col;
              ctx.fillRect(x * cell, y * cell, cell - pad, cell - pad);
            }
          }
        }

        // Frontier on top of the closed set.
        ctx.fillStyle = "rgba(168,85,247,0.5)";
        for (const i of s.open) {
          ctx.fillRect((i % cols) * cell, ((i / cols) | 0) * cell, cell - pad, cell - pad);
        }

        ctx.fillStyle = LIME;
        for (const i of s.path) {
          ctx.fillRect((i % cols) * cell, ((i / cols) | 0) * cell, cell - pad, cell - pad);
        }

        ctx.fillStyle = CYAN;
        ctx.fillRect(0, 0, cell - pad, cell - pad);
        ctx.fillStyle = ROSE;
        ctx.fillRect((cols - 1) * cell, (rows - 1) * cell, cell - pad, cell - pad);
      },
    },
    resetKey,
  );

  return <canvas ref={ref} className={`${surface} cursor-crosshair`} />;
}
