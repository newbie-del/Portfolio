"use client";

import { useReducedMotion } from "framer-motion";
import type { XRayLayer } from "@/data/projects";
import { SceneCanvas } from "./SceneCanvas";
import { XRayContents } from "./XRayScene";

/**
 * X-Ray scene host — default-exported for `next/dynamic({ ssr: false })` so
 * three.js only loads when a teardown page is actually opened.
 *
 * Mobile renders the DOM layer list instead (handled by the caller), so the
 * canvas is skipped entirely rather than downscaled.
 */
export default function XRayCanvas({
  layers,
  open,
  hoveredId,
  activeId,
  onHover,
  onSelect,
}: {
  layers: XRayLayer[];
  open: boolean;
  hoveredId: string | null;
  activeId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const reduce = !!useReducedMotion();

  return (
    <SceneCanvas
      className="absolute inset-0"
      camera={{ position: [0, 0.1, 5.1], fov: 38 }}
      disableOnMobile
      fallback={<XRayFallback />}
    >
      <XRayContents
        layers={layers}
        open={open}
        hoveredId={hoveredId}
        activeId={activeId}
        reduced={reduce}
        onHover={onHover}
        onSelect={onSelect}
      />
    </SceneCanvas>
  );
}

function XRayFallback() {
  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center bg-void">
      <span className="text-[9px] tracking-[0.2em] text-ghost">MAPPING SYSTEM...</span>
    </div>
  );
}
