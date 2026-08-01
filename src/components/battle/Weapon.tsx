import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { WeaponDef } from '../../types';

interface WeaponProps {
  weapon: WeaponDef;
  trailMatRef: React.RefObject<THREE.MeshBasicMaterial | null>;
}

// A slash-trail arc that fades in/out, driven by the shared combat animator.
function Trail({ trailMatRef, y, radius, color }: { trailMatRef: WeaponProps['trailMatRef']; y: number; radius: number; color: string }) {
  return (
    <mesh position={[0.08, y, 0.06]}>
      <ringGeometry args={[radius * 0.7, radius, 24, 1, 0, Math.PI * 0.65]} />
      <meshBasicMaterial ref={trailMatRef} color={color} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  );
}

export default function Weapon({ weapon, trailMatRef }: WeaponProps) {
  const flicker = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (!flicker.current) return;
    const f = 1 + Math.sin(state.clock.elapsedTime * 14) * 0.15;
    flicker.current.scale.setScalar(f);
  });

  switch (weapon.type) {
    case 'katana':
      return (
        <group>
          <mesh position={[0, -0.02, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 0.05, 16]} />
            <meshStandardMaterial color={weapon.hiltColor} metalness={0.6} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.48, 0.02]} rotation={[0.06, 0, 0]}>
            <boxGeometry args={[0.05, 0.95, 0.02]} />
            <meshStandardMaterial color={weapon.bladeColor} metalness={0.85} roughness={0.1} />
          </mesh>
          <Trail trailMatRef={trailMatRef} y={-0.42} radius={0.9} color={weapon.trailColor} />
        </group>
      );

    case 'flameSword':
      return (
        <group>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.22, 0.08, 0.06]} />
            <meshStandardMaterial color={weapon.hiltColor} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <boxGeometry args={[0.09, 0.9, 0.045]} />
            <meshStandardMaterial color={weapon.bladeColor} emissive={weapon.bladeColor} emissiveIntensity={0.9} roughness={0.3} />
          </mesh>
          <group ref={flicker} position={[0, -0.75, 0]}>
            <mesh>
              <coneGeometry args={[0.08, 0.22, 6]} />
              <meshBasicMaterial color={weapon.particleColor} toneMapped={false} transparent opacity={0.85} />
            </mesh>
          </group>
          <Trail trailMatRef={trailMatRef} y={-0.4} radius={0.85} color={weapon.trailColor} />
        </group>
      );

    case 'iceBlade':
      return (
        <group>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.2, 0.08, 0.06]} />
            <meshStandardMaterial color={weapon.hiltColor} roughness={0.4} />
          </mesh>
          <mesh position={[0, -0.45, 0]} rotation={[0, 0, 0.05]}>
            <octahedronGeometry args={[0.12, 0]} />
            <meshStandardMaterial
              color={weapon.bladeColor}
              transparent
              opacity={0.8}
              emissive={weapon.bladeColor}
              emissiveIntensity={0.5}
              roughness={0.1}
            />
          </mesh>
          <mesh position={[0, -0.78, 0]}>
            <octahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial color={weapon.bladeColor} transparent opacity={0.7} emissive={weapon.bladeColor} emissiveIntensity={0.6} />
          </mesh>
          <Trail trailMatRef={trailMatRef} y={-0.4} radius={0.85} color={weapon.trailColor} />
        </group>
      );

    case 'hammer':
      return (
        <group>
          <mesh position={[0, -0.35, 0]}>
            <cylinderGeometry args={[0.045, 0.06, 0.75, 8]} />
            <meshStandardMaterial color={weapon.hiltColor} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.72, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.16, 0.16, 0.34, 8]} />
            <meshStandardMaterial color={weapon.bladeColor} metalness={0.5} roughness={0.4} />
          </mesh>
          <Trail trailMatRef={trailMatRef} y={-0.65} radius={1.05} color={weapon.trailColor} />
        </group>
      );

    case 'staff':
      return (
        <group>
          <mesh position={[0, -0.4, 0]}>
            <cylinderGeometry args={[0.04, 0.045, 1.05, 8]} />
            <meshStandardMaterial color={weapon.hiltColor} roughness={0.6} />
          </mesh>
          <group ref={flicker} position={[0, -0.95, 0]}>
            <mesh>
              <sphereGeometry args={[0.11, 16, 16]} />
              <meshStandardMaterial color={weapon.bladeColor} emissive={weapon.bladeColor} emissiveIntensity={0.9} transparent opacity={0.9} />
            </mesh>
          </group>
          <pointLight position={[0, -0.95, 0]} color={weapon.bladeColor} intensity={0.6} distance={2} />
          <Trail trailMatRef={trailMatRef} y={-0.7} radius={0.7} color={weapon.trailColor} />
        </group>
      );

    case 'daggers':
      return (
        <group>
          <mesh position={[-0.06, -0.32, 0.05]} rotation={[0, 0, -0.08]}>
            <boxGeometry args={[0.05, 0.5, 0.03]} />
            <meshStandardMaterial color={weapon.bladeColor} metalness={0.7} roughness={0.2} />
          </mesh>
          <mesh position={[0.09, -0.28, -0.05]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.05, 0.44, 0.03]} />
            <meshStandardMaterial color={weapon.bladeColor} metalness={0.7} roughness={0.2} />
          </mesh>
          <Trail trailMatRef={trailMatRef} y={-0.35} radius={0.75} color={weapon.trailColor} />
        </group>
      );

    case 'cyberBlade':
      return (
        <group>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.18, 0.07, 0.05]} />
            <meshStandardMaterial color={weapon.hiltColor} metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <boxGeometry args={[0.07, 0.92, 0.03]} />
            <meshStandardMaterial color="#0f172a" metalness={0.6} roughness={0.3} />
          </mesh>
          <group ref={flicker}>
            <mesh position={[0.037, -0.45, 0.017]}>
              <boxGeometry args={[0.012, 0.9, 0.012]} />
              <meshBasicMaterial color={weapon.bladeColor} toneMapped={false} />
            </mesh>
          </group>
          <Trail trailMatRef={trailMatRef} y={-0.42} radius={0.9} color={weapon.trailColor} />
        </group>
      );

    case 'sword':
    default:
      return (
        <group>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.24, 0.08, 0.06]} />
            <meshStandardMaterial color={weapon.hiltColor} metalness={0.4} roughness={0.5} />
          </mesh>
          <mesh position={[0, -0.45, 0]}>
            <boxGeometry args={[0.08, 0.9, 0.04]} />
            <meshStandardMaterial color={weapon.bladeColor} metalness={0.9} roughness={0.15} />
          </mesh>
          <Trail trailMatRef={trailMatRef} y={-0.4} radius={0.85} color={weapon.trailColor} />
        </group>
      );
  }
}
