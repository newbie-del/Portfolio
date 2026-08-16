"use client";

import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, type ReactNode } from "react";
import { DUR, EASE } from "@/lib/motion";

/**
 * PAGE SHELL
 * ---------------------------------------------------------------------------
 * Offsets content past the fixed rail and carries the route transition.
 * The transition is short and vertical: moving between routes should feel
 * like one system switching environments, not a slideshow.
 */
export function PageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -5 }}
        transition={{ duration: DUR.transition, ease: EASE.out }}
        className="relative min-h-dvh pt-[53px] lg:pl-[200px] lg:pt-0"
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}

/**
 * Boot curtain. Wipes up from the bottom edge on route change, with a lime
 * seam on the leading edge so the wipe has a direction you can read.
 */
export function TransitionCurtain() {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);

  useEffect(() => setKey(pathname), [pathname]);

  return (
    <AnimatePresence>
      <motion.div
        key={key}
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[60] bg-void"
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: DUR.transition, ease: EASE.inOut }}
        style={{ transformOrigin: "top" }}
      >
        <div className="absolute inset-x-0 bottom-0 h-px bg-lime/50" />
      </motion.div>
    </AnimatePresence>
  );
}
