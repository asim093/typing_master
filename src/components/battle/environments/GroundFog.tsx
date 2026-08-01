import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface GroundFogProps {
  color?: string;
  /** Number of overlapping fog sheets. Each is one transparent quad. */
  layers?: number;
  opacity?: number;
  radius?: number;
  height?: number;
  speed?: number;
}

/**
 * Low-lying fog built from a few big soft-edged sheets that rotate and rise
 * at slightly different rates. The soft edge comes from a radial-gradient
 * canvas texture generated once, so there's no shader, no depth sorting
 * headache (depthWrite off), and the whole layer costs `layers` draw calls
 * — cheap enough to sit alongside the existing weather particles.
 *
 * Sheets are deliberately offset in phase and scale; identical sheets would
 * just look like one brighter sheet instead of moving volume.
 */
function makeFogTexture(): THREE.CanvasTexture {
  const size = 128;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  const g = ctx.createRadialGradient(size / 2, size / 2, size * 0.05, size / 2, size / 2, size / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.28)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(canvas);
}

let sharedFogTexture: THREE.CanvasTexture | null = null;
function getFogTexture(): THREE.CanvasTexture {
  if (!sharedFogTexture) sharedFogTexture = makeFogTexture();
  return sharedFogTexture;
}

export default function GroundFog({
  color = '#9fb4c7',
  layers = 4,
  opacity = 0.16,
  radius = 9,
  height = 0.55,
  speed = 1,
}: GroundFogProps) {
  const groupRef = useRef<THREE.Group>(null);
  const texture = useMemo(() => getFogTexture(), []);

  const sheets = useMemo(
    () =>
      Array.from({ length: layers }).map((_, i) => ({
        y: height * (0.35 + (i / Math.max(1, layers)) * 1.1),
        scale: 1 + i * 0.22,
        dir: i % 2 === 0 ? 1 : -1,
        rate: 0.02 + i * 0.008,
        phase: i * 1.7,
      })),
    [layers, height],
  );

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime * speed;
    g.children.forEach((child, i) => {
      const s = sheets[i];
      if (!s) return;
      child.rotation.z = t * s.rate * s.dir + s.phase;
      // Slow vertical breathing keeps it from reading as a flat decal.
      child.position.y = s.y + Math.sin(t * 0.25 + s.phase) * 0.06;
    });
  });

  return (
    <group ref={groupRef}>
      {sheets.map((s, i) => (
        <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, s.y, 0]}>
          <planeGeometry args={[radius * 2 * s.scale, radius * 2 * s.scale]} />
          <meshBasicMaterial
            map={texture}
            color={color}
            transparent
            opacity={opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}
