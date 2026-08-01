import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import RainParticles from './RainParticles';

const TREE_SPOTS: [number, number, number][] = [
  [-6.5, 0, -3], [-8, 0, 0.5], [-5.5, 0, 3.5], [7, 0, -2.5],
  [8.5, 0, 1], [6, 0, 4], [-4.5, 0, -6], [5, 0, -6.5],
];

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
      {TREE_SPOTS.map((pos, i) => (
        <Tree key={i} position={pos} scale={0.9 + (i % 3) * 0.15} />
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

      <RainParticles />
    </group>
  );
}
