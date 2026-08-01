import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface HeatHazeProps {
  color?: string;
  bands?: number;
  opacity?: number;
  radius?: number;
}

/**
 * Shimmering air above hot sand. A real refraction pass would mean a custom
 * shader and a scene render target — far too expensive for the budget this
 * project runs on — so this fakes it the cheap way: a few very faint
 * horizontal bands sitting just above the ground that scale and slide out of
 * phase with each other. The eye reads the resulting wobble along the
 * horizon as rising heat.
 *
 * Kept low and wide on purpose: heat shimmer belongs against distant
 * geometry near the ground line, and covering the fighters would just make
 * the arena look foggy.
 */
export default function HeatHaze({
  color = '#ffd9a0',
  bands = 5,
  opacity = 0.07,
  radius = 11,
}: HeatHazeProps) {
  const groupRef = useRef<THREE.Group>(null);

  const config = useMemo(
    () =>
      Array.from({ length: bands }).map((_, i) => ({
        y: 0.18 + i * 0.26,
        phase: i * 1.3,
        rate: 0.7 + i * 0.22,
        depth: -3 - i * 1.6,
      })),
    [bands],
  );

  useFrame((state) => {
    const g = groupRef.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.children.forEach((child, i) => {
      const c = config[i];
      if (!c) return;
      // Horizontal squash/stretch + a little sway is what sells "wobbling
      // air" without touching the pixels underneath.
      child.scale.x = 1 + Math.sin(t * c.rate + c.phase) * 0.05;
      child.position.x = Math.sin(t * c.rate * 0.6 + c.phase) * 0.22;
      child.position.y = c.y + Math.sin(t * c.rate * 1.4 + c.phase) * 0.035;
    });
  });

  return (
    <group ref={groupRef}>
      {config.map((c, i) => (
        <mesh key={i} position={[0, c.y, c.depth]}>
          <planeGeometry args={[radius * 2, 0.5]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}
