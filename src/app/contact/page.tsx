"use client";

import { useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Copy,
  FileText,
  Github,
  Mail,
  MapPin,
  Phone,
  Rocket,
  Terminal,
} from "lucide-react";
import { CHANNELS, PIPELINE, SHIPPED_COUNT, type Channel } from "@/data/contact";
import { SITE } from "@/data/site";
import { BuildLog } from "@/components/contact/BuildLog";
import { Led, SectionHeading } from "@/components/ui/Panel";
import { DUR, EASE, inView, stagger } from "@/lib/motion";

const DoorwayScene = dynamic(() => import("@/components/contact/DoorwayScene"), {
  ssr: false,
});

const rise = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: DUR.slow, ease: EASE.outExpo } },
};

const ICON: Record<Channel["icon"], typeof Mail> = {
  mail: Mail,
  phone: Phone,
  github: Github,
  x: ArrowUpRight,
  map: MapPin,
  file: FileText,
};

const TONE_TEXT: Record<Channel["tone"], string> = {
  violet: "text-violet",
  cyan: "text-cyan",
  lime: "text-lime",
  amber: "text-amber",
  rose: "text-rose",
};

const TONE_BORDER: Record<Channel["tone"], string> = {
  violet: "hover:border-violet/50",
  cyan: "hover:border-cyan/50",
  lime: "hover:border-lime/50",
  amber: "hover:border-amber/50",
  rose: "hover:border-rose/50",
};

/**
 * 07_CONTACT — THE DOORWAY
 * ---------------------------------------------------------------------------
 * "Contact information should remain clear and readable" — so the channels are
 * plain text at a real reading size, selectable and copyable, never hidden
 * behind an effect. The 3D doorway sits behind the header as environment, not
 * as an obstacle: it is dynamically imported, disabled on mobile, and has a
 * CSS reconstruction underneath it.
 *
 * The pipeline states are derived in `data/contact.ts` from evidence that
 * already exists (a live URL, a public repository). No IN PROGRESS or PLANNED
 * status is shown, because nothing in the data proves one — inventing build
 * statuses is exactly what the content rule forbids.
 */
export default function ContactPage() {
  return (
    <div className="pb-24 lg:pb-32">
      {/* ============================================================ DOORWAY */}
      <section className="relative px-5 pt-8 sm:px-8 lg:px-12 lg:pt-14">
        <div className="relative isolate overflow-hidden border border-hairline bg-abyss">
          <div className="absolute inset-0" aria-hidden>
            <DoorwayScene />
            {/* Legibility floor — the copy must win over the environment. */}
            <div className="absolute inset-0 bg-gradient-to-r from-void via-void/80 to-void/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/60" />
          </div>

          <div className="relative px-5 py-12 sm:px-8 sm:py-16 lg:px-10 lg:py-20">
            <SectionHeading index="07" sub="CONTACT" title="LET'S BUILD" />

            <motion.div
              variants={stagger(0.06, 0.08)}
              initial="hidden"
              whileInView="visible"
              viewport={inView}
              className="mt-6 max-w-[54ch]"
            >
              <motion.p variants={rise} className="text-[13px] leading-relaxed text-primary-text">
                The door is open. If you have a product to build, a role to fill, or a
                problem that needs someone who will actually read the docs — say hello.
              </motion.p>
              <motion.p variants={rise} className="mt-3 text-[11.5px] leading-relaxed text-muted">
                I reply to everything. Usually the same day, always within two.
              </motion.p>

              <motion.div variants={rise} className="mt-6 flex flex-wrap items-center gap-3">
                <a href={`mailto:${SITE.email}`} className="cmd group">
                  <Mail className="size-3" />
                  START A CONVERSATION
                  <ArrowUpRight className="size-3 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
                <a href={SITE.resume} className="cmd group" download>
                  <FileText className="size-3" />
                  RESUME
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* =========================================================== CHANNELS */}
      <section className="mt-8 px-5 sm:px-8 lg:mt-10 lg:px-12">
        <div className="mb-5 flex items-center gap-3">
          <span className="section-label">DIRECT LINES</span>
          <div className="rule flex-1" />
          <span className="text-[8.5px] tabular-nums tracking-[0.2em] text-ghost">
            {String(CHANNELS.length).padStart(2, "0")} OPEN
          </span>
        </div>

        <motion.ul
          variants={stagger(0.04, 0.06)}
          initial="hidden"
          whileInView="visible"
          viewport={inView}
          className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CHANNELS.map((c) => (
            <ChannelCard key={c.id} channel={c} />
          ))}
        </motion.ul>
      </section>

      {/* ======================================= PIPELINE + BUILD LOG ======= */}
      <section className="mt-10 grid gap-4 px-5 sm:px-8 lg:px-12 xl:grid-cols-[minmax(0,1fr)_380px]">
        {/* ---------------------------------------------------------- STATUS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: DUR.slow, ease: EASE.outExpo }}
          className="panel corner-ticks min-w-0 overflow-hidden"
        >
          <header className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline px-4 py-2.5">
            <span className="section-label flex items-center gap-2">
              <Rocket className="size-3 text-violet" />
              BUILD STATUS
            </span>
            <span className="flex items-center gap-2 text-[8.5px] tracking-[0.2em] text-ghost">
              <Led tone="lime" />
              <span className="text-lime">{SHIPPED_COUNT} DEPLOYED</span>
              <span className="text-faint">/ {PIPELINE.length} TOTAL</span>
            </span>
          </header>

          <div className="p-4">
            <p className="mb-4 max-w-[68ch] text-[10.5px] leading-relaxed text-faint">
              Status is derived from what can be checked, not declared: a reachable
              deployment reads DEPLOYED, a public repository reads SOURCE. Anything
              in progress stays off this board until it is real.
            </p>

            <ul className="divide-y divide-hairline">
              {PIPELINE.map((row) => {
                const shipped = row.state === "SHIPPED";
                return (
                  <li key={row.slug}>
                    <Link
                      href={row.href}
                      className="group flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2.5 transition-colors duration-300"
                    >
                      <span className="font-display text-[9px] font-bold tabular-nums text-ghost">
                        {row.index}
                      </span>
                      <span className="min-w-0 flex-1 text-[11px] tracking-[0.08em] text-muted transition-colors duration-300 group-hover:text-bright">
                        {row.name}
                      </span>
                      <span className="hidden text-[9px] tracking-[0.14em] text-faint sm:inline">
                        {row.category}
                      </span>
                      <span className="text-[9px] tabular-nums text-ghost">{row.year}</span>
                      <span
                        className={`inline-flex items-center gap-1.5 border px-2 py-0.5 text-[8.5px] tracking-[0.18em] ${
                          shipped
                            ? "border-lime/40 text-lime"
                            : "border-hairline-lit text-faint"
                        }`}
                      >
                        <span
                          className={`inline-block size-[4px] rounded-full ${
                            shipped ? "bg-lime" : "bg-faint"
                          }`}
                        />
                        {shipped ? "DEPLOYED" : "SOURCE"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </motion.div>

        {/* -------------------------------------------------------- BUILD LOG */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: DUR.slow, ease: EASE.outExpo, delay: 0.06 }}
          className="min-w-0"
        >
          <BuildLog />

          <div className="panel mt-3 px-4 py-3">
            <div className="flex items-center gap-2 text-[8.5px] tracking-[0.2em] text-ghost">
              <Terminal className="size-3 text-lime" />
              WHAT I WANT NEXT
            </div>
            <p className="mt-2.5 text-[10.5px] leading-relaxed text-muted">
              A team where the code review is honest and the product actually
              ships. Full-stack or AI-adjacent. Remote, or Maharashtra.
            </p>
          </div>
        </motion.div>
      </section>

      {/* ================================================================ CTA */}
      <section className="mt-10 px-5 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={inView}
          transition={{ duration: DUR.slow, ease: EASE.outExpo }}
          className="panel corner-ticks relative overflow-hidden p-6 sm:p-8"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-violet/[0.07] blur-3xl"
          />
          <p className="section-label mb-3 text-violet">END OF LINE</p>
          <h2 className="display max-w-[20ch] text-[clamp(1.5rem,4vw,2.5rem)]">
            THANKS FOR SCROLLING THIS FAR.
          </h2>
          <p className="mt-4 max-w-[56ch] text-[12px] leading-relaxed text-muted">
            Most people bounce at the hero. You read the whole system — the work,
            the stack, the timeline, the experiments. That is genuinely the
            audience I built this for.
          </p>
          <p className="mt-3 max-w-[56ch] text-[12px] leading-relaxed text-primary-text">
            So: what are you building?
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a href={`mailto:${SITE.email}`} className="cmd group">
              <Mail className="size-3" />
              {SITE.email}
              <ArrowUpRight className="size-3 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
            <Link href="/" className="cmd group">
              BACK TO INDEX
            </Link>
          </div>

          <p className="mt-6 border-t border-hairline pt-4 text-[8.5px] tracking-[0.2em] text-ghost">
            {SITE.handle} · V{SITE.version} · {SITE.location.toUpperCase()}
          </p>
        </motion.div>
      </section>
    </div>
  );
}

/* ========================================================== CHANNEL CARD === */

function ChannelCard({ channel }: { channel: Channel }) {
  const [copied, setCopied] = useState(false);
  const Icon = ICON[channel.icon];
  const external = channel.href.startsWith("http");

  async function copy() {
    if (!channel.copy) return;
    try {
      await navigator.clipboard.writeText(channel.copy);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard can be blocked; the value is selectable text either way.
    }
  }

  return (
    <motion.li
      variants={rise}
      className={`panel group relative flex flex-col p-4 transition-colors duration-300 ${TONE_BORDER[channel.tone]}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2">
          <Icon className={`size-3.5 ${TONE_TEXT[channel.tone]}`} />
          <span className="text-[8.5px] tracking-[0.2em] text-ghost">{channel.label}</span>
        </span>

        {channel.copy && (
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy ${channel.label.toLowerCase()}`}
            className="text-faint transition-colors duration-200 hover:text-bright focus-visible:text-bright"
          >
            {copied ? (
              <Check className="size-3 text-lime" />
            ) : (
              <Copy className="size-3" />
            )}
          </button>
        )}
      </div>

      <a
        href={channel.href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className="mt-2.5 break-all text-[12.5px] leading-snug text-bright underline decoration-transparent underline-offset-4 transition-colors duration-300 hover:decoration-hairline-hot"
      >
        {channel.value}
      </a>

      <p className="mt-2 text-[10px] leading-relaxed text-faint">{channel.note}</p>

      {copied && (
        <span className="absolute bottom-3 right-4 text-[8.5px] tracking-[0.2em] text-lime">
          COPIED
        </span>
      )}
    </motion.li>
  );
}
