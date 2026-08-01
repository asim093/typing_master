import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface Ring {
  id: number;
  born: number;
  position: [number, number, number];
  color: string;
  big: boolean;
}

interface ImpactRingProps {
  trigger: number;
  position: [number, number, number];
  color: string;
  big?: boolean;
}

const LIFE = 0.38;

export default function ImpactRing({ trigger, position, color, big }: ImpactRingProps) {
  const ringsRef = useRef<Ring[]>([]);
  const lastTrigger = useRef(trigger);
  const idRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  if (lastTrigger.current !== trigger) {
    lastTrigger.current = trigger;
    const id = ++idRef.current;
    ringsRef.current = [...ringsRef.current, { id, born: performance.now(), position, color, big: !!big }];
  }

  useFrame(() => {
    const now = performance.now();
    ringsRef.current = ringsRef.current.filter((r) => (now - r.born) / 1000 < LIFE);
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      const id = Number(mesh.userData.ringId);
      const ring = ringsRef.current.find((r) => r.id === id);
      if (!ring) return;
      const t = (now - ring.born) / 1000 / LIFE;
      const maxScale = ring.big ? 2.6 : 1.5;
      const scale = 0.2 + t * maxScale;
      mesh.scale.setScalar(scale);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, (1 - t) * 0.8);
    });
  });

  return (
    <group ref={groupRef}>
      {ringsRef.current.map((r) => (
        <mesh key={r.id} position={r.position} rotation={[0, 0, 0]} userData={{ ringId: r.id }}>
          <ringGeometry args={[0.55, 0.72, 32]} />
          <meshBasicMaterial color={r.color} transparent opacity={0.8} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
