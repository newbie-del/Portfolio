"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence, useScroll, useSpring } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { DUR, EASE } from "@/lib/motion";
import { SITE } from "@/data/site";
import { useMounted } from "@/components/ui/primitives";

/**
 * PAGE TRANSITIONS
 * ---------------------------------------------------------------------------
 * "Use terminal-like boot transitions" — moving between pages should feel like
 * one connected system navigating between environments, not a fade.
 * Short and deliberate: ~620ms, inside the 400-900ms window.
 */
export function PageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: DUR.transition * 0.62, ease: EASE.outExpo }}
        className="relative min-h-dvh pt-14 lg:pl-[218px] lg:pt-0"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}

/** Boot curtain — sweeps across on route change. */
export function TransitionCurtain() {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);

  useEffect(() => setKey(pathname), [pathname]);

  return (
    <AnimatePresence>
      <motion.div
        key={key}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] origin-top bg-void"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: DUR.transition, ease: EASE.inOutQuint }}
        style={{ transformOrigin: "top" }}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-violet/60" />
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * STATUS BAR — the footer strip from the reference.
 * Live clock keeps it feeling like a running system.
 */
export function StatusBar() {
  const mounted = useMounted();
  const [time, setTime] = useState("");
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.6 });

  useEffect(() => {
    const tick = () =>
      setTime(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Kolkata",
        }),
      );
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 hidden border-t border-hairline bg-abyss/90 backdrop-blur-xl lg:block lg:pl-[218px]">
      {/* Scroll progress hairline */}
      <motion.div
        aria-hidden
        className="absolute left-0 top-0 h-px w-full origin-left bg-gradient-to-r from-violet via-cyan to-lime"
        style={{ scaleX: progress }}
      />
      <div className="flex items-center justify-between px-6 py-2 text-[9px] tracking-[0.16em] text-faint">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="inline-block size-1 animate-pulse rounded-full bg-lime" />
            SYSTEM STATUS: <span className="text-lime">ONLINE</span>
          </span>
          <span>&gt; VERSION: {SITE.version}</span>
        </div>
        <div className="flex items-center gap-5">
          <span>{SITE.location.toUpperCase()}</span>
          <span className="tabular-nums text-muted">{mounted ? time : "--:--:--"} IST</span>
        </div>
      </div>
    </div>
  );
}

/**
 * Ambient cursor glow. Subtle lighting change that follows the pointer —
 * environmental, never a distracting blob.
 */
export function CursorGlow() {
  const [pos, setPos] = useState({ x: -500, y: -500 });

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const onMove = (e: PointerEvent) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 hidden lg:block"
      style={{
        background: `radial-gradient(420px circle at ${pos.x}px ${pos.y}px, rgb(168 85 247 / 0.055), transparent 70%)`,
      }}
    />
  );
}
