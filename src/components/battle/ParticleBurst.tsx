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

export default function ParticleBurst({ trigger, position, color, big }: ParticleBurstProps) {
  const burstsRef = useRef<Burst[]>([]);
  const lastTrigger = useRef(trigger);
  const groupRef = useRef<THREE.Group>(null);
  const idRef = useRef(0);

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
      mesh.children.forEach((p, i) => {
        const px = burst.position[0] + vel[i * 3] * t;
        const py = burst.position[1] + vel[i * 3 + 1] * t - 4 * t * t;
        const pz = burst.position[2] + vel[i * 3 + 2] * t;
        p.position.set(px, py, pz);
        const scale = Math.max(0, 1 - t / LIFE);
        p.scale.setScalar(scale * (burst.big ? 0.16 : 0.09));
      });
    });
  });

  return (
    <group ref={groupRef}>
      {burstsRef.current.map((b) => (
        <group key={b.id} userData={{ burstId: b.id }}>
          {Array.from({ length: b.count }).map((_, i) => (
            <mesh key={i} position={b.position}>
              <sphereGeometry args={[1, 6, 6]} />
              <meshBasicMaterial color={b.color} toneMapped={false} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
