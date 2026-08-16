"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Menu, X, Github, Mail, FileText } from "lucide-react";
import { NAV, SITE } from "@/data/site";
import { DUR, EASE } from "@/lib/motion";
import { SystemStatus } from "./SystemStatus";

/** X's mark is not in any icon library; brand logos have to be drawn. */
function XLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

/**
 * THE RAIL
 * ---------------------------------------------------------------------------
 * The fixed left column from the reference. It is the one piece of chrome
 * that persists across every route, so it carries the wordmark, the numbered
 * route table, live telemetry and the contact channels.
 *
 * Numbering (01..07) survives the usual objection to section numbers because
 * here the sequence is the information: it is a route table, and the numbers
 * are how the reference addresses its own pages.
 */
export function Rail() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Close the drawer on navigation, and on Escape.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* ==================================================== DESKTOP RAIL */}
      <div className="fixed left-0 top-0 z-40 hidden h-dvh w-[200px] flex-col border-r border-hairline bg-rail lg:flex">
        <Wordmark />

        <nav aria-label="Primary" className="flex-1 overflow-y-auto py-2">
          <ul>
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    /* py-3 rather than py-[11px]: the reference's nav pitch is
                       66.8px and this row was landing at 57. Ten pixels per item
                       over seven items is 70px of drift, which is why the rail's
                       telemetry block sat well above where the reference puts it. */
                    className="group relative flex flex-col gap-0.5 px-5 py-3"
                  >
                    {/* Active marker. In the reference this is a short 2px bar
                        INSET 8px from the rail edge, and there is no background
                        fill behind the active item at all — I had a filled panel
                        there, which made the current route read as a selected
                        table row rather than as a marked position.

                        Hover keeps its wash; that is feedback, not state. */}
                    <span
                      aria-hidden
                      className={`absolute inset-y-[2px] left-2 w-[2px] transition-colors duration-[--dur-base] ease-[--ease-out] ${
                        active ? "bg-lime" : "bg-transparent group-hover:bg-hairline-hot"
                      }`}
                    />
                    <span
                      aria-hidden
                      className="pointer-events-none absolute inset-0 -z-10 bg-bright/[0.03] opacity-0 transition-opacity duration-[--dur-base] ease-[--ease-out] group-hover:opacity-100"
                    />

                    <span className="flex items-baseline gap-3">
                      <span
                        className={`t-num text-[11px] transition-colors duration-[--dur-fast] ease-[--ease-out] ${
                          active ? "text-lime" : "text-ghost group-hover:text-faint"
                        }`}
                      >
                        {item.index}
                      </span>
                      <span
                        /* 15px at 0.06em. The reference's nav labels carry an
                           11px cap height, which is a ~15.7px face — 11.5px at
                           0.14em was both too small and too tracked, and the
                           tracking is what made "PLAYGROUND" the widest thing in
                           the rail. */
                        className={`font-mono text-[15px] tracking-[0.06em] transition-colors duration-[--dur-fast] ease-[--ease-out] ${
                          active
                            ? "text-bright"
                            : "text-muted group-hover:text-primary-text"
                        }`}
                      >
                        {item.label}
                      </span>
                    </span>
                    {/* Sublabel is prose, not telemetry, so it is set in the
                        sans. That single switch is what stops the rail from
                        reading as one undifferentiated block of monospace. */}
                    <span className="pl-[30px] text-[11px] leading-tight text-faint">
                      {item.blurb}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-hairline">
          <SystemStatus />
        </div>

        <div className="border-t border-hairline px-5 py-4">
          <Channels />
          <p className="mt-4 text-[10.5px] leading-relaxed text-ghost">
            © {new Date().getFullYear()} {SITE.wordmark.stem}
            {SITE.wordmark.dot}
            {SITE.wordmark.tail}
            <br />
            All rights reserved
          </p>
        </div>
      </div>

      {/* ====================================================== MOBILE BAR */}
      <div className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-hairline bg-rail/95 px-4 py-3 backdrop-blur-xl lg:hidden">
        <Link href="/" className="font-mono text-[13px] tracking-[0.06em]">
          <span className="text-lime">&gt; </span>
          <span className="text-bright">{SITE.wordmark.stem}</span>
          <span className="text-lime">
            {SITE.wordmark.dot}
            {SITE.wordmark.tail}
          </span>
        </Link>
        <button
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="flex size-9 items-center justify-center border border-hairline-lit text-muted transition-transform duration-[--dur-press] ease-[--ease-out] active:scale-[0.94]"
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
            transition={{ duration: DUR.fast, ease: EASE.out }}
            className="fixed inset-0 z-40 overflow-y-auto bg-void/97 pt-14 backdrop-blur-xl lg:hidden"
          >
            <nav aria-label="Primary">
              <ul className="px-4 py-2">
                {NAV.map((item, i) => (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.03 + i * 0.035,
                      duration: DUR.base,
                      ease: EASE.out,
                    }}
                  >
                    <Link
                      href={item.href}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className="flex items-baseline gap-4 border-b border-hairline py-4"
                    >
                      <span
                        className={`t-num text-[11px] ${
                          isActive(item.href) ? "text-lime" : "text-ghost"
                        }`}
                      >
                        {item.index}
                      </span>
                      <span className="min-w-0">
                        <span
                          className={`block font-mono text-[15px] tracking-[0.1em] ${
                            isActive(item.href) ? "text-bright" : "text-muted"
                          }`}
                        >
                          {item.label}
                        </span>
                        <span className="text-[12px] text-faint">{item.blurb}</span>
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>
            <div className="px-4 py-5">
              <Channels />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function Wordmark() {
  return (
    <Link
      href="/"
      className="group block border-b border-hairline px-5 pb-4 pt-5"
      aria-label={`${SITE.name}, home`}
    >
      <span className="block font-mono text-[15px] tracking-[0.04em]">
        <span className="text-lime">&gt; </span>
        <span className="text-bright">{SITE.wordmark.stem}</span>
        <span className="text-lime">
          {SITE.wordmark.dot}
          {SITE.wordmark.tail}
        </span>
      </span>
      <span className="mt-1 block text-[11px] text-faint">{SITE.role}</span>
    </Link>
  );
}

/**
 * Contact channels. Each is rendered only if its value exists, so nothing
 * ships as a dead link. LinkedIn is absent by the owner's decision, not by
 * omission.
 */
function Channels() {
  const items = [
    { key: "github", href: SITE.github, label: "GitHub", icon: Github },
    ...(SITE.twitter
      ? [{ key: "x", href: SITE.twitter, label: "X", icon: XLogo }]
      : []),
    { key: "email", href: `mailto:${SITE.email}`, label: "Email", icon: Mail },
    { key: "resume", href: SITE.resume, label: "Resume", icon: FileText },
  ];

  return (
    <ul className="flex items-center gap-4">
      {items.map(({ key, href, label, icon: Icon }) => {
        const external = href.startsWith("http");
        return (
          <li key={key}>
            <a
              href={href}
              aria-label={label}
              {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
              className="block text-faint transition-colors duration-[--dur-fast] ease-[--ease-out] hover:text-lime"
            >
              <Icon className="size-4" />
            </a>
          </li>
        );
      })}
    </ul>
  );
}
