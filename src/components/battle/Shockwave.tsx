import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface ShockwaveProps {
  /** Increment to fire a wave. */
  trigger: number;
  position: [number, number, number];
  color: string;
  /** Overall size/energy of the blast. */
  scale?: number;
  /** Seconds the wave takes to expand and fade out. */
  life?: number;
  /** Adds a second, slower wave behind the first — used for big moments. */
  double?: boolean;
}

interface Wave {
  id: number;
  born: number;
  position: [number, number, number];
  color: string;
}

// Shared across every wave instance: expanding shells are always the same
// mesh, only transformed differently.
const SPHERE = new THREE.SphereGeometry(1, 16, 12);
const RING = new THREE.RingGeometry(0.7, 1, 40);

/**
 * A blast of energy: a thin expanding shell plus a flat ground ring, both
 * easing outward fast and thinning as they go. Used for critical hits,
 * enemy deaths, and (bigger + doubled) boss defeats, so those moments share
 * a visual language instead of each inventing their own.
 *
 * Everything is additive and depth-write-off so waves layer over the
 * characters without z-fighting or popping.
 */
export default function Shockwave({ trigger, position, color, scale = 1, life = 0.5, double = false }: ShockwaveProps) {
  const wavesRef = useRef<Wave[]>([]);
  const lastTrigger = useRef(trigger);
  const idRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  if (lastTrigger.current !== trigger) {
    lastTrigger.current = trigger;
    wavesRef.current = [...wavesRef.current, { id: ++idRef.current, born: performance.now(), position, color }];
  }

  useFrame(() => {
    const now = performance.now();
    const total = life * (double ? 1.55 : 1);
    wavesRef.current = wavesRef.current.filter((w) => (now - w.born) / 1000 < total);
    const g = groupRef.current;
    if (!g) return;
    g.children.forEach((child) => {
      const id = Number(child.userData.waveId);
      const wave = wavesRef.current.find((w) => w.id === id);
      if (!wave) return;
      const elapsed = (now - wave.born) / 1000;
      child.children.forEach((part) => {
        const delay = Number(part.userData.delay) || 0;
        const t = Math.max(0, Math.min(1, (elapsed - delay) / life));
        const mesh = part as THREE.Mesh;
        const mat = mesh.material as THREE.MeshBasicMaterial;
        if (t <= 0 || t >= 1) {
          mat.opacity = 0;
          return;
        }
        // Ease-out expansion: fastest at the instant of impact.
        const eased = 1 - Math.pow(1 - t, 2.6);
        mesh.scale.setScalar((0.12 + eased * 1.5) * scale * (Number(part.userData.sizeMul) || 1));
        mat.opacity = (1 - t) * 0.75;
      });
    });
  });

  return (
    <group ref={groupRef}>
      {wavesRef.current.map((w) => (
        <group key={w.id} position={w.position} userData={{ waveId: w.id }}>
          {/* Expanding shell */}
          <mesh geometry={SPHERE} userData={{ delay: 0, sizeMul: 1 }}>
            <meshBasicMaterial color={w.color} transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
          </mesh>
          {/* Flat ground ring, sitting just off the floor */}
          <mesh geometry={RING} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} userData={{ delay: 0, sizeMul: 1.35 }}>
            <meshBasicMaterial color={w.color} transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
          </mesh>
          {double && (
            <mesh geometry={SPHERE} userData={{ delay: life * 0.45, sizeMul: 1.5 }}>
              <meshBasicMaterial color={w.color} transparent opacity={0} toneMapped={false} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.BackSide} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
