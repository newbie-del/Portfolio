"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Typewriter } from "@/components/ui/primitives";
import { Led } from "@/components/ui/Panel";
import { NAV } from "@/data/site";
import { DUR, EASE } from "@/lib/motion";

/**
 * 404 — SEGMENT NOT FOUND
 * ---------------------------------------------------------------------------
 * "The website should feel like one connected digital environment." A default
 * framework 404 would break that in one screen, so a missing route is reported
 * the way the rest of the system reports anything: as a terminal readout, with
 * the routing table offered as the recovery path.
 */
export default function NotFound() {
  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] place-items-center px-5 py-16 sm:px-8 lg:min-h-dvh lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DUR.slow, ease: EASE.outExpo }}
        className="panel corner-ticks w-full max-w-2xl"
      >
        <header className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
          <span className="section-label flex items-center gap-2">
            <Led tone="rose" />
            SIGNAL LOST
          </span>
          <span className="text-[8.5px] tabular-nums tracking-[0.2em] text-ghost">HTTP 404</span>
        </header>

        <div className="p-6 sm:p-8">
          <p className="display text-[clamp(3rem,12vw,6rem)] leading-none text-bright">404</p>

          <p className="mt-5 text-[10.5px] leading-relaxed text-lime">
            <span className="text-ghost">$</span>{" "}
            <Typewriter text="resolve --route" speed={26} caret />
          </p>
          <p className="mt-1.5 text-[10.5px] leading-relaxed text-muted">
            No segment mounted at that address. It was never built, or it has moved.
          </p>

          <div className="mt-7 border-t border-hairline pt-5">
            <p className="section-label mb-3">ROUTING TABLE</p>
            <ul className="grid gap-x-6 sm:grid-cols-2">
              {NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="group flex items-baseline gap-3 border-b border-hairline py-2 text-[11px] tracking-[0.14em]"
                  >
                    <span className="tabular-nums text-faint transition-colors duration-200 group-hover:text-violet">
                      {item.index}
                    </span>
                    <span className="text-muted transition-colors duration-200 group-hover:text-bright">
                      {item.label}
                    </span>
                    <span className="ml-auto text-[8.5px] text-ghost">{item.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link href="/" className="cmd group mt-7 inline-flex">
            RETURN TO INDEX
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
