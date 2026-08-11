"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, ArrowUpRight, Github, Radio } from "lucide-react";
import type { Project } from "@/data/projects";
import { Led, SectionHeading } from "@/components/ui/Panel";
import { XRayMode } from "@/components/work/XRayMode";
import { DUR, EASE, inView, stagger } from "@/lib/motion";

const rise = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.outExpo } },
};

/**
 * ProjectDetail
 * ---------------------------------------------------------------------------
 * The teardown page body. Reads a Project record and renders it in the order
 * the reference frame establishes: identity plate, then the shot, then the
 * reasoning (problem -> solution), then the parts list (features + stack).
 *
 * The X-Ray teardown mounts below this in PHASE 7; the layer data is already
 * present on the record, so this page links down to it rather than duplicating
 * any of it here.
 */
export function ProjectDetail({
  project,
  prev,
  next,
}: {
  project: Project;
  prev?: Project;
  next?: Project;
}) {
  return (
    <div className="pb-24 lg:pb-32">
      {/* ============================================================= HEADER */}
      <section className="px-5 pt-8 sm:px-8 lg:px-12 lg:pt-14">
        <Link
          href="/work"
          className="group inline-flex items-center gap-2 text-[9px] tracking-[0.2em] text-faint transition-colors duration-300 hover:text-violet"
        >
          <ArrowLeft className="size-3 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-x-0.5" />
          BACK TO ARCHIVE
        </Link>

        <SectionHeading
          index={project.index}
          sub={project.category}
          title={project.name}
          className="mt-5"
        />

        <motion.div
          variants={stagger(0.04, 0.08)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start"
        >
          <motion.div variants={rise} className="min-w-0">
            <p className="text-[13px] tracking-[0.05em] text-bright">{project.tagline}</p>

            <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[9px] tracking-[0.2em] text-faint">
              <span className="border border-hairline-lit px-2 py-1 text-violet">
                {project.category}
              </span>
              <span className="border border-hairline-lit px-2 py-1">{project.year}</span>
              {project.live ? (
                <span className="flex items-center gap-1.5 border border-lime/30 px-2 py-1 text-lime">
                  <Led tone="lime" />
                  DEPLOYED
                </span>
              ) : (
                <span className="border border-hairline-lit px-2 py-1">SOURCE AVAILABLE</span>
              )}
            </div>

            <p className="mt-5 max-w-[74ch] text-[11.5px] leading-relaxed text-muted">
              {project.description}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {project.live && (
                <a
                  href={project.live}
                  target="_blank"
                  rel="noreferrer"
                  className="cmd group inline-flex items-center gap-2"
                >
                  <Radio className="size-3 text-lime" />
                  LIVE DEMO
                  <ArrowUpRight className="size-3 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              )}
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="cmd group inline-flex items-center gap-2"
              >
                <Github className="size-3" />
                GITHUB REPO
                <ArrowUpRight className="size-3 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
            </div>
          </motion.div>

          {/* stack manifest — the full list, not the card's four chips */}
          <motion.div variants={rise} className="panel corner-ticks p-4">
            <div className="mb-3 flex items-center gap-2 text-[9px] tracking-[0.2em] text-ghost">
              <Led tone="cyan" />
              STACK MANIFEST
              <span className="ml-auto tabular-nums text-faint">
                {String(project.stack.length).padStart(2, "0")}
              </span>
            </div>
            <ul className="flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <li key={s} className="chip">
                  {s}
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </section>

      {/* =============================================================== SHOT */}
      <section className="mt-10 px-5 sm:px-8 lg:mt-14 lg:px-12">
        <motion.figure
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: DUR.slow, ease: EASE.outExpo }}
          className="panel relative aspect-[16/9] overflow-hidden"
        >
          <Image
            src={project.thumbnail}
            alt={`${project.name} interface`}
            fill
            sizes="(max-width: 1024px) 100vw, 1100px"
            priority
            className="object-cover"
          />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void/70 via-transparent to-transparent"
          />
          <span aria-hidden className="scanlines pointer-events-none absolute inset-0 opacity-30" />
        </motion.figure>
      </section>

      {/* ================================================== PROBLEM / SOLUTION */}
      <section className="mt-12 px-5 sm:px-8 lg:mt-16 lg:px-12">
        <motion.div
          variants={stagger(0.03, 0.1)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="grid gap-4 lg:grid-cols-2 lg:gap-5"
        >
          <Reason
            tone="rose"
            label="THE PROBLEM"
            body={project.problem}
            accent="border-t-rose/50"
          />
          <Reason
            tone="lime"
            label="THE SOLUTION"
            body={project.solution}
            accent="border-t-lime/50"
          />
        </motion.div>
      </section>

      {/* ============================================================ X-RAY */}
      <XRayMode project={project} />

      {/* =========================================================== FEATURES */}
      <section className="mt-12 px-5 sm:px-8 lg:mt-16 lg:px-12">
        <div className="mb-5 flex items-center gap-3">
          <span className="section-label">WHAT IT DOES</span>
          <div className="rule flex-1" />
          <span className="text-[9px] tabular-nums tracking-[0.2em] text-ghost">
            {String(project.features.length).padStart(2, "0")} CAPABILITIES
          </span>
        </div>

        <motion.ul
          variants={stagger(0.02, 0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="grid gap-3 sm:grid-cols-2"
        >
          {project.features.map((f, i) => (
            <motion.li
              key={f}
              variants={rise}
              className="group panel flex items-start gap-3 p-4 transition-colors duration-500 hover:border-hairline-hot"
            >
              <span className="mt-px font-display text-[10px] font-bold tabular-nums text-ghost transition-colors duration-300 group-hover:text-violet">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="text-[11px] leading-relaxed text-muted transition-colors duration-300 group-hover:text-primary-text">
                {f}
              </span>
            </motion.li>
          ))}
        </motion.ul>
      </section>

      {/* =========================================================== PREV/NEXT */}
      {(prev || next) && (
        <nav
          aria-label="Project navigation"
          className="mt-14 grid gap-4 border-t border-hairline px-5 pt-8 sm:px-8 lg:mt-20 lg:grid-cols-2 lg:px-12"
        >
          {prev && <Neighbour project={prev} dir="prev" />}
          {next && <Neighbour project={next} dir="next" />}
        </nav>
      )}
    </div>
  );
}

function Reason({
  tone,
  label,
  body,
  accent,
}: {
  tone: "rose" | "lime";
  label: string;
  body: string;
  accent: string;
}) {
  return (
    <motion.div variants={rise} className={`panel border-t-2 p-5 lg:p-6 ${accent}`}>
      <div className="mb-3 flex items-center gap-2 text-[9px] tracking-[0.2em] text-ghost">
        <Led tone={tone} />
        {label}
      </div>
      <p className="text-[11.5px] leading-relaxed text-muted">{body}</p>
    </motion.div>
  );
}

function Neighbour({ project, dir }: { project: Project; dir: "prev" | "next" }) {
  const isNext = dir === "next";
  return (
    <Link
      href={`/work/${project.slug}`}
      className={`panel group flex items-center gap-4 p-4 transition-colors duration-500 hover:border-hairline-hot ${
        isNext ? "lg:flex-row-reverse lg:text-right" : ""
      }`}
    >
      {isNext ? (
        <ArrowRight className="size-3.5 shrink-0 text-faint transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:text-violet" />
      ) : (
        <ArrowLeft className="size-3.5 shrink-0 text-faint transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:-translate-x-0.5 group-hover:text-violet" />
      )}
      <span className="min-w-0">
        <span className="block text-[8.5px] tracking-[0.2em] text-ghost">
          {isNext ? "NEXT" : "PREVIOUS"} / {project.index}
        </span>
        <span className="mt-1 block truncate font-display text-[13px] font-bold tracking-[0.04em] text-muted transition-colors duration-300 group-hover:text-bright">
          {project.name}
        </span>
      </span>
    </Link>
  );
}
