"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useMotionTemplate, useMotionValue, useSpring } from "framer-motion";
import type { PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight, Github, Radio } from "lucide-react";
import type { Project } from "@/data/projects";
import { DUR, EASE } from "@/lib/motion";

/**
 * ProjectCard
 * ---------------------------------------------------------------------------
 * The archive row from the reference frame. Hover does three things at once,
 * all mechanical rather than decorative:
 *   1. the thumbnail parallaxes against the pointer (depth, not float)
 *   2. the title shifts right and the index dims (focus transfer)
 *   3. the border lights and a scan line crosses the top edge (selection)
 *
 * The parallax is spring-damped so it settles instead of snapping, and it is
 * driven from pointer position rather than a loop — nothing animates at rest.
 */
export function ProjectCard({ project }: { project: Project }) {
  // Pointer offset in the range [-0.5, 0.5], springed for inertia.
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const sx = useSpring(px, { stiffness: 140, damping: 20, mass: 0.4 });
  const sy = useSpring(py, { stiffness: 140, damping: 20, mass: 0.4 });

  // Thumbnail drifts opposite the pointer; the frame stays put.
  const imgShift = useMotionTemplate`translate3d(${sx}px, ${sy}px, 0) scale(1.08)`;

  function onPointerMove(e: ReactPointerEvent<HTMLAnchorElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    px.set(((e.clientX - r.left) / r.width - 0.5) * -22);
    py.set(((e.clientY - r.top) / r.height - 0.5) * -14);
  }

  function onPointerLeave() {
    px.set(0);
    py.set(0);
  }

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: DUR.slow, ease: EASE.outExpo },
        },
      }}
    >
      <Link
        href={`/work/${project.slug}`}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        aria-label={`${project.name} — ${project.tagline}`}
        className="panel corner-ticks group relative grid gap-0 overflow-hidden transition-colors duration-500 ease-[var(--ease-out-expo)] hover:border-hairline-hot sm:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[380px_minmax(0,1fr)]"
      >
        {/* selection scan line across the top edge */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 z-20 h-px origin-left scale-x-0 bg-gradient-to-r from-transparent via-violet to-transparent transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-x-100"
        />

        {/* ------------------------------------------------------- THUMBNAIL */}
        <div className="relative aspect-[16/10] overflow-hidden border-b border-hairline bg-abyss sm:aspect-auto sm:border-b-0 sm:border-r">
          <motion.div className="absolute inset-0" style={{ transform: imgShift }}>
            <Image
              src={project.thumbnail}
              alt={`${project.name} interface`}
              fill
              sizes="(max-width: 640px) 100vw, 380px"
              className="object-cover opacity-70 transition-opacity duration-700 ease-[var(--ease-out-expo)] group-hover:opacity-100"
            />
          </motion.div>

          {/* grade so the thumbnail sits inside the dark system */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-void/25 to-transparent opacity-90 transition-opacity duration-700 group-hover:opacity-60"
          />
          <span aria-hidden className="scanlines pointer-events-none absolute inset-0 opacity-40" />

          {/* index plate */}
          <span className="absolute left-3 top-3 z-10 border border-hairline-lit bg-void/80 px-2 py-1 font-display text-[10px] font-bold tracking-[0.18em] text-muted transition-colors duration-500 group-hover:text-violet">
            {project.index}
          </span>

          {project.live && (
            <span className="absolute right-3 top-3 z-10 flex items-center gap-1.5 border border-lime/30 bg-void/80 px-2 py-1 text-[8.5px] tracking-[0.18em] text-lime">
              <Radio className="size-2.5" />
              LIVE
            </span>
          )}
        </div>

        {/* ------------------------------------------------------------ BODY */}
        <div className="flex min-w-0 flex-col justify-between p-5 lg:p-6">
          <div className="min-w-0">
            <div className="mb-3 flex items-center gap-2 text-[8.5px] tracking-[0.2em] text-faint">
              <span className="text-violet">{project.category}</span>
              <span className="text-ghost">/</span>
              <span>{project.year}</span>
            </div>

            <h3 className="font-display text-[clamp(1.05rem,2.4vw,1.5rem)] font-bold leading-tight tracking-[0.04em] text-bright transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:translate-x-1.5">
              {project.name}
            </h3>
            <p className="mt-1.5 text-[10.5px] tracking-[0.06em] text-muted">{project.tagline}</p>

            <p className="mt-4 line-clamp-3 text-[11px] leading-relaxed text-muted/90">
              {project.problem}
            </p>
          </div>

          <div className="mt-6">
            <div className="mb-4 flex flex-wrap gap-1.5">
              {project.chips.map((c) => (
                <span key={c} className="chip">
                  {c}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-hairline pt-4">
              <span className="flex items-center gap-1.5 text-[9px] tracking-[0.2em] text-faint transition-colors duration-300 group-hover:text-violet">
                OPEN TEARDOWN
                <ArrowUpRight className="size-2.5 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>

              <span className="flex items-center gap-3 text-faint">
                <Github className="size-3.5 transition-colors duration-300 group-hover:text-muted" />
                {project.live && (
                  <Radio className="size-3.5 transition-colors duration-300 group-hover:text-lime" />
                )}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
