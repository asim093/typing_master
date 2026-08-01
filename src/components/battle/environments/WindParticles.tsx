import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface WindParticlesProps {
  count?: number;
  color?: string;
  size?: number;
  area?: [number, number, number];
  /** Sideways drift in units/second. Negative blows the other way. */
  speed?: number;
  opacity?: number;
}

/**
 * Grit driven horizontally across the arena. FallingParticles only moves
 * straight down, which reads as snow or ash — sand needs to travel sideways
 * with a bit of vertical bob to look wind-blown rather than dropped.
 *
 * Same one-draw-call THREE.Points approach as the other weather layers,
 * with wrapping handled by resetting X once a grain leaves the box.
 */
export default function WindParticles({
  count = 90,
  color = '#e8c98a',
  size = 0.05,
  area = [20, 5, 14],
  speed = 2.4,
  opacity = 0.45,
}: WindParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { positions, drift } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    // per-grain: speed multiplier, bob phase, bob rate
    const drift = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * area[0];
      positions[i * 3 + 1] = Math.random() * area[1];
      positions[i * 3 + 2] = (Math.random() - 0.5) * area[2];
      drift[i * 3] = 0.55 + Math.random() * 0.9;
      drift[i * 3 + 1] = Math.random() * Math.PI * 2;
      drift[i * 3 + 2] = 1.2 + Math.random() * 2.2;
    }
    return { positions, drift };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useFrame((state, delta) => {
    const geo = pointsRef.current?.geometry;
    if (!geo) return;
    const attr = geo.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    // Clamped so a frame hitch can't teleport the whole field across screen.
    const dt = Math.min(delta, 1 / 24);
    const t = state.clock.elapsedTime;
    const halfX = area[0] / 2;
    for (let i = 0; i < count; i++) {
      arr[i * 3] += speed * drift[i * 3] * dt;
      arr[i * 3 + 1] += Math.sin(t * drift[i * 3 + 2] + drift[i * 3 + 1]) * dt * 0.35;
      if (arr[i * 3] > halfX) {
        arr[i * 3] = -halfX;
        arr[i * 3 + 1] = Math.random() * area[1];
        arr[i * 3 + 2] = (Math.random() - 0.5) * area[2];
      }
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={opacity}
        depthWrite={false}
        toneMapped={false}
      />
    </points>
  );
}
