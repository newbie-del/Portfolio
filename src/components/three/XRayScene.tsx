"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";
import type { XRayLayer } from "@/data/projects";

/** Palette mirror of the CSS tokens — three.js cannot read CSS variables. */
const TONE: Record<string, string> = {
  violet: "#a855f7",
  cyan: "#22d3ee",
  lime: "#a3e635",
  amber: "#fbbf24",
  rose: "#fb7185",
};

const SLAB_W = 2.55;
const SLAB_D = 1.62;
const GAP = 0.62;

/**
 * Frame-rate-independent damping. `base` is the fraction of remaining
 * distance left after one second, so behaviour is identical at 30 and 144fps.
 */
function damp(current: number, target: number, base: number, dt: number) {
  return THREE.MathUtils.lerp(current, target, 1 - Math.pow(base, dt));
}

/**
 * One architectural layer, rendered as a slab.
 *
 * Collapsed: every slab sits at y = 0, so the system reads as a single solid
 * object. Engaged: slabs separate along Y into the exploded view. Position is
 * damped toward its target rather than keyframed, so interrupting the
 * transition mid-flight settles correctly instead of snapping.
 */
function Slab({
  layer,
  i,
  count,
  open,
  hovered,
  active,
  dimmed,
  onHover,
  onSelect,
}: {
  layer: XRayLayer;
  i: number;
  count: number;
  open: boolean;
  hovered: boolean;
  active: boolean;
  dimmed: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const fill = useRef<THREE.MeshBasicMaterial>(null);
  const edge = useRef<THREE.LineBasicMaterial>(null);
  const color = useMemo(() => new THREE.Color(TONE[layer.tone] ?? TONE.violet), [layer.tone]);

  // Top layer highest: index 0 sits at the top of the stack when exploded.
  const restY = useMemo(() => (count - 1) / 2 * GAP - i * GAP, [i, count]);

  // Node dots laid out in a row across the slab face.
  const nodes = useMemo(() => {
    const n = layer.nodes.length;
    return layer.nodes.map((_, k) => {
      const t = n === 1 ? 0.5 : k / (n - 1);
      return [(t - 0.5) * (SLAB_W - 0.62), 0.03, 0] as [number, number, number];
    });
  }, [layer.nodes]);

  useFrame((_, dt) => {
    const g = group.current;
    if (!g) return;

    const targetY = open ? restY : 0;
    // Hover pulls the slab toward the viewer — selection feedback, not float.
    const targetZ = open && (hovered || active) ? 0.16 : 0;
    g.position.y = damp(g.position.y, targetY, 0.0015, dt);
    g.position.z = damp(g.position.z, targetZ, 0.002, dt);

    if (fill.current) {
      const o = dimmed ? 0.05 : hovered || active ? 0.26 : 0.13;
      fill.current.opacity = damp(fill.current.opacity, o, 0.002, dt);
    }
    if (edge.current) {
      const o = dimmed ? 0.18 : hovered || active ? 1 : 0.55;
      edge.current.opacity = damp(edge.current.opacity, o, 0.002, dt);
    }
  });

  return (
    <group ref={group}>
      {/* clickable face */}
      <mesh
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(layer.id);
        }}
        onPointerOut={() => onHover(null)}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(layer.id);
        }}
      >
        <boxGeometry args={[SLAB_W, 0.045, SLAB_D]} />
        <meshBasicMaterial
          ref={fill}
          color={color}
          transparent
          opacity={0.13}
          toneMapped={false}
        />
      </mesh>

      {/* wireframe edge — the drawing, not the solid */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(SLAB_W, 0.045, SLAB_D)]} />
        <lineBasicMaterial
          ref={edge}
          color={color}
          transparent
          opacity={0.55}
          toneMapped={false}
        />
      </lineSegments>

      {/* node markers */}
      {nodes.map((p, k) => (
        <mesh key={k} position={p}>
          <boxGeometry args={[0.075, 0.075, 0.075]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={dimmed ? 0.25 : 1}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * Vertical connection between two adjacent layers, with a packet that travels
 * the span while the system is engaged. The packet is the only continuously
 * moving element in the scene, and it exists only in X-Ray mode — at rest
 * nothing animates.
 */
function Connection({
  i,
  count,
  open,
  lit,
  seed,
}: {
  i: number;
  count: number;
  open: boolean;
  lit: boolean;
  seed: number;
}) {
  const line = useRef<THREE.Mesh>(null);
  const packet = useRef<THREE.Mesh>(null);
  const lineMat = useRef<THREE.MeshBasicMaterial>(null);
  const packetMat = useRef<THREE.MeshBasicMaterial>(null);
  const t = useRef(seed);

  const topY = useMemo(() => (count - 1) / 2 * GAP - i * GAP, [i, count]);
  const botY = topY - GAP;
  const x = useMemo(() => (seed - 0.5) * (SLAB_W - 1.1), [seed]);

  useFrame((_, dt) => {
    const span = open ? GAP : 0;
    const midY = open ? (topY + botY) / 2 : 0;

    if (line.current) {
      line.current.scale.y = Math.max(damp(line.current.scale.y, span, 0.0015, dt), 0.0001);
      line.current.position.y = damp(line.current.position.y, midY, 0.0015, dt);
    }
    if (lineMat.current) {
      lineMat.current.opacity = damp(lineMat.current.opacity, open ? (lit ? 0.5 : 0.2) : 0, 0.003, dt);
    }

    if (open && packet.current && packetMat.current) {
      t.current = (t.current + dt * 0.55) % 1;
      // Ease so the packet accelerates out and settles in — mechanical travel.
      const e = t.current;
      packet.current.position.y = topY - e * GAP;
      packet.current.visible = true;
      // Fade at both ends so it emerges and arrives rather than popping.
      const fade = Math.sin(Math.PI * e);
      packetMat.current.opacity = fade * (lit ? 1 : 0.45);
    } else if (packet.current) {
      packet.current.visible = false;
    }
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh ref={line} scale={[1, 0.0001, 1]}>
        <boxGeometry args={[0.006, 1, 0.006]} />
        <meshBasicMaterial
          ref={lineMat}
          color="#22d3ee"
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>
      <mesh ref={packet} visible={false}>
        <boxGeometry args={[0.045, 0.045, 0.045]} />
        <meshBasicMaterial
          ref={packetMat}
          color="#e6f9ff"
          transparent
          opacity={0}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

/**
 * Scene rig. Tilts the stack into an isometric read and lets the pointer
 * steer it within a narrow range — enough to feel spatial, never enough to
 * lose the reading of the diagram. Reduced motion locks the rig still.
 */
function Rig({
  children,
  open,
  reduced,
}: {
  children: React.ReactNode;
  open: boolean;
  reduced: boolean;
}) {
  const g = useRef<THREE.Group>(null);
  const { pointer } = useThree();

  useFrame((_, dt) => {
    const grp = g.current;
    if (!grp) return;
    const baseX = open ? 0.34 : 0.16;
    const tx = reduced ? baseX : baseX + pointer.y * 0.12;
    const ty = reduced ? -0.38 : -0.38 + pointer.x * 0.3;
    grp.rotation.x = damp(grp.rotation.x, tx, 0.002, dt);
    grp.rotation.y = damp(grp.rotation.y, ty, 0.002, dt);
    grp.scale.setScalar(damp(grp.scale.x, open ? 1 : 1.12, 0.002, dt));
  });

  return <group ref={g}>{children}</group>;
}

export function XRayContents({
  layers,
  open,
  hoveredId,
  activeId,
  reduced,
  onHover,
  onSelect,
}: {
  layers: XRayLayer[];
  open: boolean;
  hoveredId: string | null;
  activeId: string | null;
  reduced: boolean;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  const focus = hoveredId ?? activeId;

  return (
    <Rig open={open} reduced={reduced}>
      {layers.map((l, i) => (
        <Slab
          key={l.id}
          layer={l}
          i={i}
          count={layers.length}
          open={open}
          hovered={hoveredId === l.id}
          active={activeId === l.id}
          dimmed={!!focus && focus !== l.id}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}

      {layers.slice(0, -1).map((l, i) => (
        <Connection
          key={`c-${l.id}`}
          i={i}
          count={layers.length}
          open={open}
          lit={!focus || focus === l.id || focus === layers[i + 1]?.id}
          seed={((i * 9301 + 49297) % 233280) / 233280}
        />
      ))}
    </Rig>
  );
}
