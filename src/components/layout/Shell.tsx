"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

/**
 * PAGE SHELL
 * ---------------------------------------------------------------------------
 * Offsets content past the fixed rail and carries the route transition.
 * The transition is short and vertical: moving between routes should feel
 * like one system switching environments, not a slideshow.
 *
 * WHY THE MOTION HERE IS CSS AND NOT FRAMER
 * ---------------------------------------------------------------------------
 * This element wraps every route, so it is the one place where a missed
 * animation frame costs the entire page rather than one panel.
 *
 * It used to be a `motion.main` inside `<AnimatePresence mode="wait">`, keyed on
 * pathname, with `exit={{ opacity: 0, y: -5 }}`. In the App Router that is a
 * trap: `usePathname()` and the new `children` update in the SAME commit, so
 * AnimatePresence starts the exit animation on a DOM node that is already
 * showing the NEXT page. It drives that node to opacity 0, and when the exit
 * finishes it swaps in a child framer already considers present — so
 * `initial -> animate` never re-runs and the node stays parked at the exit
 * values. The page was fully in the DOM, at opacity 0, until a reload mounted
 * it fresh. That is the "click About, get a blank page, refresh to see it" bug.
 *
 * A CSS animation cannot fail that way. Its resting state is *visible*: if the
 * animation never runs, or is cut to 0.001ms by `prefers-reduced-motion`, the
 * content is simply there. `key={pathname}` gives a new node per route, which is
 * what replays the entrance on navigation.
 */
export function PageShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <main
      key={pathname}
      className="route-enter relative min-h-dvh pt-[53px] lg:pl-[200px] lg:pt-0"
    >
      {children}
    </main>
  );
}

/**
 * Boot curtain. Wipes up from the bottom edge on route change, with a lime
 * seam on the leading edge so the wipe has a direction you can read.
 *
 * Same reasoning as above, for a sharper reason: this is a full-screen opaque
 * black panel. Driven from JS it starts at `scaleY(1)` — which means the
 * server-rendered HTML ships with the whole viewport blacked out and stays that
 * way until hydration finishes. In CSS its base transform is `scaleY(0)`, so it
 * covers nothing at rest and only the keyframes ever raise it. There is no
 * sequence of events that can leave this thing stuck over the page.
 *
 * The key still changes in an effect rather than during render: the wipe is
 * meant to land just after the new route paints.
 */
export function TransitionCurtain() {
  const pathname = usePathname();
  const [key, setKey] = useState(pathname);

  useEffect(() => setKey(pathname), [pathname]);

  return (
    <div
      key={key}
      aria-hidden
      className="route-curtain pointer-events-none fixed inset-0 z-[60] bg-void"
    >
      <div className="absolute inset-x-0 bottom-0 h-px bg-lime/50" />
    </div>
  );
}
