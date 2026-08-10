"use client";

import { useReducedMotion } from "framer-motion";
import { SceneCanvas } from "./SceneCanvas";
import { WorkspaceContents } from "./WorkspaceScene";

/**
 * Hero scene wrapper — default-exported so it can be `next/dynamic` imported
 * without pulling three.js into the initial bundle.
 *
 * The CSS fallback is not a blank box: on mobile and pre-hydration it renders
 * a static approximation of the same workspace composition, so the hero reads
 * correctly even when WebGL never runs.
 */
export default function HeroScene() {
  const reduce = !!useReducedMotion();

  return (
    <SceneCanvas
      className="absolute inset-0"
      camera={{ position: [0, 0.15, 4.2], fov: 42 }}
      disableOnMobile
      fallback={<WorkspaceFallback />}
    >
      <WorkspaceContents reduced={reduce} />
    </SceneCanvas>
  );
}

/** Pure-CSS workspace: three glowing panels on a dark desk. No WebGL. */
function WorkspaceFallback() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-abyss">
      {/* window rim light */}
      <div
        className="absolute right-[8%] top-[14%] h-40 w-32 opacity-70 blur-2xl"
        style={{ background: "linear-gradient(180deg,#1e3a8a,transparent)" }}
      />
      {/* monitors */}
      <div className="absolute left-1/2 top-[38%] flex -translate-x-1/2 -translate-y-1/2 items-end gap-3">
        <div className="h-24 w-32 -skew-y-[6deg] border border-hairline-lit bg-panel-2 shadow-[0_0_40px_-12px_rgb(163_230_53/0.4)]">
          <div className="scanlines h-full w-full p-2">
            <div className="h-1 w-10 bg-lime/60" />
            <div className="mt-1.5 h-1 w-16 bg-faint" />
            <div className="mt-1.5 h-1 w-12 bg-faint" />
          </div>
        </div>
        <div className="h-36 w-52 border border-hairline-lit bg-panel-2 shadow-[0_0_60px_-12px_rgb(168_85_247/0.45)]">
          <div className="scanlines h-full w-full space-y-1.5 p-3">
            {[40, 64, 28, 52, 36, 60, 24].map((w, i) => (
              <div
                key={i}
                className="h-1"
                style={{
                  width: `${w}%`,
                  background: i % 3 === 0 ? "rgb(168 85 247/0.7)" : "rgb(124 124 136/0.5)",
                }}
              />
            ))}
          </div>
        </div>
        <div className="h-24 w-32 skew-y-[6deg] border border-hairline-lit bg-panel-2 shadow-[0_0_40px_-12px_rgb(34_211_238/0.4)]">
          <div className="scanlines flex h-full w-full items-end gap-0.5 p-2">
            {[0.4, 0.7, 0.5, 0.9, 0.6, 0.8, 0.45, 0.65].map((h, i) => (
              <div key={i} className="flex-1 bg-cyan/50" style={{ height: `${h * 100}%` }} />
            ))}
          </div>
        </div>
      </div>
      {/* desk */}
      <div className="absolute inset-x-0 top-[52%] h-px bg-hairline-hot" />
      <div className="absolute inset-x-0 top-[52%] h-40 bg-gradient-to-b from-violet/[0.06] to-transparent" />
    </div>
  );
}
