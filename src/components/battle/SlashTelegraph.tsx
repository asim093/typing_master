import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';

interface Slash {
  id: number;
  born: number;
  color: string;
  big: boolean;
}

interface SlashTelegraphProps {
  trigger: number;
  position: [number, number, number];
  color: string;
  big?: boolean;
}

const LIFE = 0.32;

// A quick diagonal slash flash that reads as "something just struck here" —
// used to telegraph enemy attacks landing on the hero.
export default function SlashTelegraph({ trigger, position, color, big }: SlashTelegraphProps) {
  const slashesRef = useRef<Slash[]>([]);
  const lastTrigger = useRef(trigger);
  const idRef = useRef(0);
  const groupRef = useRef<THREE.Group>(null);

  if (lastTrigger.current !== trigger) {
    lastTrigger.current = trigger;
    const id = ++idRef.current;
    slashesRef.current = [...slashesRef.current, { id, born: performance.now(), color, big: !!big }];
  }

  useFrame(() => {
    const now = performance.now();
    slashesRef.current = slashesRef.current.filter((s) => (now - s.born) / 1000 < LIFE);
    if (!groupRef.current) return;
    groupRef.current.children.forEach((child) => {
      const mesh = child as THREE.Mesh;
      const id = Number(mesh.userData.slashId);
      const slash = slashesRef.current.find((s) => s.id === id);
      if (!slash) return;
      const t = (now - slash.born) / 1000 / LIFE;
      const scale = (slash.big ? 1.6 : 1.1) * (0.5 + t * 0.9);
      mesh.scale.set(scale, scale * 0.55, 1);
      const mat = mesh.material as THREE.MeshBasicMaterial;
      mat.opacity = Math.max(0, 1 - t) * 0.9;
    });
  });

  return (
    <group ref={groupRef}>
      {slashesRef.current.map((s) => (
        <mesh key={s.id} position={position} rotation={[0, 0, -0.5]} userData={{ slashId: s.id }}>
          <planeGeometry args={[1, 0.14]} />
          <meshBasicMaterial color={s.color} transparent opacity={0.9} toneMapped={false} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}
