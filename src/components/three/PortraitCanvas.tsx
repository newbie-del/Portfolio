"use client";

import { useReducedMotion } from "framer-motion";
import { SceneCanvas } from "./SceneCanvas";
import { PortraitContents } from "./PortraitScene";

/**
 * Portrait scene host — default-exported so the ABOUT page can `next/dynamic`
 * it with `ssr: false`, keeping three.js out of the initial bundle.
 *
 * The canvas fills its panel; the panel owns the aspect ratio. Camera sits
 * back far enough to frame a 3.1-unit-tall point cloud with margin.
 */
export default function PortraitCanvas() {
  const reduce = !!useReducedMotion();

  return (
    <SceneCanvas
      className="absolute inset-0"
      camera={{ position: [0, 0, 4.4], fov: 40 }}
      fallback={<PortraitFallback />}
    >
      <PortraitContents reduced={reduce} />
    </SceneCanvas>
  );
}

/**
 * Pre-hydration placeholder. Deliberately not a copy of the photo: it reads as
 * the scene still resolving, which is what is actually happening.
 */
function PortraitFallback() {
  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center bg-void">
      <span className="text-[9px] tracking-[0.2em] text-ghost">RESOLVING SUBJECT...</span>
    </div>
  );
}
