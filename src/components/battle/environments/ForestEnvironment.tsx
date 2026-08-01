import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import RainParticles from './RainParticles';
import Fireflies from './Fireflies';
import GroundFog from './GroundFog';

const TREE_SPOTS: [number, number, number][] = [
  [-6.5, 0, -3], [-8, 0, 0.5], [-5.5, 0, 3.5], [7, 0, -2.5],
  [8.5, 0, 1], [6, 0, 4], [-4.5, 0, -6], [5, 0, -6.5],
];

// A second, further-out tree line. These sit behind the fog and read as
// depth rather than detail, so they use a cheaper 2-mesh silhouette
// instead of the full layered Tree above.
const DISTANT_TREE_SPOTS: [number, number, number][] = [
  [-11, 0, -5], [-9.5, 0, 4.5], [-12, 0, 0], [10.5, 0, -5.5],
  [11.5, 0, 2], [9, 0, 6], [-7, 0, -9], [7.5, 0, -9.5],
  [0, 0, -11], [-3, 0, -10.5], [3.5, 0, -10.5],
];

function DistantTree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.1, 0.14, 1, 5]} />
        <meshStandardMaterial color="#2e2418" roughness={1} />
      </mesh>
      <mesh position={[0, 1.75, 0]}>
        <coneGeometry args={[0.8, 2.6, 7]} />
        <meshStandardMaterial color="#14301f" roughness={1} />
      </mesh>
    </group>
  );
}

function Bush({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <mesh position={position} scale={[scale, scale * 0.7, scale]}>
      <sphereGeometry args={[0.42, 7, 5]} />
      <meshStandardMaterial color="#1e4a2c" roughness={0.95} />
    </mesh>
  );
}

function Tree({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.2, 1.2, 7]} />
        <meshStandardMaterial color="#3a2e1f" roughness={0.95} />
      </mesh>
      <mesh position={[0, 1.5, 0]} castShadow>
        <coneGeometry args={[0.9, 1.4, 8]} />
        <meshStandardMaterial color="#1c4430" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.15, 0]} castShadow>
        <coneGeometry args={[0.68, 1.1, 8]} />
        <meshStandardMaterial color="#235539" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.7, 0]} castShadow>
        <coneGeometry args={[0.45, 0.85, 8]} />
        <meshStandardMaterial color="#2c6a44" roughness={0.9} />
      </mesh>
    </group>
  );
}

function RuinPillar({ position, height, tilt = 0 }: { position: [number, number, number]; height: number; tilt?: number }) {
  return (
    <mesh position={position} rotation={[0, 0, tilt]} castShadow>
      <cylinderGeometry args={[0.32, 0.38, height, 8]} />
      <meshStandardMaterial color="#3a3f3e" roughness={0.95} />
    </mesh>
  );
}

function StormCloud({ position, scale }: { position: [number, number, number]; scale: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, delta) => {
    if (ref.current) ref.current.position.x += delta * 0.15;
  });
  return (
    <group ref={ref} position={position} scale={scale}>
      <mesh>
        <sphereGeometry args={[1.4, 8, 6]} />
        <meshStandardMaterial color="#0a0d14" roughness={1} />
      </mesh>
      <mesh position={[1.1, -0.15, 0.3]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#0a0d14" roughness={1} />
      </mesh>
      <mesh position={[-1.1, -0.1, -0.2]}>
        <sphereGeometry args={[1.1, 8, 6]} />
        <meshStandardMaterial color="#0a0d14" roughness={1} />
      </mesh>
    </group>
  );
}

export default function ForestEnvironment() {
  return (
    <group>
      {DISTANT_TREE_SPOTS.map((pos, i) => (
        <DistantTree key={`d${i}`} position={pos} scale={1 + (i % 4) * 0.18} />
      ))}
      {TREE_SPOTS.map((pos, i) => (
        <Tree key={i} position={pos} scale={0.9 + (i % 3) * 0.15} />
      ))}

      {/* Undergrowth breaking up the treeline-to-floor transition */}
      {[
        [-6.2, 0.2, -1.4], [-7.4, 0.18, 2.2], [-4.8, 0.22, 4.6], [6.4, 0.2, -1.2],
        [7.8, 0.18, 2.6], [5.2, 0.22, 5.2], [-3.6, 0.2, -7.2], [4.2, 0.18, -7.6],
        [-8.8, 0.2, -4.2], [8.6, 0.22, -4.6],
      ].map((p, i) => (
        <Bush key={`b${i}`} position={p as [number, number, number]} scale={0.8 + (i % 3) * 0.3} />
      ))}

      {/* ruins scattered behind the arena */}
      <RuinPillar position={[-2.4, 1.1, -7.5]} height={2.2} tilt={0.05} />
      <RuinPillar position={[-1.4, 0.75, -8]} height={1.5} tilt={-0.25} />
      <RuinPillar position={[2.8, 0.9, -7.8]} height={1.8} tilt={0.15} />
      <mesh position={[0.6, 0.12, -7.6]} rotation={[0, 0.3, 0.1]}>
        <boxGeometry args={[2.2, 0.24, 0.9]} />
        <meshStandardMaterial color="#454c46" roughness={0.95} />
      </mesh>

      {/* wet ground sheen */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <circleGeometry args={[9, 48]} />
        <meshStandardMaterial color="#1c2a30" roughness={0.3} metalness={0.2} transparent opacity={0.4} />
      </mesh>

      {/* low grass tufts */}
      {Array.from({ length: 26 }).map((_, i) => {
        const angle = (i / 26) * Math.PI * 2;
        const r = 3.6 + (i % 4) * 0.6;
        return (
          <mesh key={i} position={[Math.cos(angle) * r, 0.08, Math.sin(angle) * r]} rotation={[0, angle, 0]}>
            <coneGeometry args={[0.12, 0.22, 4]} />
            <meshStandardMaterial color="#2a4a2c" roughness={0.9} />
          </mesh>
        );
      })}

      {/* pale moon */}
      <mesh position={[-6, 8, -12]}>
        <sphereGeometry args={[1.1, 16, 16]} />
        <meshBasicMaterial color="#e2e8f0" toneMapped={false} />
      </mesh>
      <pointLight position={[-6, 8, -12]} color="#c7d9f5" intensity={1.4} distance={40} />

      <StormCloud position={[-4, 9, -8]} scale={1.6} />
      <StormCloud position={[3, 9.5, -10]} scale={2.1} />
      <StormCloud position={[8, 8.5, -6]} scale={1.3} />

      {/* Damp storm-forest floor: cool fog pooling between the trees, with
          fireflies drifting above it for a little warm contrast against all
          the blue. */}
      <GroundFog color="#8fb3c9" layers={4} opacity={0.13} radius={9} height={0.5} speed={0.9} />
      <Fireflies count={34} color="#bef264" area={[15, 3.2, 12]} size={0.075} />

      <RainParticles />
    </group>
  );
}
