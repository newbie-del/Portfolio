"use client";

import * as THREE from "three";
import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";

/* ===========================================================================
   PORTRAIT POINT CLOUD
   ---------------------------------------------------------------------------
   The portrait is not decoration and it is not a filtered <img>. The image is
   sampled on a 2D canvas, and every pixel above a luminance threshold becomes
   a real particle carrying that pixel's colour. The result reads as the photo
   at rest, and as data when disturbed.

   Interaction model — deliberately restrained, per the motion spec:
   the cursor is a repulsion field. Points pushed out of place spring back to
   their sampled home. No constant rotation, no floating, no particle storm.
   ========================================================================= */

interface Sampled {
  positions: Float32Array;
  colors: Float32Array;
  count: number;
}

/** Reads the image once and turns it into positions + colours. */
function sampleImage(img: HTMLImageElement, targetWidth: number, planeH: number): Sampled {
  const aspect = img.width / img.height;
  const w = targetWidth;
  const h = Math.round(w / aspect);

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);

  const planeW = planeH * aspect;
  const positions: number[] = [];
  const colors: number[] = [];

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      const r = data[i] / 255;
      const g = data[i + 1] / 255;
      const b = data[i + 2] / 255;
      const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;

      // Drop the darkest pixels: the subject emerges from the background
      // instead of sitting on a rectangular slab of points.
      if (lum < 0.16) continue;

      const px = (x / (w - 1) - 0.5) * planeW;
      const py = -(y / (h - 1) - 0.5) * planeH;
      // Brighter pixels sit fractionally forward — gives the cloud real relief.
      const pz = (lum - 0.5) * 0.32;

      positions.push(px, py, pz);
      // Push colour toward the site palette so the portrait belongs to the page.
      colors.push(
        r * 0.62 + 0.24,
        g * 0.62 + 0.16,
        b * 0.62 + 0.38,
      );
    }
  }

  return {
    positions: new Float32Array(positions),
    colors: new Float32Array(colors),
    count: positions.length / 3,
  };
}

function PointCloud({ data, reduced }: { data: Sampled; reduced: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);
  const { size, camera } = useThree();

  // Home positions are immutable; `live` is what actually renders.
  const home = useMemo(() => data.positions, [data]);
  const live = useMemo(() => Float32Array.from(data.positions), [data]);
  const velocity = useMemo(() => new Float32Array(data.count * 3), [data]);

  // Reveal: points assemble from a dispersed cloud into the portrait.
  const reveal = useRef(reduced ? 1 : 0);
  const scatter = useMemo(() => {
    const s = new Float32Array(data.count * 3);
    // Deterministic scatter — same assembly every load, no random flicker.
    let seed = 9301;
    const rand = () => {
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296 - 0.5;
    };
    for (let i = 0; i < data.count; i++) {
      s[i * 3] = home[i * 3] + rand() * 2.2;
      s[i * 3 + 1] = home[i * 3 + 1] + rand() * 2.2;
      s[i * 3 + 2] = home[i * 3 + 2] + rand() * 1.6;
    }
    return s;
  }, [data.count, home]);

  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 0, 1), 0), []);
  const ray = useMemo(() => new THREE.Raycaster(), []);
  const hit = useMemo(() => new THREE.Vector3(), []);

  useFrame(({ pointer, clock }, delta) => {
    const geom = pointsRef.current?.geometry;
    if (!geom) return;

    const d = Math.min(delta, 1 / 30);

    if (reduced) {
      // Settled portrait, no interaction, no assembly animation.
      if (reveal.current !== 1) {
        live.set(home);
        reveal.current = 1;
        geom.attributes.position.needsUpdate = true;
      }
      return;
    }

    // --- assembly ---------------------------------------------------------
    if (reveal.current < 1) {
      reveal.current = Math.min(1, reveal.current + d * 0.55);
      // easeOutExpo — decisive arrival, matches the site's motion tokens.
      const e = 1 - Math.pow(2, -10 * reveal.current);
      for (let i = 0; i < live.length; i++) {
        live[i] = scatter[i] + (home[i] - scatter[i]) * e;
      }
      geom.attributes.position.needsUpdate = true;
      if (reveal.current < 1) return;
    }

    // --- cursor repulsion -------------------------------------------------
    ray.setFromCamera(pointer as unknown as THREE.Vector2, camera);
    const hasHit = ray.ray.intersectPlane(plane, hit);

    const R = 0.72; // influence radius in world units
    const R2 = R * R;
    // Frame-rate-independent spring-return.
    const k = 1 - Math.pow(0.0015, d);

    for (let i = 0; i < data.count; i++) {
      const i3 = i * 3;
      const hx = home[i3];
      const hy = home[i3 + 1];
      const hz = home[i3 + 2];

      if (hasHit) {
        const dx = live[i3] - hit.x;
        const dy = live[i3 + 1] - hit.y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 < R2 && dist2 > 1e-6) {
          const dist = Math.sqrt(dist2);
          // Falls off smoothly to zero at the radius edge — no hard ring.
          const force = (1 - dist / R) ** 2 * 2.6 * d;
          velocity[i3] += (dx / dist) * force;
          velocity[i3 + 1] += (dy / dist) * force;
          velocity[i3 + 2] += force * 0.35;
        }
      }

      // Integrate, damp, and pull home.
      live[i3] += velocity[i3];
      live[i3 + 1] += velocity[i3 + 1];
      live[i3 + 2] += velocity[i3 + 2];
      velocity[i3] *= 0.86;
      velocity[i3 + 1] *= 0.86;
      velocity[i3 + 2] *= 0.86;
      live[i3] += (hx - live[i3]) * k * 0.22;
      live[i3 + 1] += (hy - live[i3 + 1]) * k * 0.22;
      live[i3 + 2] += (hz - live[i3 + 2]) * k * 0.22;
    }

    geom.attributes.position.needsUpdate = true;

    // Whole-cloud parallax: a few degrees, damped. Not a spin.
    if (pointsRef.current) {
      const ry = pointer.x * 0.16;
      const rx = -pointer.y * 0.1;
      pointsRef.current.rotation.y += (ry - pointsRef.current.rotation.y) * k * 0.5;
      pointsRef.current.rotation.x += (rx - pointsRef.current.rotation.x) * k * 0.5;
      // Barely-there breathing so a still cursor doesn't look frozen.
      pointsRef.current.position.y = Math.sin(clock.elapsedTime * 0.4) * 0.014;
    }
  });

  // Scale point size with viewport so the portrait holds density on small screens.
  const pointSize = size.width < 768 ? 0.016 : 0.012;

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[live, 3]} />
        <bufferAttribute attach="attributes-color" args={[data.colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={pointSize}
        vertexColors
        transparent
        opacity={0.92}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

/**
 * Scene contents. Loads the portrait, samples it, renders the cloud.
 * Density is resolution-dependent: fewer, larger points on mobile.
 */
export function PortraitContents({
  src = "/portrait.jpg",
  reduced = false,
}: {
  src?: string;
  reduced?: boolean;
}) {
  const [data, setData] = useState<Sampled | null>(null);
  const { size } = useThree();
  const density = size.width < 768 ? 78 : 128;

  useEffect(() => {
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      if (cancelled) return;
      setData(sampleImage(img, density, 3.1));
    };
    img.src = src;
    return () => {
      cancelled = true;
    };
  }, [src, density]);

  if (!data) return null;

  return (
    <>
      <ambientLight intensity={0.4} />
      <PointCloud data={data} reduced={reduced} />
    </>
  );
}
