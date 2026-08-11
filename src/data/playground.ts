/**
 * PLAYGROUND MANIFEST
 * ---------------------------------------------------------------------------
 * These six are live simulations that run on this page — written for the
 * playground itself, not prior projects. Nothing here claims a build date, a
 * deployment or an outcome, per "never invent content".
 *
 * `technique` states what is actually being computed, so the panel is honest
 * about the mechanism rather than describing a vibe.
 */

export interface Experiment {
  id: string;
  index: string;
  name: string;
  blurb: string;
  technique: string;
  /** What the pointer does — the page states the affordance rather than hiding it. */
  interaction: string;
  tone: "violet" | "cyan" | "lime" | "amber" | "rose";
}

export const EXPERIMENTS: Experiment[] = [
  {
    id: "flow",
    index: "01",
    name: "FLOW FIELD",
    blurb: "Particles advected through a layered trigonometric velocity field.",
    technique: "Vector field advection · trail compositing",
    interaction: "Move the pointer to add a local vortex",
    tone: "violet",
  },
  {
    id: "boids",
    index: "02",
    name: "FLOCKING",
    blurb: "Reynolds' three rules — separation, alignment, cohesion — and nothing else.",
    technique: "Boids · neighbour radius 62px · speed clamped",
    interaction: "The pointer is a predator the flock evades",
    tone: "cyan",
  },
  {
    id: "life",
    index: "03",
    name: "CELLULAR AUTOMATA",
    blurb: "Conway's Game of Life on a wrapping grid, stepped at a readable 12Hz.",
    technique: "Conway rules · toroidal topology · typed-array board",
    interaction: "Click or drag to seed live cells",
    tone: "lime",
  },
  {
    id: "gravity",
    index: "04",
    name: "GRAVITY WELLS",
    blurb: "Bodies orbiting placed masses, colour-mapped by velocity.",
    technique: "Softened inverse-square attraction · Euler integration",
    interaction: "Click to place a well (five maximum)",
    tone: "amber",
  },
  {
    id: "dissolve",
    index: "05",
    name: "TYPE DISSOLVE",
    blurb: "A word rasterised into particles that scatter and reassemble.",
    technique: "Offscreen glyph sampling · spring return · pointer repulsion",
    interaction: "Sweep the pointer through the letters",
    tone: "rose",
  },
  {
    id: "path",
    index: "06",
    name: "PATHFINDING",
    blurb: "A* crossing a walled grid, one expansion at a time so the frontier shows.",
    technique: "A* · Manhattan heuristic · animated frontier",
    interaction: "Click a cell to toggle a wall and re-solve",
    tone: "cyan",
  },
];
