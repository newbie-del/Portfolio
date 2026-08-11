"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X, Github, Linkedin } from "lucide-react";

/** Minimal X mark in the "X / Twitter" sense — a × with the X logotype. */
function XLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
import { NAV, SITE } from "@/data/site";
import { DUR, EASE } from "@/lib/motion";

/**
 * GLOBAL NAVIGATION
 * ---------------------------------------------------------------------------
 * The left rail from the reference, made real:
 *   - clicking an item routes to that section
 *   - the active section has a clear visual state
 *   - hovering produces a subtle technical response (index brightens,
 *     a scan bar sweeps, the label shifts)
 * On mobile it collapses into a compact overlay rather than shrinking.
 */
export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* ---------------------------------------------------- DESKTOP RAIL */}
      <nav
        aria-label="Primary"
        className="fixed left-0 top-0 z-40 hidden h-dvh w-[218px] flex-col border-r border-hairline bg-abyss/80 backdrop-blur-xl lg:flex"
      >
        <Link
          href="/"
          className="group flex items-center gap-2 border-b border-hairline px-5 py-5"
        >
          <span className="font-display text-[13px] font-bold tracking-[0.18em] text-bright">
            {SITE.handle}
          </span>
          <span className="text-[13px] text-violet transition-colors group-hover:text-cyan">
            ://
          </span>
        </Link>

        {/* Boot readout — establishes the terminal identity */}
        <div className="border-b border-hairline px-5 py-4 text-[9.5px] leading-relaxed">
          <div className="mb-1.5 text-lime">&gt; SYSTEM_BOOT</div>
          <Row k="user" v="newbie-del" />
          <Row k="role" v="builder" />
          <Row k="mode" v="fullstack" />
          <Row k="status" v="building" tone="text-cyan" />
        </div>

        <ul className="flex-1 py-3">
          {NAV.map((item, i) => {
            const active = isActive(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="group relative flex items-center gap-3 px-5 py-[9px] text-[10.5px] tracking-[0.2em]"
                >
                  {/* Active/hover fill — a scan bar, not a generic highlight */}
                  <motion.span
                    aria-hidden
                    className="absolute inset-y-0 left-0 -z-10 bg-violet/10"
                    initial={false}
                    animate={{ width: active ? "100%" : "0%" }}
                    transition={{ duration: DUR.base, ease: EASE.outExpo }}
                  />
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 -z-10 w-0 bg-bright/[0.04] transition-[width] duration-300 ease-[var(--ease-out-expo)] group-hover:w-full"
                  />
                  {/* Active edge marker */}
                  <span
                    aria-hidden
                    className={`absolute left-0 top-1/2 h-full w-px -translate-y-1/2 transition-colors duration-300 ${
                      active ? "bg-violet" : "bg-transparent"
                    }`}
                  />
                  <span
                    className={`tabular-nums transition-colors duration-200 ${
                      active ? "text-violet" : "text-faint group-hover:text-muted"
                    }`}
                  >
                    {item.index}
                  </span>
                  <span
                    className={`transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 ${
                      active ? "text-bright" : "text-muted group-hover:text-primary-text"
                    }`}
                  >
                    {item.label}
                  </span>
                  {active && (
                    <motion.span
                      layoutId="nav-dot"
                      className="ml-auto size-1 rounded-full bg-violet"
                      transition={{ duration: DUR.base, ease: EASE.outExpo }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-hairline px-5 py-4">
          <div className="mb-3 flex items-center gap-3">
            <a
              href={SITE.github}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-faint transition-colors hover:text-bright"
            >
              <Github className="size-3.5" />
            </a>
            {SITE.linkedin && (
              <a
                href={SITE.linkedin}
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="text-faint transition-colors hover:text-bright"
              >
                <Linkedin className="size-3.5" />
              </a>
            )}
            {SITE.twitter && (
              <a
                href={SITE.twitter}
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="text-faint transition-colors hover:text-bright"
              >
                <XLogo className="size-3" />
              </a>
            )}
          </div>
          <p className="text-[9px] leading-relaxed text-ghost">
            v{SITE.version}
            <br />
            {SITE.location}
          </p>
        </div>
      </nav>

      {/* ------------------------------------------------------ MOBILE BAR */}
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-hairline bg-abyss/90 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/" className="flex items-center">
          <span className="font-display text-[12px] font-bold tracking-[0.18em] text-bright">
            {SITE.handle}
          </span>
          <span className="text-[12px] text-violet">://</span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex size-8 items-center justify-center border border-hairline-lit text-muted"
        >
          {open ? <X className="size-4" /> : <Menu className="size-4" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR.fast }}
            className="fixed inset-0 z-40 bg-void/96 pt-14 backdrop-blur-xl lg:hidden"
          >
            <ul className="p-4">
              {NAV.map((item, i) => (
                <motion.li
                  key={item.href}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.045, duration: DUR.base, ease: EASE.outExpo }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className="flex items-baseline gap-4 border-b border-hairline py-4"
                  >
                    <span
                      className={`text-[11px] tabular-nums ${
                        isActive(item.href) ? "text-violet" : "text-faint"
                      }`}
                    >
                      {item.index}
                    </span>
                    <span
                      className={`font-display text-xl font-bold tracking-tight ${
                        isActive(item.href) ? "text-bright" : "text-muted"
                      }`}
                    >
                      {item.label}
                    </span>
                    <span className="ml-auto text-[9px] text-ghost">{item.blurb}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Row({ k, v, tone = "text-muted" }: { k: string; v: string; tone?: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-ghost">{k}:</span>
      <span className={tone}>{v}</span>
    </div>
  );
}
