import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface FallingParticlesProps {
  count?: number;
  color: string;
  size?: number;
  area?: [number, number, number];
  speed?: number;
  opacity?: number;
}

// Simple looping "snow"/dust fall used by the colder & dustier world sets.
export default function FallingParticles({
  count = 90,
  color,
  size = 0.05,
  area = [16, 8, 16],
  speed = 0.6,
  opacity = 0.8,
}: FallingParticlesProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const velocities = useRef<Float32Array>(new Float32Array(count));

  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * area[0];
      arr[i * 3 + 1] = Math.random() * area[1];
      arr[i * 3 + 2] = (Math.random() - 0.5) * area[2];
      velocities.current[i] = 0.3 + Math.random() * 0.7;
    }
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);

  useFrame((_, delta) => {
    const geom = pointsRef.current?.geometry;
    if (!geom) return;
    const attr = geom.getAttribute('position') as THREE.BufferAttribute;
    for (let i = 0; i < count; i++) {
      let y = attr.getY(i) - speed * velocities.current[i] * delta;
      let x = attr.getX(i) + Math.sin((y + i) * 0.5) * 0.05 * delta;
      if (y < 0) {
        y = area[1];
        x = (Math.random() - 0.5) * area[0];
      }
      attr.setY(i, y);
      attr.setX(i, x);
    }
    attr.needsUpdate = true;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color={color} size={size} transparent opacity={opacity} sizeAttenuation depthWrite={false} />
    </points>
  );
}
