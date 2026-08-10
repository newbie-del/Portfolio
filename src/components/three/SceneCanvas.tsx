"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useIsMobile, useMounted } from "@/components/ui/primitives";

/**
 * SceneCanvas
 * ---------------------------------------------------------------------------
 * Shared R3F host. Centralises the decisions that keep 3D from becoming a
 * liability: DPR clamping, on-demand vs continuous rendering, mobile
 * downgrade, reduced-motion, and a CSS-only fallback so the layout never
 * depends on WebGL succeeding.
 */
export function SceneCanvas({
  children,
  className = "",
  camera = { position: [0, 0.15, 4.2] as [number, number, number], fov: 42 },
  fallback,
  /** Render only when something changes — for static/interactive-only scenes. */
  onDemand = false,
  /** Skip 3D entirely on mobile and show the fallback instead. */
  disableOnMobile = false,
}: {
  children: ReactNode;
  className?: string;
  camera?: { position: [number, number, number]; fov: number };
  fallback?: ReactNode;
  onDemand?: boolean;
  disableOnMobile?: boolean;
}) {
  const mounted = useMounted();
  const isMobile = useIsMobile();
  const reduce = !!useReducedMotion();

  // Never render a canvas during SSR, and honour the mobile downgrade.
  if (!mounted || (disableOnMobile && isMobile)) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div className={className}>
      <Canvas
        camera={camera}
        // Cap DPR: retina at 2x doubles fill cost for no perceived gain here.
        dpr={[1, isMobile ? 1.4 : 1.75]}
        frameloop={onDemand || reduce ? "demand" : "always"}
        gl={{
          antialias: !isMobile,
          powerPreference: "high-performance",
          alpha: true,
        }}
        // Pause when scrolled out of view — no offscreen GPU burn.
        performance={{ min: 0.5 }}
      >
        <Suspense fallback={null}>{children}</Suspense>
      </Canvas>
    </div>
  );
}
