"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Layers, Minimize2, Scan } from "lucide-react";
import type { Project, XRayLayer } from "@/data/projects";
import { Led } from "@/components/ui/Panel";
import { useIsMobile } from "@/components/ui/primitives";
import { DUR, EASE } from "@/lib/motion";

const XRayCanvas = dynamic(() => import("@/components/three/XRayCanvas"), {
  ssr: false,
  loading: () => (
    <div aria-hidden className="absolute inset-0 grid place-items-center bg-void">
      <span className="text-[9px] tracking-[0.2em] text-ghost">LOADING TEARDOWN...</span>
    </div>
  ),
});

const TONE_TEXT: Record<string, string> = {
  violet: "text-violet",
  cyan: "text-cyan",
  lime: "text-lime",
  amber: "text-amber",
  rose: "text-rose",
};
const TONE_BORDER: Record<string, string> = {
  violet: "border-violet/45",
  cyan: "border-cyan/45",
  lime: "border-lime/45",
  amber: "border-amber/45",
  rose: "border-rose/45",
};

/**
 * X-RAY MODE
 * ---------------------------------------------------------------------------
 * The teardown. Split authority, deliberately:
 *   - R3F owns the spatial model — slabs separate along Y, connections carry
 *     packets between adjacent layers, hover pulls a slab forward.
 *   - The DOM owns every word — layer names, node lists and descriptions are
 *     real text, so they are selectable, translatable and reachable by
 *     keyboard and screen reader.
 * Both halves read the same three pieces of state, so hovering a DOM row
 * highlights the slab and hovering a slab highlights the row.
 *
 * ENGAGE separates the system; COLLAPSE SYSTEM reverses it along the same
 * damped path. On mobile the canvas is skipped entirely and the layer list
 * stands alone — it already carries the full content.
 */
export function XRayMode({ project }: { project: Project }) {
  const layers = project.xray;
  const [open, setOpen] = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  if (!layers.length) return null;

  const active = layers.find((l) => l.id === activeId) ?? null;

  function toggle() {
    setOpen((v) => {
      if (v) {
        setHoveredId(null);
        setActiveId(null);
      }
      return !v;
    });
  }

  return (
    <section id="xray" className="mt-14 px-5 sm:px-8 lg:mt-20 lg:px-12">
      <div className="mb-5 flex flex-wrap items-center gap-3">
        <span className="section-label">X-RAY MODE</span>
        <div className="rule flex-1" />
        <span className="text-[9px] tabular-nums tracking-[0.2em] text-ghost">
          {String(layers.length).padStart(2, "0")} LAYERS
        </span>
      </div>

      <p className="mb-5 max-w-[70ch] text-[11px] leading-relaxed text-muted">
        A live teardown of {project.name}. Engage to separate the system into its layers,
        then select any layer to read what it does and which pieces make it up.
      </p>

      <div className="panel corner-ticks relative overflow-hidden">
        {/* ------------------------------------------------------ CONTROL BAR */}
        <div className="flex flex-wrap items-center gap-3 border-b border-hairline px-4 py-3">
          <button
            onClick={toggle}
            aria-pressed={open}
            className="cmd group inline-flex items-center gap-2"
          >
            {open ? <Minimize2 className="size-3" /> : <Scan className="size-3 text-violet" />}
            {open ? "COLLAPSE SYSTEM" : "ENGAGE X-RAY"}
          </button>

          <span className="flex items-center gap-2 text-[9px] tracking-[0.2em] text-faint">
            <Led tone={open ? "lime" : "violet"} />
            {open ? "SEPARATED" : "ASSEMBLED"}
          </span>

          {!isMobile && (
            <span className="ml-auto hidden items-center gap-1.5 text-[8.5px] tracking-[0.18em] text-ghost sm:flex">
              <Layers className="size-2.5" />
              MOVE POINTER TO ORBIT
            </span>
          )}
        </div>

        <div className="grid lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* --------------------------------------------------------- VIEWER */}
          {!isMobile && (
            <div className="relative aspect-[16/11] border-b border-hairline lg:aspect-auto lg:min-h-[460px] lg:border-b-0 lg:border-r">
              <span aria-hidden className="grid-backdrop absolute inset-0 opacity-40" />
              <XRayCanvas
                layers={layers}
                open={open}
                hoveredId={hoveredId}
                activeId={activeId}
                onHover={setHoveredId}
                onSelect={(id) => setActiveId((cur) => (cur === id ? null : id))}
              />
              <span
                aria-hidden
                className="scanlines pointer-events-none absolute inset-0 opacity-25"
              />

              {/* readout of the focused layer, over the canvas */}
              <AnimatePresence>
                {active && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: DUR.base, ease: EASE.outExpo }}
                    className={`pointer-events-none absolute bottom-3 left-3 right-3 border bg-void/85 p-3 backdrop-blur-sm ${
                      TONE_BORDER[active.tone] ?? "border-hairline-lit"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-[9px] tracking-[0.2em]">
                      <span className={TONE_TEXT[active.tone] ?? "text-violet"}>
                        {active.label}
                      </span>
                      <span className="text-ghost">/</span>
                      <span className="tabular-nums text-faint">
                        {String(active.nodes.length).padStart(2, "0")} PARTS
                      </span>
                    </div>
                    <p className="mt-2 text-[10.5px] leading-relaxed text-muted">
                      {active.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* ---------------------------------------------------- LAYER STACK */}
          <ul className="divide-y divide-hairline">
            {layers.map((l, i) => (
              <LayerRow
                key={l.id}
                layer={l}
                i={i}
                total={layers.length}
                expanded={activeId === l.id}
                focused={hoveredId === l.id}
                dimmed={!!(hoveredId ?? activeId) && (hoveredId ?? activeId) !== l.id}
                showDetail={isMobile || activeId === l.id}
                onHover={setHoveredId}
                onSelect={() =>
                  setActiveId((cur) => {
                    const nextId = cur === l.id ? null : l.id;
                    if (nextId && !open) setOpen(true);
                    return nextId;
                  })
                }
              />
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function LayerRow({
  layer,
  i,
  total,
  expanded,
  focused,
  dimmed,
  showDetail,
  onHover,
  onSelect,
}: {
  layer: XRayLayer;
  i: number;
  total: number;
  expanded: boolean;
  focused: boolean;
  dimmed: boolean;
  showDetail: boolean;
  onHover: (id: string | null) => void;
  onSelect: () => void;
}) {
  const tone = TONE_TEXT[layer.tone] ?? "text-violet";

  return (
    <li>
      <button
        onClick={onSelect}
        onPointerEnter={() => onHover(layer.id)}
        onPointerLeave={() => onHover(null)}
        onFocus={() => onHover(layer.id)}
        onBlur={() => onHover(null)}
        aria-expanded={expanded}
        className={`group relative w-full px-4 py-3.5 text-left transition-opacity duration-300 ${
          dimmed ? "opacity-45" : "opacity-100"
        }`}
      >
        {/* focus/active edge marker */}
        <span
          aria-hidden
          className={`absolute inset-y-0 left-0 w-px transition-colors duration-300 ${
            expanded || focused ? "bg-current" : "bg-transparent"
          } ${tone}`}
        />
        <span
          aria-hidden
          className="absolute inset-0 -z-10 w-0 bg-bright/[0.03] transition-[width] duration-300 ease-[var(--ease-out-expo)] group-hover:w-full"
        />

        <span className="flex items-center gap-2.5">
          <span className="font-display text-[9px] font-bold tabular-nums text-ghost">
            {String(i + 1).padStart(2, "0")}
          </span>
          <span
            className={`text-[10px] tracking-[0.18em] transition-colors duration-300 ${
              expanded || focused ? tone : "text-muted"
            }`}
          >
            {layer.label}
          </span>
          <span className="ml-auto text-[8.5px] tabular-nums text-ghost">
            {String(layer.nodes.length).padStart(2, "0")}
          </span>
        </span>

        <span className="mt-2 flex flex-wrap gap-1">
          {layer.nodes.map((n) => (
            <span key={n} className="chip">
              {n}
            </span>
          ))}
        </span>

        {/* Detail is always in the DOM on mobile; on desktop it opens on select
            so the canvas readout and this row do not repeat the same text. */}
        <AnimatePresence initial={false}>
          {showDetail && (
            <motion.span
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: DUR.base, ease: EASE.outExpo }}
              className="block overflow-hidden"
            >
              <span className="mt-2.5 block text-[10.5px] leading-relaxed text-muted">
                {layer.detail}
              </span>
            </motion.span>
          )}
        </AnimatePresence>

        {i < total - 1 && (
          <span aria-hidden className="mt-3 block h-px w-full bg-transparent" />
        )}
      </button>
    </li>
  );
}
