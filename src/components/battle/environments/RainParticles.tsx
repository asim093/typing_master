import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface RainParticlesProps {
  count?: number;
  area?: [number, number, number];
  color?: string;
}

interface Drop {
  x: number;
  y: number;
  z: number;
  speed: number;
}

// Fast, wind-slanted streaks looping from the top of the arena — cheap
// instanced geometry so it stays light next to the outline/GLB load.
export default function RainParticles({ count = 240, area = [18, 11, 18], color = '#9fc9e8' }: RainParticlesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const drops = useMemo<Drop[]>(() => {
    const arr: Drop[] = [];
    for (let i = 0; i < count; i++) {
      arr.push({
        x: (Math.random() - 0.5) * area[0],
        y: Math.random() * area[1],
        z: (Math.random() - 0.5) * area[2],
        speed: 10 + Math.random() * 6,
      });
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    for (let i = 0; i < drops.length; i++) {
      const d = drops[i];
      d.y -= d.speed * delta;
      d.x += delta * 1.4;
      if (d.y < 0) {
        d.y = area[1];
        d.x = (Math.random() - 0.5) * area[0];
        d.z = (Math.random() - 0.5) * area[2];
      }
      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(0.22, 0, 0.09);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <cylinderGeometry args={[0.005, 0.005, 0.4, 3]} />
      <meshBasicMaterial color={color} transparent opacity={0.45} toneMapped={false} />
    </instancedMesh>
  );
}
