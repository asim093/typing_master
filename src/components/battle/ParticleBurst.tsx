import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface Burst {
  id: number;
  born: number;
  position: [number, number, number];
  color: string;
  count: number;
  big: boolean;
}

interface ParticleBurstProps {
  trigger: number;
  position: [number, number, number];
  color: string;
  big?: boolean;
}

const LIFE = 0.6;

// One shard geometry shared by every particle of every burst. Cones point
// along +Y by default; rotating the geometry itself to +Z means the runtime
// only has to lookAt() a direction, with no per-mesh correction.
const SHARD_GEOMETRY = (() => {
  const g = new THREE.ConeGeometry(1, 3, 4);
  g.rotateX(Math.PI / 2);
  return g;
})();

export default function ParticleBurst({ trigger, position, color, big }: ParticleBurstProps) {
  const burstsRef = useRef<Burst[]>([]);
  const lastTrigger = useRef(trigger);
  const groupRef = useRef<THREE.Group>(null);
  const idRef = useRef(0);
  // Reused every frame for every particle — allocating a Vector3 per spark
  // per frame would churn the GC during heavy combo streaks.
  const aim = useRef(new THREE.Vector3());

  const velocities = useMemo(() => new Map<number, Float32Array>(), []);

  if (lastTrigger.current !== trigger) {
    lastTrigger.current = trigger;
    const id = ++idRef.current;
    const count = big ? 20 : 10;
    const vel = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = big ? 3 + Math.random() * 2.5 : 1.5 + Math.random() * 1.8;
      vel[i * 3] = Math.sin(phi) * Math.cos(theta) * speed;
      vel[i * 3 + 1] = Math.abs(Math.cos(phi)) * speed + 1;
      vel[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * speed;
    }
    velocities.set(id, vel);
    burstsRef.current = [
      ...burstsRef.current,
      { id, born: performance.now(), position, color, count, big: !!big },
    ];
  }

  useFrame(() => {
    const now = performance.now();
    burstsRef.current = burstsRef.current.filter((b) => (now - b.born) / 1000 < LIFE);
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child) => {
      const mesh = child as THREE.Group;
      const id = Number(mesh.userData.burstId);
      const burst = burstsRef.current.find((b) => b.id === id);
      if (!burst) return;
      const vel = velocities.get(id);
      if (!vel) return;
      const t = (now - burst.born) / 1000;
      const life = Math.max(0, 1 - t / LIFE);
      mesh.children.forEach((p, i) => {
        const vx = vel[i * 3];
        // Gravity is folded into the *current* vertical velocity too, not
        // just the position, so a spark's streak tips over as it arcs down
        // instead of always pointing along its launch direction.
        const vy = vel[i * 3 + 1] - 8 * t;
        const vz = vel[i * 3 + 2];
        p.position.set(
          burst.position[0] + vx * t,
          burst.position[1] + vel[i * 3 + 1] * t - 4 * t * t,
          burst.position[2] + vz * t,
        );
        // Point the shard along travel so it reads as a spark streak
        // rather than a floating ball.
        aim.current.set(p.position.x + vx, p.position.y + vy, p.position.z + vz);
        p.lookAt(aim.current);
        const speed = Math.sqrt(vx * vx + vy * vy + vz * vz);
        const base = burst.big ? 0.15 : 0.085;
        // Thin across, stretched along travel, and the streak shortens as
        // the spark slows — fast fragments read as longer lines.
        p.scale.set(base * life * 0.45, base * life * 0.45, base * life * (0.9 + speed * 0.22));
      });
    });
  });

  return (
    <group ref={groupRef}>
      {burstsRef.current.map((b) => (
        <group key={b.id} userData={{ burstId: b.id }}>
          {Array.from({ length: b.count }).map((_, i) => (
            <mesh key={i} position={b.position} geometry={SHARD_GEOMETRY}>
              <meshBasicMaterial color={b.color} toneMapped={false} transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
