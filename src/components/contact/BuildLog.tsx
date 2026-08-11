"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { TerminalSquare } from "lucide-react";
import { SITE } from "@/data/site";

/**
 * BUILD LOG — SIMULATED GIT ACTIVITY
 * ---------------------------------------------------------------------------
 * The spec: "The terminal on the side should show simulated Git activity."
 * The spec's own word is *simulated*, so that is exactly what this is: a
 * stream shaped like `git log --oneline`, generated on the client. It says so
 * in the panel header and again in the log footer, and it never presents real
 * commit hashes, dates or repository state.
 *
 * The only genuinely live value is the clock. Under prefers-reduced-motion the
 * log renders complete and static, with no write head and no repaint.
 */

type LineKind = "commit" | "note";

interface Line {
  kind: LineKind;
  text: string;
}

const COLOR: Record<LineKind, string> = {
  commit: "text-muted",
  note: "text-faint",
};

/**
 * Deterministic short id for a *displayed* line. Not a SHA, and deliberately
 * dot-grouped so it can never be mistaken for one.
 */
function lineId(n: number): string {
  let x = (n + 90210) >>> 0;
  let s = "";
  for (let i = 0; i < 6; i++) {
    x = (x * 1664525 + 1013904223) >>> 0;
    s += "0123456789abcdef"[x % 16];
  }
  return s;
}

const SUBJECTS = [
  "feat: wire the pipeline readout",
  "fix: restore focus ring contrast",
  "docs: note the reduced-motion path",
  "feat: build status panel",
  "fix: overflow at 48em",
  "refactor: fold duplicate easing",
  "chore: tune motion tokens",
  "feat: animated terminal boot",
];

function buildLog(step: number): Line[] {
  const rows: Line[] = SUBJECTS.map((subject, i) => ({
    kind: "commit" as const,
    text: `${lineId(step - i)} ${subject}`,
  }));
  rows.push({ kind: "note", text: `-- ${SUBJECTS.length} entries, all simulated --` });
  return rows;
}

export function BuildLog({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [clock, setClock] = useState("--:--:--");

  // The clock ticks regardless; the log only re-generates when motion is
  // allowed, so reduced-motion visitors get one stable render.
  useEffect(() => {
    const tick = () => {
      setClock(
        new Date().toLocaleTimeString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Kolkata",
        }),
      );
      if (!reduce) setStep((s) => s + 1);
    };
    tick();
    const id = setInterval(tick, 2600);
    return () => clearInterval(id);
  }, [reduce]);

  const log = buildLog(step);
  const headIndex = log.length - 2;
  const bodyRef = useRef<HTMLDivElement>(null);

  return (
    <div className={`panel corner-ticks overflow-hidden ${className}`}>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
        <span className="section-label flex items-center gap-2">
          <TerminalSquare className="size-3 text-cyan" />
          BUILD LOG
        </span>
        <span className="flex items-center gap-2.5 text-[8.5px] tracking-[0.2em] text-faint">
          <span className="text-ghost">SIMULATED</span>
          <span className="tabular-nums text-muted">{clock} IST</span>
        </span>
      </header>

      <div className="p-4">
        <p className="text-[9.5px] tracking-[0.08em] text-faint">
          <span className="text-lime">$</span> git log --oneline -{SUBJECTS.length}
        </p>

        <div
          ref={bodyRef}
          className="mt-2 space-y-[3px] text-[9.5px] leading-[1.7] tracking-[0.06em] tabular-nums"
        >
          {log.map((line, i) => (
            <p
              key={line.text}
              className={`truncate ${COLOR[line.kind]} ${
                i === 0 ? "text-bright" : ""
              }`}
            >
              {line.text}
              {!reduce && i === headIndex && <i className="caret ml-1 align-middle" />}
            </p>
          ))}
        </div>

        <p className="mt-3 border-t border-hairline pt-2 text-[8px] tracking-[0.18em] text-ghost">
          GENERATED ON THIS PAGE · NOT A LIVE REPOSITORY ·{" "}
          <a href={SITE.github} className="text-faint underline decoration-hairline-lit hover:text-cyan">
            REAL COMMITS LIVE ON GITHUB
          </a>
        </p>
      </div>
    </div>
  );
}
