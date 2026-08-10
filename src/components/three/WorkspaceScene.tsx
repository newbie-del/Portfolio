"use client";

import * as THREE from "three";
import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";

/* ===========================================================================
   SCREEN TEXTURES
   ---------------------------------------------------------------------------
   Each monitor renders a live canvas texture that genuinely updates: code
   scrolls, a terminal types, a chart redraws. This is what makes the
   environment feel like a running workspace instead of a lit photograph.
   Textures repaint at ~12fps — enough to read as alive, cheap enough to be
   invisible in a frame budget.
   ========================================================================= */

type ScreenKind = "code" | "terminal" | "chart";

const PALETTE = {
  bg: "#07070a",
  dim: "#2a2a34",
  text: "#8b8b98",
  violet: "#a855f7",
  cyan: "#22d3ee",
  lime: "#a3e635",
  amber: "#fbbf24",
  white: "#e8e8ee",
};

/** Deterministic PRNG so screen content is stable across reloads. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

interface ScreenPainter {
  canvas: HTMLCanvasElement;
  texture: THREE.CanvasTexture;
  paint: (t: number) => void;
}

function createScreen(kind: ScreenKind, w: number, h: number, seed: number): ScreenPainter {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;

  const rand = rng(seed);

  // Pre-generate stable "code" so it doesn't reshuffle every repaint.
  const codeLines = Array.from({ length: 44 }, () => ({
    indent: Math.floor(rand() * 4),
    segs: Array.from({ length: 1 + Math.floor(rand() * 4) }, () => ({
      w: 12 + rand() * 62,
      c: [PALETTE.violet, PALETTE.cyan, PALETTE.lime, PALETTE.text, PALETTE.amber][
        Math.floor(rand() * 5)
      ],
    })),
  }));

  const termLines = [
    "$ npm run build",
    "▸ compiling routes...",
    "  ✓ /              1.2 kB",
    "  ✓ /work          3.4 kB",
    "  ✓ /work/[slug]   8.1 kB",
    "  ✓ /stack         2.7 kB",
    "▸ optimizing bundles",
    "  ✓ build complete in 4.2s",
    "$ git status",
    "  modified: xray-mode.tsx",
    "$ deploy --prod",
    "  ▸ uploading...",
  ];

  const bars = Array.from({ length: 22 }, () => 0.15 + rand() * 0.85);

  const paint = (t: number) => {
    ctx.fillStyle = PALETTE.bg;
    ctx.fillRect(0, 0, w, h);

    if (kind === "code") {
      const lineH = 9;
      const scroll = (t * 11) % (codeLines.length * lineH);
      ctx.save();
      ctx.translate(0, -scroll);
      for (let pass = 0; pass < 2; pass++) {
        const yOff = pass * codeLines.length * lineH;
        codeLines.forEach((line, i) => {
          const y = yOff + i * lineH + 12;
          if (y - scroll < -lineH || y - scroll > h + lineH) return;
          // gutter
          ctx.fillStyle = PALETTE.dim;
          ctx.fillRect(6, y - 4, 10, 2);
          let x = 24 + line.indent * 9;
          line.segs.forEach((s) => {
            ctx.fillStyle = s.c;
            ctx.globalAlpha = 0.75;
            ctx.fillRect(x, y - 5, s.w, 3.2);
            x += s.w + 6;
          });
        });
      }
      ctx.restore();
      ctx.globalAlpha = 1;
      // active line highlight
      ctx.fillStyle = "rgba(168,85,247,0.10)";
      ctx.fillRect(0, h * 0.45, w, lineH);
    }

    if (kind === "terminal") {
      ctx.font = "10px monospace";
      ctx.textBaseline = "top";
      const revealed = Math.floor((t * 1.6) % (termLines.length + 6));
      for (let i = 0; i < Math.min(revealed, termLines.length); i++) {
        const line = termLines[i];
        ctx.fillStyle = line.startsWith("$")
          ? PALETTE.lime
          : line.includes("✓")
            ? PALETTE.cyan
            : PALETTE.text;
        ctx.globalAlpha = 0.9;
        ctx.fillText(line, 10, 10 + i * 12);
      }
      ctx.globalAlpha = 1;
      // blinking caret at the write head
      if (Math.floor(t * 2) % 2 === 0 && revealed <= termLines.length) {
        ctx.fillStyle = PALETTE.lime;
        const y = 10 + Math.min(revealed, termLines.length) * 12;
        ctx.fillRect(10, y, 6, 9);
      }
    }

    if (kind === "chart") {
      // axis
      ctx.strokeStyle = PALETTE.dim;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(10, h - 14);
      ctx.lineTo(w - 8, h - 14);
      ctx.stroke();

      const bw = (w - 24) / bars.length;
      bars.forEach((b, i) => {
        // slow breathing so the chart reads as live telemetry
        const v = b * (0.72 + 0.28 * Math.sin(t * 1.1 + i * 0.55));
        const bh = v * (h - 30);
        const grad = ctx.createLinearGradient(0, h - 14 - bh, 0, h - 14);
        grad.addColorStop(0, PALETTE.cyan);
        grad.addColorStop(1, "rgba(34,211,238,0.12)");
        ctx.fillStyle = grad;
        ctx.globalAlpha = 0.85;
        ctx.fillRect(12 + i * bw, h - 14 - bh, bw - 2.5, bh);
      });
      ctx.globalAlpha = 1;
      ctx.fillStyle = PALETTE.violet;
      ctx.fillRect(10, 8, 30, 3);
      ctx.fillStyle = PALETTE.dim;
      ctx.fillRect(46, 8, 18, 3);
    }

    // Shared CRT scanlines — ties every screen to the same visual system.
    ctx.fillStyle = "rgba(0,0,0,0.30)";
    for (let y = 0; y < h; y += 3) ctx.fillRect(0, y, w, 1);

    texture.needsUpdate = true;
  };

  paint(0);
  return { canvas, texture, paint };
}

/* ===========================================================================
   MONITOR
   ========================================================================= */

function Monitor({
  position,
  rotation = [0, 0, 0],
  size,
  kind,
  seed,
  tone,
  reduced,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  size: [number, number];
  kind: ScreenKind;
  seed: number;
  tone: string;
  reduced: boolean;
}) {
  const screen = useMemo(
    () => createScreen(kind, kind === "code" ? 420 : 300, kind === "code" ? 260 : 190, seed),
    [kind, seed],
  );
  const matRef = useRef<THREE.MeshBasicMaterial>(null);
  const lightRef = useRef<THREE.PointLight>(null);
  const last = useRef(0);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (!reduced && t - last.current > 1 / 12) {
      screen.paint(t);
      last.current = t;
    }
    // Monitor flicker — irregular, tiny, never strobing.
    if (matRef.current) {
      const flicker =
        0.94 + Math.sin(t * 37 + seed) * 0.012 + Math.sin(t * 3.1 + seed * 2) * 0.03;
      matRef.current.opacity = reduced ? 1 : flicker;
    }
    // Screen glow spills into the room and breathes with the content.
    if (lightRef.current && !reduced) {
      lightRef.current.intensity = 1.5 + Math.sin(t * 1.7 + seed) * 0.35;
    }
  });

  const [w, h] = size;

  return (
    <group position={position} rotation={rotation}>
      {/* bezel */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[w + 0.06, h + 0.06, 0.05]} />
        <meshStandardMaterial color="#0d0d11" roughness={0.75} metalness={0.35} />
      </mesh>
      {/* emissive screen */}
      <mesh position={[0, 0, 0.031]}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial
          ref={matRef}
          map={screen.texture}
          toneMapped={false}
          transparent
        />
      </mesh>
      {/* light spill */}
      <pointLight
        ref={lightRef}
        position={[0, 0, 0.5]}
        color={tone}
        intensity={1.6}
        distance={3.6}
        decay={2}
      />
      {/* stand */}
      <mesh position={[0, -h / 2 - 0.16, -0.02]}>
        <boxGeometry args={[0.06, 0.3, 0.06]} />
        <meshStandardMaterial color="#0a0a0d" roughness={0.6} metalness={0.5} />
      </mesh>
    </group>
  );
}

/* ===========================================================================
   ROOM + DESK + EQUIPMENT
   ========================================================================= */

function Room({ reduced }: { reduced: boolean }) {
  const blindsRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    // Barely-there ambient life in the window light.
    if (blindsRef.current && !reduced) {
      blindsRef.current.position.y = Math.sin(clock.elapsedTime * 0.35) * 0.012;
    }
  });

  return (
    <group>
      {/* back wall */}
      <mesh position={[0, 1, -3.2]} receiveShadow>
        <planeGeometry args={[18, 9]} />
        <meshStandardMaterial color="#08080b" roughness={1} />
      </mesh>
      {/* floor */}
      <mesh position={[0, -1.35, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[18, 12]} />
        <meshStandardMaterial color="#050507" roughness={0.9} metalness={0.15} />
      </mesh>

      {/* window with slats — the cool rim light source behind the desk */}
      <group ref={blindsRef} position={[3.05, 1.15, -3.15]}>
        <mesh>
          <planeGeometry args={[2.5, 2.2]} />
          <meshBasicMaterial color="#0f1a2e" toneMapped={false} />
        </mesh>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={i} position={[0, 1.0 - i * 0.155, 0.01]}>
            <planeGeometry args={[2.5, 0.075]} />
            <meshBasicMaterial color="#05070c" toneMapped={false} />
          </mesh>
        ))}
      </group>
      <pointLight position={[3.0, 1.3, -2.4]} color="#3b82f6" intensity={5} distance={7} decay={2} />

      {/* desk */}
      <mesh position={[0, -0.62, -0.35]} receiveShadow castShadow>
        <boxGeometry args={[6.4, 0.07, 2.1]} />
        <meshStandardMaterial color="#0b0b0e" roughness={0.55} metalness={0.4} />
      </mesh>

      {/* keyboard */}
      <mesh position={[-0.15, -0.55, 0.32]} rotation={[-0.06, 0, 0]}>
        <boxGeometry args={[1.15, 0.03, 0.38]} />
        <meshStandardMaterial color="#0d0d12" roughness={0.5} metalness={0.3} />
      </mesh>
      {/* keyboard underglow — the small violet wash on the desk */}
      <pointLight position={[-0.15, -0.5, 0.32]} color="#a855f7" intensity={0.85} distance={1.5} decay={2} />

      {/* tower + status LEDs */}
      <group position={[-2.5, -0.95, -0.5]}>
        <mesh castShadow>
          <boxGeometry args={[0.42, 0.85, 0.9]} />
          <meshStandardMaterial color="#0a0a0d" roughness={0.6} metalness={0.5} />
        </mesh>
        <ServerLeds reduced={reduced} />
      </group>
    </group>
  );
}

/** Blinking equipment LEDs — cheap, and they sell "this machine is running". */
function ServerLeds({ reduced }: { reduced: boolean }) {
  const refs = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    refs.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshBasicMaterial;
      // Each LED on its own irregular cycle so they never pulse in unison.
      mat.opacity = 0.25 + 0.75 * (Math.sin(t * (2.1 + i * 0.9) + i * 2.3) > 0.25 ? 1 : 0.12);
    });
  });

  const colors = ["#a3e635", "#22d3ee", "#a855f7"];
  return (
    <>
      {colors.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          position={[0.212, 0.28 - i * 0.1, 0.3]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <circleGeometry args={[0.016, 8]} />
          <meshBasicMaterial color={c} transparent opacity={0.8} toneMapped={false} />
        </mesh>
      ))}
    </>
  );
}

/* ===========================================================================
   CAMERA RIG — parallax follows the pointer with real inertia
   ========================================================================= */

function Rig({ reduced }: { reduced: boolean }) {
  const target = useRef({ x: 0, y: 0 });

  useFrame(({ camera, pointer, clock }, delta) => {
    if (reduced) {
      camera.position.set(0, 0.15, 4.2);
      camera.lookAt(0, -0.1, -0.5);
      return;
    }
    // Pointer parallax + a slow breathing drift so the shot is never dead still.
    const driftX = Math.sin(clock.elapsedTime * 0.16) * 0.06;
    const driftY = Math.cos(clock.elapsedTime * 0.21) * 0.035;
    target.current.x = pointer.x * 0.42 + driftX;
    target.current.y = pointer.y * 0.2 + driftY;

    // Frame-rate independent damping.
    const k = 1 - Math.pow(0.001, delta);
    camera.position.x += (target.current.x - camera.position.x) * k;
    camera.position.y += (0.15 + target.current.y - camera.position.y) * k;
    camera.lookAt(0, -0.1, -0.5);
  });

  return null;
}

/* ===========================================================================
   SCENE
   ========================================================================= */

export function WorkspaceContents({ reduced }: { reduced: boolean }) {
  return (
    <>
      <fog attach="fog" args={["#030304", 4.5, 11]} />
      <ambientLight intensity={0.12} />
      {/* key rim from above-left, cold */}
      <directionalLight position={[-4, 4, 2]} intensity={0.25} color="#7dd3fc" />

      <Room reduced={reduced} />

      {/* main monitor */}
      <Monitor
        position={[0, 0.16, -1.1]}
        size={[2.0, 1.24]}
        kind="code"
        seed={7}
        tone="#a855f7"
        reduced={reduced}
      />
      {/* left monitor, angled inward */}
      <Monitor
        position={[-2.05, 0.06, -0.85]}
        rotation={[0, 0.42, 0]}
        size={[1.28, 0.85]}
        kind="terminal"
        seed={21}
        tone="#a3e635"
        reduced={reduced}
      />
      {/* right monitor, angled inward */}
      <Monitor
        position={[2.05, 0.06, -0.85]}
        rotation={[0, -0.42, 0]}
        size={[1.28, 0.85]}
        kind="chart"
        seed={43}
        tone="#22d3ee"
        reduced={reduced}
      />

      <Rig reduced={reduced} />
    </>
  );
}
