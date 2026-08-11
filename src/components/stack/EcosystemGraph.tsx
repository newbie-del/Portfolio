"use client";

import { ADJACENCY, GRAPH, TONE_HEX, VIEW } from "./graph-layout";

/**
 * The radial ecosystem map.
 *
 * Presentation only, and marked aria-hidden: every technology here is also a
 * real focusable button in the category grid below, which is what screen
 * readers and keyboards drive. Duplicating 35 nodes into the tab order would
 * add noise without adding reach.
 */
export function EcosystemGraph({
  focus,
  onFocus,
  onSelect,
}: {
  focus: string | null;
  onFocus: (name: string | null) => void;
  onSelect: (name: string) => void;
}) {
  const near = focus ? ADJACENCY.get(focus) : undefined;

  const isLit = (name: string) => !focus || name === focus || !!near?.has(name);

  return (
    <svg
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      aria-hidden
      className="h-full w-full select-none"
      onPointerLeave={() => onFocus(null)}
    >
      {/* category sector arcs — the grouping, stated once */}
      {GRAPH.sectors.map((s) => (
        <path
          key={s.id}
          d={s.path}
          fill="none"
          stroke={TONE_HEX[s.tone]}
          strokeWidth={1}
          opacity={focus ? 0.12 : 0.3}
          className="transition-opacity duration-500"
        />
      ))}

      {/* relationship curves, bundled through the core */}
      <g fill="none" strokeLinecap="round">
        {GRAPH.edges.map((e) => {
          const lit = !!focus && (e.a === focus || e.b === focus);
          return (
            <path
              key={`${e.a}|${e.b}`}
              d={e.path}
              stroke={lit ? "#22d3ee" : "#3d3d47"}
              strokeWidth={lit ? 1.15 : 0.6}
              opacity={focus ? (lit ? 0.75 : 0.06) : 0.22}
              className="transition-all duration-500 ease-[var(--ease-out-expo)]"
            />
          );
        })}
      </g>

      {/* nodes + radial labels */}
      {GRAPH.nodes.map((n) => {
        const lit = isLit(n.name);
        const self = n.name === focus;
        const hex = TONE_HEX[n.tone];

        return (
          <g
            key={n.name}
            className="cursor-pointer transition-opacity duration-500"
            opacity={lit ? 1 : 0.2}
            onPointerEnter={() => onFocus(n.name)}
            onClick={() => onSelect(n.name)}
          >
            {/* generous invisible hit area so the 6px node is easy to reach */}
            <circle cx={n.x} cy={n.y} r={11} fill="transparent" />

            {self && (
              <circle
                cx={n.x}
                cy={n.y}
                r={7.5}
                fill="none"
                stroke={hex}
                strokeWidth={0.9}
                opacity={0.5}
              />
            )}

            <rect
              x={n.x - 3}
              y={n.y - 3}
              width={6}
              height={6}
              fill={self ? "#f2f2f4" : hex}
              className="transition-colors duration-300"
            />

            <text
              x={n.lx}
              y={n.ly}
              fill={self ? "#f2f2f4" : lit ? "#9a9aa6" : "#5a5a66"}
              fontSize={7.6}
              letterSpacing={0.7}
              dominantBaseline="middle"
              textAnchor={n.flipped ? "end" : "start"}
              transform={`rotate(${n.flipped ? n.angle + 180 : n.angle} ${n.lx} ${n.ly})`}
              className="font-mono uppercase transition-colors duration-300"
            >
              {n.name}
            </text>
          </g>
        );
      })}

      {/* core readout — the count, or the focused node's degree */}
      <text
        x={VIEW / 2}
        y={VIEW / 2 - 5}
        textAnchor="middle"
        fill="#f2f2f4"
        fontSize={15}
        className="font-mono font-bold tabular-nums"
      >
        {focus ? String(near?.size ?? 0).padStart(2, "0") : String(GRAPH.nodes.length)}
      </text>
      <text
        x={VIEW / 2}
        y={VIEW / 2 + 10}
        textAnchor="middle"
        fill="#4a4a54"
        fontSize={6.5}
        letterSpacing={1.6}
        className="font-mono"
      >
        {focus ? "LINKED" : "TECHNOLOGIES"}
      </text>
    </svg>
  );
}
