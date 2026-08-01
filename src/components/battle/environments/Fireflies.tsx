import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface FirefliesProps {
  count?: number;
  color?: string;
  /** [x, y, z] extent the swarm wanders within, centred on the group. */
  area?: [number, number, number];
  size?: number;
}

/**
 * Drifting glow motes. Rendered as a single THREE.Points cloud (one draw
 * call) with all motion done by rewriting one Float32Array in place — no
 * per-frame allocation and no extra real-time lights, so a swarm costs
 * about the same as the existing snow/dust layers.
 *
 * Each mote gets its own phase/speed so the swarm never pulses in unison,
 * which is what makes a particle field read as alive rather than as a
 * scrolling texture.
 */
export default function Fireflies({
  count = 34,
  color = '#bef264',
  area = [15, 3.4, 12],
  size = 0.075,
}: FirefliesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);

  const { positions, seeds } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    // per-mote: originX, originY, originZ, phase, speed, radius
    const seeds = new Float32Array(count * 6);
    for (let i = 0; i < count; i++) {
      const ox = (Math.random() - 0.5) * area[0];
      const oy = 0.5 + Math.random() * area[1];
      const oz = (Math.random() - 0.5) * area[2];
      seeds[i * 6] = ox;
      seeds[i * 6 + 1] = oy;
      seeds[i * 6 + 2] = oz;
      seeds[i * 6 + 3] = Math.random() * Math.PI * 2;
      seeds[i * 6 + 4] = 0.25 + Math.random() * 0.5;
      seeds[i * 6 + 5] = 0.3 + Math.random() * 0.9;
      positions[i * 3] = ox;
      positions[i * 3 + 1] = oy;
      positions[i * 3 + 2] = oz;
    }
    return { positions, seeds };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useFrame((state) => {
    const geo = pointsRef.current?.geometry;
    if (!geo) return;
    const attr = geo.getAttribute('position') as THREE.BufferAttribute;
    const arr = attr.array as Float32Array;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i++) {
      const ox = seeds[i * 6];
      const oy = seeds[i * 6 + 1];
      const oz = seeds[i * 6 + 2];
      const phase = seeds[i * 6 + 3];
      const speed = seeds[i * 6 + 4];
      const radius = seeds[i * 6 + 5];
      // Lissajous-ish wander: different frequencies per axis so the path
      // never closes into an obvious circle.
      arr[i * 3] = ox + Math.sin(t * speed + phase) * radius;
      arr[i * 3 + 1] = oy + Math.sin(t * speed * 0.7 + phase * 1.7) * radius * 0.4;
      arr[i * 3 + 2] = oz + Math.cos(t * speed * 0.85 + phase) * radius;
    }
    attr.needsUpdate = true;
    // Swarm-wide breathing on top of the per-mote drift.
    if (matRef.current) matRef.current.opacity = 0.55 + Math.sin(t * 1.6) * 0.2;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        ref={matRef}
        color={color}
        size={size}
        sizeAttenuation
        transparent
        opacity={0.6}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}
