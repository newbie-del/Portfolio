"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useMotionValue, useSpring, useReducedMotion } from "framer-motion";

/**
 * Counts up when scrolled into view. Used by SYSTEM METRICS and stat blocks.
 * "The numbers should count up smoothly."
 */
export function CountUp({
  value,
  suffix = "",
  pad = 2,
  duration = 1.6,
  className,
}: {
  value: number | null;
  suffix?: string;
  pad?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === null || !inView) return;
    if (reduce) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const ms = duration * 1000;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      // easeOutExpo — fast commit, precise settle. Matches the motion system.
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(Math.round(eased * value));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, duration, reduce]);

  return (
    <span ref={ref} className={className}>
      {value === null ? suffix : `${String(display).padStart(pad, "0")}${suffix}`}
    </span>
  );
}

/**
 * Restrained terminal typing. Types at a readable rate — never one slow
 * character at a time, per "Do not type every word excessively slowly."
 */
export function Typewriter({
  text,
  speed = 18,
  delay = 0,
  className,
  onDone,
  caret = false,
}: {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
  onDone?: () => void;
  caret?: boolean;
}) {
  const [out, setOut] = useState("");
  const reduce = useReducedMotion();
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (reduce) {
      setOut(text);
      doneRef.current?.();
      return;
    }
    setOut("");
    let i = 0;
    let interval: ReturnType<typeof setInterval>;
    const timeout = setTimeout(() => {
      interval = setInterval(() => {
        // Step 2 chars per tick so long strings stay brisk.
        i = Math.min(text.length, i + 2);
        setOut(text.slice(0, i));
        if (i >= text.length) {
          clearInterval(interval);
          doneRef.current?.();
        }
      }, speed);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, speed, delay, reduce]);

  return (
    <span className={className}>
      {out}
      {caret && <i className="caret ml-0.5" />}
    </span>
  );
}

/**
 * Tracks normalised pointer position (-1..1) for camera parallax and
 * cursor-reactive elements. Spring-smoothed so motion has weight.
 */
export function usePointerParallax(strength = 1) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 90, damping: 26, mass: 1.1 });
  const sy = useSpring(y, { stiffness: 90, damping: 26, mass: 1.1 });

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      x.set(((e.clientX / window.innerWidth) * 2 - 1) * strength);
      y.set(((e.clientY / window.innerHeight) * 2 - 1) * strength);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [x, y, strength]);

  return { x: sx, y: sy };
}

/** True once mounted — guards client-only rendering (canvas, time). */
export function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

/** Coarse pointer / small viewport — used to downgrade 3D on mobile. */
export function useIsMobile(breakpoint = 768) {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${breakpoint}px)`);
    const update = () => setMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [breakpoint]);
  return mobile;
}
