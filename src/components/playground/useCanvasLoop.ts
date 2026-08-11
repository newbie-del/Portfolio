"use client";

import { useEffect, useRef } from "react";

export interface LoopCtx {
  ctx: CanvasRenderingContext2D;
  /** CSS pixels, not device pixels — the transform is already applied. */
  w: number;
  h: number;
  /** Seconds since the previous frame, clamped so a tab switch cannot explode. */
  dt: number;
  /** Pointer in CSS pixels, or null when it has left the surface. */
  pointer: { x: number; y: number } | null;
  down: boolean;
}

export interface LoopHandlers<S> {
  /** Allocate state. Called on mount and on every resize. */
  init: (w: number, h: number) => S;
  frame: (s: S, c: LoopCtx) => void;
  /** Optional discrete input, e.g. seeding a cell or dropping a ripple. */
  press?: (s: S, x: number, y: number, c: LoopCtx) => void;
}

/**
 * A single requestAnimationFrame loop bound to a DPR-correct 2D canvas.
 *
 * The loop only runs while `running` is true, so an inactive experiment costs
 * nothing — no timers, no frames, no retained GPU surface work. Resize is
 * observed rather than polled, and re-inits state at the new size because every
 * experiment here allocates buffers from the dimensions.
 */
export function useCanvasLoop<S>(
  running: boolean,
  handlers: LoopHandlers<S>,
  /** Bump to force a fresh init (the RESET control). */
  resetKey: number = 0,
) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Handlers are captured per-frame from a ref so callers can pass inline
  // closures without restarting the loop on every render.
  const hRef = useRef(handlers);
  hRef.current = handlers;

  const pressRef = useRef<((x: number, y: number) => void) | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !running) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();
    let state: S | null = null;
    let w = 0;
    let h = 0;

    const pointer = { x: 0, y: 0, inside: false, down: false };

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = canvas!.getBoundingClientRect();
      w = Math.max(1, Math.round(r.width));
      h = Math.max(1, Math.round(r.height));
      canvas!.width = Math.round(w * dpr);
      canvas!.height = Math.round(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      state = hRef.current.init(w, h);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    function loopCtx(dt: number): LoopCtx {
      return {
        ctx: ctx!,
        w,
        h,
        dt,
        pointer: pointer.inside ? { x: pointer.x, y: pointer.y } : null,
        down: pointer.down,
      };
    }

    pressRef.current = (x, y) => {
      if (state) hRef.current.press?.(state, x, y, loopCtx(0));
    };

    function tick(now: number) {
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;
      if (state) hRef.current.frame(state, loopCtx(dt));
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    function toLocal(e: PointerEvent) {
      const r = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - r.left;
      pointer.y = e.clientY - r.top;
    }

    const onMove = (e: PointerEvent) => {
      toLocal(e);
      pointer.inside = true;
      if (pointer.down) pressRef.current?.(pointer.x, pointer.y);
    };
    const onLeave = () => {
      pointer.inside = false;
      pointer.down = false;
    };
    const onDown = (e: PointerEvent) => {
      toLocal(e);
      pointer.inside = true;
      pointer.down = true;
      pressRef.current?.(pointer.x, pointer.y);
    };
    const onUp = () => {
      pointer.down = false;
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      pressRef.current = null;
    };
  }, [running, resetKey]);

  return canvasRef;
}

/** Deterministic PRNG — experiments must look identical on every reset. */
export function seeded(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}
