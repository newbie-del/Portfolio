"use client";

import { useReducedMotion } from "framer-motion";
import { SceneCanvas } from "./SceneCanvas";
import { WorkspaceContents } from "./WorkspaceScene";

/**
 * Hero scene wrapper — default-exported so it can be `next/dynamic` imported
 * without pulling three.js into the initial bundle.
 *
 * The camera here is the rig's OPEN, not its HOME: the shot begins close, high
 * and wide, then pulls BACK while zooming IN (see the CAMERA RIG note in
 * WorkspaceScene). These two values must stay in step with the constants there,
 * otherwise the first painted frame is at the resolved framing and the move
 * starts with a jump.
 *
 * HOME and its 58 degree lens are recovered from the reference, not chosen: the
 * keyboard's two side edges converge 421px above its front edge, which puts the
 * desk plane's horizon at screen y 174 and fixes the camera pitch at 15.7deg.
 * Everything else in the scene is scaled to that.
 */
export default function HeroScene() {
  const reduce = !!useReducedMotion();

  return (
    <SceneCanvas
      className="absolute inset-0"
      camera={{
        position: reduce ? [-0.72, 0.42, 3.6] : [-1.05, 1.16, 2.35],
        fov: reduce ? 58 : 74,
      }}
      disableOnMobile
      fallback={<WorkspaceFallback />}
    >
      <WorkspaceContents reduced={reduce} />
    </SceneCanvas>
  );
}

/**
 * Pure-CSS workspace for mobile and pre-hydration. Not a shrunken render — a
 * composition built for a tall, narrow frame: the window and its rain climb the
 * left edge, the screen wall stacks rather than spreads, and the warm lamp pool
 * anchors the bottom. Same light logic as the 3D scene, no WebGL.
 */
function WorkspaceFallback() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-abyss">
      {/* --- night window, upper left --- */}
      <div className="absolute -left-6 top-[6%] h-[38%] w-[54%]">
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(170deg,#0d1526 0%,#16233c 70%,#0a1220 100%)" }}
        />
        {/* skyline silhouette */}
        <div className="absolute inset-x-0 bottom-0 flex h-[46%] items-end gap-[3px] px-2">
          {[62, 88, 44, 100, 70, 54, 92, 38, 76].map((h, i) => (
            <div
              key={i}
              className="flex-1 bg-[#060a12]"
              style={{ height: `${h}%` }}
            >
              {/* lit windows */}
              <div className="mt-1.5 flex flex-wrap gap-[3px] px-[3px]">
                {Array.from({ length: 6 }).map((_, j) => (
                  <span
                    key={j}
                    className="size-[2px]"
                    style={{
                      background: (i + j) % 5 === 0 ? "#ffd9a0" : "#a8c4e8",
                      opacity: (i * 3 + j) % 3 === 0 ? 0.15 : 0.55,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* wet-air haze */}
        <div
          className="absolute inset-x-0 bottom-0 h-1/2"
          style={{ background: "linear-gradient(0deg,rgb(52 88 148/0.35),transparent)" }}
        />
        {/* Frame only. The 3D window is a single pane, and a mullion grid here
            would put the mobile composition at odds with the desktop one. */}
        <div className="absolute inset-0 border-2 border-[#0b0b0f]" />
      </div>

      {/* cold spill from the window */}
      <div
        className="absolute left-0 top-[10%] h-[46%] w-[70%] opacity-60 blur-3xl"
        style={{ background: "radial-gradient(circle at 25% 40%,#2f5a94,transparent 70%)" }}
      />

      {/* --- screen wall, stacked for a narrow frame --- */}
      <div className="absolute inset-x-6 top-[34%] space-y-2.5">
        {/* editor */}
        <div className="relative border border-hairline-lit bg-panel-2">
          <div className="flex items-center gap-2 border-b border-hairline px-2 py-1">
            <span className="h-px w-6 bg-lime" />
            <span className="text-[7px] tracking-[0.16em] text-faint">Monitor.tsx</span>
          </div>
          <div className="space-y-[3px] p-2.5">
            {[
              [18, "#a78bfa"],
              [52, "#7e808a"],
              [34, "#6aa9e9"],
              [64, "#7e808a"],
              [28, "#b4e34a"],
              [46, "#7e808a"],
              [22, "#d9a343"],
            ].map(([w, c], i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="text-[6px] text-ghost">{String(i + 1).padStart(2, "0")}</span>
                <span className="h-[3px]" style={{ width: `${w}%`, background: c as string, opacity: 0.72 }} />
              </div>
            ))}
          </div>
          <div className="pointer-events-none absolute inset-0 bg-violet/[0.05]" />
        </div>

        {/* graph + logs side by side */}
        <div className="grid grid-cols-2 gap-2.5">
          <div className="relative border border-hairline-lit bg-panel-2 p-2.5">
            <span className="text-[6.5px] tracking-[0.16em] text-faint">GRAPH</span>
            <div className="mt-2 flex h-12 items-end gap-[3px]">
              {[0.4, 0.72, 0.5, 0.9, 0.62, 0.8, 0.46, 0.68].map((h, i) => (
                <span key={i} className="flex-1 bg-lime/45" style={{ height: `${h * 100}%` }} />
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-lime/[0.04]" />
          </div>
          <div className="relative border border-hairline-lit bg-panel-2 p-2.5">
            <span className="text-[6.5px] tracking-[0.16em] text-faint">LOG</span>
            <div className="mt-2 space-y-[5px]">
              {[
                ["#6aa9e9", 62],
                ["#a78bfa", 44],
                ["#6aa9e9", 70],
                ["#6aa9e9", 38],
                ["#d9a343", 56],
              ].map(([c, w], i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="size-[3px]" style={{ background: c as string }} />
                  <span className="h-[3px] bg-faint/50" style={{ width: `${w}%` }} />
                </div>
              ))}
            </div>
            <div className="pointer-events-none absolute inset-0 bg-azure/[0.04]" />
          </div>
        </div>
      </div>

      {/* --- desk edge --- */}
      <div className="absolute inset-x-0 bottom-[18%] h-px bg-hairline-hot" />
      <div
        className="absolute inset-x-0 bottom-0 h-[18%]"
        style={{ background: "linear-gradient(180deg,#0a0a0d,#050506)" }}
      />
      {/* keyboard underglow — violet, matching the 3D scene's machine accent */}
      <div
        className="absolute bottom-[8%] left-1/2 h-16 w-[68%] -translate-x-1/2 opacity-50 blur-2xl"
        style={{ background: "radial-gradient(ellipse at center,#9b7cf0,transparent 70%)" }}
      />
      {/* warm lamp pool, lower left */}
      <div
        className="absolute bottom-[12%] left-[-10%] h-40 w-[60%] opacity-45 blur-3xl"
        style={{ background: "radial-gradient(circle at 40% 60%,#ffb063,transparent 68%)" }}
      />
      {/* vignette, matching the scene's fog falloff */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 45% 42%,transparent 22%,rgb(3 4 8/0.6) 74%,rgb(3 4 8/0.94) 100%)",
        }}
      />
    </div>
  );
}
