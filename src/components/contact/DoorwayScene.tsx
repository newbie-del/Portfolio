"use client";

import { useReducedMotion } from "framer-motion";
import { SceneCanvas } from "@/components/three/SceneCanvas";
import { DoorwayContents } from "./Doorway";

/**
 * Doorway scene wrapper — default-exported for `next/dynamic`, so three.js
 * never enters the CONTACT page's initial bundle.
 *
 * The fallback is a CSS reconstruction of the same composition (lit threshold,
 * rack LEDs, floor spill), so mobile and pre-hydration still read as a doorway
 * rather than an empty rectangle.
 */
export default function DoorwayScene() {
  const reduce = !!useReducedMotion();

  return (
    <SceneCanvas
      className="absolute inset-0"
      camera={{ position: [0, 0.1, 3.6], fov: 45 }}
      disableOnMobile
      fallback={<DoorwayFallback />}
    >
      <DoorwayContents reduced={reduce} />
    </SceneCanvas>
  );
}

/** Pure-CSS threshold. No WebGL, same read. */
function DoorwayFallback() {
  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden bg-abyss">
      {/* the opening */}
      <div className="absolute left-1/2 top-1/2 h-[62%] w-[26%] -translate-x-1/2 -translate-y-1/2 border border-hairline-hot">
        <div className="h-full w-full bg-gradient-to-b from-violet/70 via-violet/45 to-violet/20" />
        <div className="absolute inset-x-[28%] inset-y-[6%] bg-violet-soft/45 blur-[2px]" />
      </div>
      {/* spill onto the floor */}
      <div className="absolute inset-x-0 bottom-0 h-[34%] bg-gradient-to-t from-violet/[0.10] to-transparent" />
      <div className="absolute left-1/2 top-1/2 size-[52%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet/20 blur-3xl" />

      {/* rack + LEDs */}
      <div className="absolute left-[16%] top-1/2 h-28 w-10 -translate-y-1/2 border border-hairline-lit bg-panel-2">
        <div className="flex h-full flex-col justify-center gap-2 pl-1.5">
          {["bg-lime", "bg-cyan", "bg-violet", "bg-amber"].map((c, i) => (
            <span
              key={c}
              className={`size-1 rounded-full ${c} animate-pulse`}
              style={{ animationDelay: `${i * 0.4}s`, animationDuration: "2.4s" }}
            />
          ))}
        </div>
      </div>

      {/* terminal panel */}
      <div className="absolute right-[15%] top-1/2 h-16 w-24 -translate-y-1/2 border border-hairline-lit bg-panel-2">
        <div className="scanlines h-full w-full space-y-1.5 p-2">
          <div className="h-1 w-8 bg-lime/60" />
          <div className="h-1 w-14 bg-cyan/40" />
          <div className="h-1 w-10 bg-faint" />
        </div>
      </div>

      <div className="absolute inset-x-0 top-[68%] h-px bg-hairline-hot" />
    </div>
  );
}
