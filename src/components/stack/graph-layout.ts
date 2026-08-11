import { SKILLS, type Tone } from "@/data/skills";

/**
 * ECOSYSTEM GRAPH LAYOUT
 * ---------------------------------------------------------------------------
 * A radial map with hierarchical edge bundling: every technology sits on one
 * ring, grouped into category sectors, and relationships are drawn as curves
 * pulled toward the centre so the bundle reads as a core rather than a mess of
 * chords.
 *
 * The layout is a pure function of the data — computed once, never animated.
 * Nothing in this graph moves at rest; only colour and opacity respond to
 * pointer focus.
 */

export const VIEW = 620;
const C = VIEW / 2;
const RING = 182;
/** Degrees of empty arc between category sectors. */
const SECTOR_GAP = 5;

export interface GraphNode {
  name: string;
  category: string;
  categoryLabel: string;
  tone: Tone;
  projects: string[];
  related: string[];
  angle: number;
  x: number;
  y: number;
  /** Label anchor point, just outside the ring. */
  lx: number;
  ly: number;
  /** Labels on the left half are flipped so text is never upside down. */
  flipped: boolean;
}

export interface GraphEdge {
  a: string;
  b: string;
  path: string;
}

export interface GraphSector {
  id: string;
  label: string;
  tone: Tone;
  /** Mid-angle of the sector, for the category tick. */
  angle: number;
  path: string;
}

function polar(angleDeg: number, radius: number) {
  const r = (angleDeg * Math.PI) / 180;
  return { x: C + Math.cos(r) * radius, y: C + Math.sin(r) * radius };
}

function arc(from: number, to: number, radius: number) {
  const a = polar(from, radius);
  const b = polar(to, radius);
  const large = to - from > 180 ? 1 : 0;
  return `M ${a.x.toFixed(2)} ${a.y.toFixed(2)} A ${radius} ${radius} 0 ${large} 1 ${b.x.toFixed(2)} ${b.y.toFixed(2)}`;
}

function buildLayout() {
  const total = SKILLS.reduce((n, c) => n + c.items.length, 0);
  const usable = 360 - SECTOR_GAP * SKILLS.length;
  const per = usable / total;

  const nodes: GraphNode[] = [];
  const sectors: GraphSector[] = [];

  // Start at the top and sweep clockwise.
  let cursor = -90 + SECTOR_GAP / 2;

  for (const cat of SKILLS) {
    const span = cat.items.length * per;
    const start = cursor;

    cat.items.forEach((tech, i) => {
      const angle = start + (i + 0.5) * per;
      const p = polar(angle, RING);
      const lp = polar(angle, RING + 13);
      // Normalise to 0..360 to decide which half the label sits on.
      const norm = ((angle % 360) + 360) % 360;
      const flipped = norm > 90 && norm < 270;

      nodes.push({
        name: tech.name,
        category: cat.id,
        categoryLabel: cat.label,
        tone: cat.tone,
        projects: tech.projects,
        related: tech.related ?? [],
        angle,
        x: p.x,
        y: p.y,
        lx: lp.x,
        ly: lp.y,
        flipped,
      });
    });

    sectors.push({
      id: cat.id,
      label: cat.label,
      tone: cat.tone,
      angle: start + span / 2,
      path: arc(start, start + span, RING - 14),
    });

    cursor = start + span + SECTOR_GAP;
  }

  // Relationships are symmetric, so dedupe each pair by sorted key.
  const byName = new Map(nodes.map((n) => [n.name, n]));
  const seen = new Set<string>();
  const edges: GraphEdge[] = [];

  for (const n of nodes) {
    for (const relName of n.related) {
      const m = byName.get(relName);
      if (!m) continue;
      const key = [n.name, relName].sort().join("|");
      if (seen.has(key)) continue;
      seen.add(key);

      // Bundle: pull the control point most of the way to the centre.
      const mx = (n.x + m.x) / 2;
      const my = (n.y + m.y) / 2;
      const cx = C + (mx - C) * 0.16;
      const cy = C + (my - C) * 0.16;

      edges.push({
        a: n.name,
        b: relName,
        path: `M ${n.x.toFixed(2)} ${n.y.toFixed(2)} Q ${cx.toFixed(2)} ${cy.toFixed(2)} ${m.x.toFixed(2)} ${m.y.toFixed(2)}`,
      });
    }
  }

  return { nodes, edges, sectors };
}

/** Computed once at module load — the layout never changes. */
export const GRAPH = buildLayout();

/** Adjacency for highlight logic: name -> directly related names. */
export const ADJACENCY: Map<string, Set<string>> = (() => {
  const m = new Map<string, Set<string>>();
  const add = (a: string, b: string) => {
    if (!m.has(a)) m.set(a, new Set());
    m.get(a)!.add(b);
  };
  for (const e of GRAPH.edges) {
    add(e.a, e.b);
    add(e.b, e.a);
  }
  return m;
})();

export const TONE_HEX: Record<Tone, string> = {
  violet: "#a855f7",
  cyan: "#22d3ee",
  lime: "#a3e635",
  amber: "#fbbf24",
  rose: "#fb7185",
};

export const TONE_TEXT: Record<Tone, string> = {
  violet: "text-violet",
  cyan: "text-cyan",
  lime: "text-lime",
  amber: "text-amber",
  rose: "text-rose",
};
