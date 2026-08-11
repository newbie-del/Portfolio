"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Led } from "@/components/ui/Panel";

/**
 * ERROR BOUNDARY
 * ---------------------------------------------------------------------------
 * A runtime fault reported in the system's own voice, with a real recovery
 * action. No animation library here on purpose: this component has to render
 * when something else has already failed, so it depends on nothing but React.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced for whoever is debugging; never shown raw to the visitor.
    console.error(error);
  }, [error]);

  return (
    <div className="grid min-h-[calc(100dvh-3.5rem)] place-items-center px-5 py-16 sm:px-8 lg:min-h-dvh lg:px-12">
      <div className="panel corner-ticks w-full max-w-xl">
        <header className="flex items-center justify-between border-b border-hairline px-4 py-2.5">
          <span className="section-label flex items-center gap-2">
            <Led tone="rose" />
            RUNTIME FAULT
          </span>
          {error.digest && (
            <span className="text-[8.5px] tabular-nums tracking-[0.2em] text-ghost">
              {error.digest}
            </span>
          )}
        </header>

        <div className="p-6 sm:p-8">
          <h1 className="display text-[clamp(1.5rem,5vw,2.5rem)]">SOMETHING BROKE.</h1>
          <p className="mt-4 max-w-[52ch] text-[11.5px] leading-relaxed text-muted">
            A component threw while rendering this section. The rest of the site is
            unaffected — retrying usually resolves it.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button type="button" onClick={reset} className="cmd">
              RETRY RENDER
            </button>
            <Link href="/" className="cmd">
              RETURN TO INDEX
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
