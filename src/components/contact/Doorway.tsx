"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";

/**
 * DOORWAY — the CONTACT environment
 * ---------------------------------------------------------------------------
 * The spec asks for a doorway visual with "subtle animation ... server LEDs
 * blinking / small ambient light movement / terminal activity" so the page
 * reads as "a living developer workspace".
 *
 * So: a lit threshold at the end of a dark corridor, a rack of blinking status
 * LEDs to one side, and a small terminal panel repainting itself. Nothing
 * spins, nothing floats. The only motion is light — which is the one thing a
 * doorway plausibly does on its own.
 *
 * Every animated element checks `reduced` and settles to a composed still
 * frame instead of freezing mid-transition.
 */

/* ----------------------------------------------------------- TERMINAL TEXTURE */

function createTerminal(): { texture: THREE.CanvasTexture; paint: (t: number) => void } {
  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 160;
  const ctx = canvas.getContext("2d")!;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;

  const lines = [
    "$ whoami",
    "  abhishek",
    "$ status --contact",
    "  ✓ inbox   open",
    "  ✓ github  open",
    "$ _",
  ];

  const paint = (t: number) => {
    ctx.fillStyle = "#06060a";
    ctx.fillRect(0, 0, 256, 160);
    ctx.font = "11px monospace";
    ctx.textBaseline = "top";

    const revealed = Math.floor((t * 0.9) % (lines.length + 4));
    for (let i = 0; i < Math.min(revealed, lines.length); i++) {
      const line = lines[i];
      ctx.fillStyle = line.startsWith("$") ? "#a3e635" : line.includes("✓") ? "#22d3ee" : "#7c7c88";
      ctx.globalAlpha = 0.92;
      ctx.fillText(line, 12, 14 + i * 18);
    }
    ctx.globalAlpha = 1;

    if (Math.floor(t * 2) % 2 === 0) {
      ctx.fillStyle = "#a3e635";
      ctx.fillRect(12, 14 + Math.min(revealed, lines.length) * 18, 6, 10);
    }

    ctx.fillStyle = "rgba(0,0,0,0.32)";
    for (let y = 0; y < 160; y += 3) ctx.fillRect(0, y, 256, 1);

    texture.needsUpdate = true;
  };

  paint(0);
  return { texture, paint };
}

function TerminalPanel({ reduced }: { reduced: boolean }) {
  const screen = useMemo(createTerminal, []);
  const last = useRef(0);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    if (t - last.current > 1 / 10) {
      screen.paint(t);
      last.current = t;
    }
  });

  return (
    <group position={[1.62, 0.12, -1.4]} rotation={[0, -0.55, 0]}>
      <mesh>
        <planeGeometry args={[0.92, 0.58]} />
        <meshBasicMaterial map={screen.texture} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 0, 0.4]} color="#a3e635" intensity={0.9} distance={2.2} decay={2} />
    </group>
  );
}

/* --------------------------------------------------------------- SERVER RACK */

function Rack({ reduced }: { reduced: boolean }) {
  const leds = useRef<(THREE.Mesh | null)[]>([]);
  const tones = ["#a3e635", "#22d3ee", "#a855f7", "#fbbf24", "#a3e635", "#22d3ee"];

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    leds.current.forEach((m, i) => {
      if (!m) return;
      const mat = m.material as THREE.MeshBasicMaterial;
      // Each LED on its own irregular period — a rack never pulses in unison.
      const on = Math.sin(t * (1.7 + i * 0.63) + i * 1.9) > 0.15;
      mat.opacity = on ? 0.95 : 0.14;
    });
  });

  return (
    <group position={[-1.72, -0.16, -1.5]} rotation={[0, 0.5, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.5, 1.5, 0.42]} />
        <meshStandardMaterial color="#0a0a0d" roughness={0.62} metalness={0.5} />
      </mesh>
      {tones.map((c, i) => (
        <mesh
          key={i}
          ref={(el) => {
            leds.current[i] = el;
          }}
          position={[0.252, 0.56 - i * 0.17, 0.1]}
          rotation={[0, Math.PI / 2, 0]}
        >
          <circleGeometry args={[0.018, 10]} />
          <meshBasicMaterial color={c} transparent opacity={0.8} toneMapped={false} />
        </mesh>
      ))}
      {/* rack vents — pure geometry, reads as hardware at a glance */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={`v${i}`} position={[0.252, 0.5 - i * 0.17, -0.09]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.22, 0.02]} />
          <meshBasicMaterial color="#16161c" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/* -------------------------------------------------------------- THE DOORWAY */

function Threshold({ reduced }: { reduced: boolean }) {
  const glow = useRef<THREE.Mesh>(null);
  const spill = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    // Ambient light movement: the doorway breathes, it does not flicker.
    const b = 0.86 + Math.sin(t * 0.55) * 0.09 + Math.sin(t * 1.9) * 0.02;
    if (glow.current) (glow.current.material as THREE.MeshBasicMaterial).opacity = b;
    if (spill.current) spill.current.intensity = 3.1 + Math.sin(t * 0.55) * 0.7;
  });

  return (
    <group position={[0, 0, -2.2]}>
      {/* wall the door is cut into */}
      <mesh position={[0, 0.4, -0.06]}>
        <planeGeometry args={[9, 6]} />
        <meshStandardMaterial color="#07070a" roughness={1} />
      </mesh>

      {/* frame */}
      <mesh position={[-0.63, 0, 0]}>
        <boxGeometry args={[0.07, 2.5, 0.12]} />
        <meshStandardMaterial color="#101015" roughness={0.5} metalness={0.55} />
      </mesh>
      <mesh position={[0.63, 0, 0]}>
        <boxGeometry args={[0.07, 2.5, 0.12]} />
        <meshStandardMaterial color="#101015" roughness={0.5} metalness={0.55} />
      </mesh>
      <mesh position={[0, 1.26, 0]}>
        <boxGeometry args={[1.33, 0.07, 0.12]} />
        <meshStandardMaterial color="#101015" roughness={0.5} metalness={0.55} />
      </mesh>

      {/* the opening — an emissive plane, so the light comes from the door */}
      <mesh ref={glow}>
        <planeGeometry args={[1.2, 2.44]} />
        <meshBasicMaterial color="#7c5cff" transparent opacity={0.9} toneMapped={false} />
      </mesh>
      {/* hot core, narrower, sells depth beyond the threshold */}
      <mesh position={[0, -0.1, 0.01]}>
        <planeGeometry args={[0.62, 2.1]} />
        <meshBasicMaterial color="#d8ccff" transparent opacity={0.55} toneMapped={false} />
      </mesh>

      <pointLight
        ref={spill}
        position={[0, 0, 0.8]}
        color="#a855f7"
        intensity={3.2}
        distance={7.5}
        decay={2}
      />
    </group>
  );
}

/* -------------------------------------------------------------- CAMERA RIG */

function Rig({ reduced }: { reduced: boolean }) {
  useFrame(({ camera, pointer, clock }, delta) => {
    if (reduced) {
      camera.position.set(0, 0.1, 3.6);
      camera.lookAt(0, 0, -2.2);
      return;
    }
    // A slow push toward the threshold, plus damped pointer parallax.
    const drift = Math.sin(clock.elapsedTime * 0.18) * 0.05;
    const tx = pointer.x * 0.34 + drift;
    const ty = pointer.y * 0.16;
    const k = 1 - Math.pow(0.0012, Math.min(delta, 1 / 30));
    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (0.1 + ty - camera.position.y) * k;
    camera.lookAt(0, 0, -2.2);
  });
  return null;
}

/* ------------------------------------------------------------------- SCENE */

export function DoorwayContents({ reduced = false }: { reduced?: boolean }) {
  return (
    <>
      <fog attach="fog" args={["#030304", 3.2, 9]} />
      <ambientLight intensity={0.1} />
      <directionalLight position={[-3, 3, 2]} intensity={0.18} color="#7dd3fc" />

      {/* floor catching the doorway spill */}
      <mesh position={[0, -1.25, -0.4]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color="#050507" roughness={0.86} metalness={0.2} />
      </mesh>

      <Threshold reduced={reduced} />
      <Rack reduced={reduced} />
      <TerminalPanel reduced={reduced} />
      <Rig reduced={reduced} />
    </>
  );
}
