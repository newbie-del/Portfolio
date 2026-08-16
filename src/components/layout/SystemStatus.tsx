"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SITE } from "@/data/site";

/**
 * SYSTEM STATUS
 * ---------------------------------------------------------------------------
 * The reference shows a CPU / RAM / GPU readout in the rail. Those numbers
 * cannot be read from a browser, and printing invented ones would be a
 * fabricated claim about the visitor's machine.
 *
 * So every row here is genuinely measured instead:
 *   FPS     counted from a rAF loop, which is the site's own render health
 *   HEAP    performance.memory when Chromium exposes it, omitted otherwise
 *   CORES   navigator.hardwareConcurrency
 *   UPTIME  time since this page loaded
 *   LOCAL   from the resume
 *
 * The chart plots WORST FRAME TIME per sampling window, not average FPS. Two
 * reasons, and the first is that it is the better instrument: an average pinned
 * at 60 hides a 40ms hitch, whereas the peak shows it. The second is that a
 * 60fps average is a dead flat line, so the reference's jagged trace could only
 * have been reproduced by inventing variance — and a fabricated readout is worse
 * than an honest boring one. Peak frame time varies for real reasons (raster,
 * GC, the scene's own work), so this draws the reference's shape from real data.
 */

const SAMPLES = 48;

interface Telemetry {
  fps: number;
  /** Megabytes in use. A percentage of jsHeapSizeLimit is useless here: the
   *  limit is ~4GB and the page uses ~30MB, so it always rounds to 0%. */
  heapMb: number | null;
  cores: number | null;
  uptime: string;
}

function formatUptime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

/** Chromium-only, and behind a flag in some builds. Absent is the normal case. */
interface PerfMemory {
  usedJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export function SystemStatus() {
  const reduce = useReducedMotion();
  const [data, setData] = useState<Telemetry>({
    fps: 0,
    heapMb: null,
    cores: null,
    uptime: "0s",
  });
  const [history, setHistory] = useState<number[]>([]);

  useEffect(() => {
    const start = performance.now();
    setData((d) => ({ ...d, cores: navigator.hardwareConcurrency ?? null }));

    let raf = 0;
    let frames = 0;
    let windowStart = performance.now();
    let last = windowStart;
    let worst = 0;

    const tick = (now: number) => {
      frames++;
      // Peak interval within the window — the number the chart plots.
      const delta = now - last;
      last = now;
      if (delta > worst) worst = delta;

      // Publish once per ~500ms. Sampling faster produces a jittery number
      // that reads as noise; slower stops feeling live.
      if (now - windowStart >= 500) {
        const fps = Math.round((frames * 1000) / (now - windowStart));
        frames = 0;
        windowStart = now;

        const mem = (performance as Performance & { memory?: PerfMemory }).memory;
        const heapMb = mem ? Math.round(mem.usedJSHeapSize / 1048576) : null;

        setData((d) => ({
          ...d,
          fps,
          heapMb,
          uptime: formatUptime(now - start),
        }));
        setHistory((h) => [...h.slice(-(SAMPLES - 1)), worst]);
        worst = 0;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Under reduced motion the loop still measures, but the readout settles
  // instead of ticking, and the chart is not drawn.
  const rows: Array<[string, string]> = [
    ["FPS", data.fps ? String(data.fps) : "--"],
    ...(data.heapMb !== null
      ? ([["HEAP", `${data.heapMb} MB`]] as Array<[string, string]>)
      : []),
    ...(data.cores !== null
      ? ([["CORES", String(data.cores)]] as Array<[string, string]>)
      : []),
    ["UPTIME", data.uptime],
    ["LOCATION", SITE.locationShort],
  ];

  return (
    <div className="px-5 py-4">
      <p className="t-label mb-3 text-ghost">// System Status</p>

      <dl className="space-y-[7px]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex items-baseline justify-between gap-2">
            <dt className="t-meta text-[10px] tracking-[0.12em] text-faint">{k}</dt>
            <dd className="t-num text-[11px] text-lime">{v}</dd>
          </div>
        ))}
      </dl>

      {!reduce && <Sparkline values={history} />}
    </div>
  );
}

/**
 * Peak frame time per 500ms window, in milliseconds. Scaled to a fixed 0-34ms
 * window (two frames at 60Hz) rather than to its own min/max, so a calm trace
 * stays low instead of being stretched into fake drama — and a real hitch
 * genuinely spikes.
 *
 * The 16.7ms line is drawn because it is the only number that means anything
 * here: below it the frame made its budget, above it something was dropped. A
 * chart without that reference is a squiggle.
 */
function Sparkline({ values }: { values: number[] }) {
  const W = 160;
  const H = 34;
  const CEILING = 34;
  const BUDGET = 16.7;

  if (values.length < 2) {
    return <div aria-hidden className="mt-4" style={{ height: H }} />;
  }

  const step = W / (SAMPLES - 1);
  const y = (v: number) => H - (Math.min(v, CEILING) / CEILING) * H;
  const points = values.map((v, i) => `${(i * step).toFixed(1)},${y(v).toFixed(1)}`);
  const last = values[values.length - 1];

  return (
    <figure className="mt-4">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        height={H}
        role="img"
        aria-label={`Peak frame time, currently ${last.toFixed(0)} milliseconds`}
        preserveAspectRatio="none"
        className="overflow-visible"
      >
        {/* Frame budget. Dashed and dim: a scale marking, not a series. */}
        <line
          x1="0"
          x2={W}
          y1={y(BUDGET)}
          y2={y(BUDGET)}
          stroke="var(--color-hairline-hot)"
          strokeWidth="1"
          strokeDasharray="2 3"
          vectorEffect="non-scaling-stroke"
        />
        {/* Area under the trace, so the chart reads as a filled instrument
            rather than as a hairline scribble at this size. */}
        <polygon
          points={`0,${H} ${points.join(" ")} ${((values.length - 1) * step).toFixed(1)},${H}`}
          fill="var(--color-lime)"
          opacity="0.09"
        />
        <polyline
          points={points.join(" ")}
          fill="none"
          stroke="var(--color-lime)"
          strokeWidth="1"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          opacity="0.85"
        />
        {/* Live head. The one dot tells you which end is now. */}
        <circle
          cx={((values.length - 1) * step).toFixed(1)}
          cy={y(last).toFixed(1)}
          r="1.6"
          fill="var(--color-lime)"
        />
      </svg>
    </figure>
  );
}
