import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { Suspense, lazy } from 'react';
import type { EnemyShape } from '../../../types';
import { useCombatAnimator } from '../../../game/useCombatAnimator';

// Every enemy GLB is 20-150MB. Each xxxGLB.tsx module calls useGLTF.preload()
// at import time, so a static import here would kick off every single one of
// those downloads the moment the battle screen mounts — even for the 8 shapes
// that won't appear in this fight. Lazy-loading keeps each model's request
// (and its preload call) deferred until that specific shape is actually needed.
const OrcGLB = lazy(() => import('./OrcGLB'));
const SkeletonSwordGLB = lazy(() => import('./SkeletonSwordGLB'));
const DarkKnightGLB = lazy(() => import('./DarkKnightGLB'));
const WolfGLB = lazy(() => import('./WolfGLB'));
const GoblinGLB = lazy(() => import('./GoblinGLB'));
const DarkMageGLB = lazy(() => import('./DarkMageGLB'));
const SandTitanGLB = lazy(() => import('./SandTitanGLB'));
const CyberOverlordGLB = lazy(() => import('./CyberOverlordGLB'));
const IceDragonGLB = lazy(() => import('./IceDragonGLB'));

export interface EnemyModelProps {
  shape: EnemyShape;
  color: string;
  accentColor: string;
  attackSeed: number;
  hitSeed: number;
  hitCrit?: boolean;
  dying?: boolean;
  scale?: number;
}

function Goblin({ color, accentColor, ...rest }: EnemyModelProps) {
  const { groupRef, weaponRef, bodyMatRef } = useCombatAnimator({ ...rest, scale: rest.scale ?? 1 });
  return (
    <group ref={groupRef}>
      <RoundedBox position={[0, 0.55, 0]} args={[0.55, 0.7, 0.42]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial ref={bodyMatRef} color={color} roughness={0.6} />
      </RoundedBox>
      <mesh position={[0, 1.05, 0]} castShadow>
        <sphereGeometry args={[0.3, 14, 14]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      <mesh position={[-0.13, 1.2, 0.2]} rotation={[0.3, 0, -0.2]}>
        <coneGeometry args={[0.07, 0.24, 6]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>
      <mesh position={[0.13, 1.2, 0.2]} rotation={[0.3, 0, 0.2]}>
        <coneGeometry args={[0.07, 0.24, 6]} />
        <meshStandardMaterial color={accentColor} />
      </mesh>
      <mesh position={[-0.09, 1.08, 0.26]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color="#facc15" toneMapped={false} />
      </mesh>
      <mesh position={[0.09, 1.08, 0.26]}>
        <sphereGeometry args={[0.045, 8, 8]} />
        <meshBasicMaterial color="#facc15" toneMapped={false} />
      </mesh>
      {/* rusty dagger arm — telegraphs the attack */}
      <group ref={weaponRef} position={[0.34, 0.85, 0.1]}>
        <mesh rotation={[0, 0, 0.3]} castShadow>
          <boxGeometry args={[0.1, 0.32, 0.1]} />
          <meshStandardMaterial color={color} roughness={0.6} />
        </mesh>
        <mesh position={[0.12, -0.34, 0.05]} rotation={[0.5, 0, 0.5]}>
          <coneGeometry args={[0.05, 0.42, 4]} />
          <meshStandardMaterial color="#a8a29e" metalness={0.6} roughness={0.35} />
        </mesh>
      </group>
    </group>
  );
}

function Orc({ color, accentColor, ...rest }: EnemyModelProps) {
  const { groupRef, weaponRef, bodyMatRef } = useCombatAnimator({ ...rest, scale: rest.scale ?? 1.2 });
  return (
    <group ref={groupRef}>
      <RoundedBox position={[0, 0.85, 0]} args={[0.85, 1.0, 0.55]} radius={0.1} smoothness={4} castShadow>
        <meshStandardMaterial ref={bodyMatRef} color={color} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 1.55, 0]} castShadow>
        <boxGeometry args={[0.5, 0.5, 0.48]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[-0.14, 1.42, 0.24]}>
        <boxGeometry args={[0.05, 0.14, 0.05]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0.14, 1.42, 0.24]}>
        <boxGeometry args={[0.05, 0.14, 0.05]} />
        <meshStandardMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[-0.55, 1.15, 0]} castShadow>
        <boxGeometry args={[0.28, 0.4, 0.32]} />
        <meshStandardMaterial color={accentColor} roughness={0.5} metalness={0.3} />
      </mesh>
      {/* club arm */}
      <group ref={weaponRef} position={[0.55, 1.15, 0]}>
        <mesh rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[0.28, 0.4, 0.32]} />
          <meshStandardMaterial color={accentColor} roughness={0.5} metalness={0.3} />
        </mesh>
        <mesh position={[0.1, -0.45, 0]} rotation={[0, 0, -0.2]} castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.6, 7]} />
          <meshStandardMaterial color="#57534e" roughness={0.8} />
        </mesh>
        <mesh position={[0.18, -0.72, 0]} rotation={[0, 0, -0.2]} castShadow>
          <dodecahedronGeometry args={[0.16, 0]} />
          <meshStandardMaterial color="#44403c" roughness={0.9} flatShading />
        </mesh>
      </group>
    </group>
  );
}

function Wolf({ color, accentColor, ...rest }: EnemyModelProps) {
  const { groupRef, weaponRef, bodyMatRef } = useCombatAnimator({ ...rest, scale: rest.scale ?? 1 });
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.55, 0]} rotation={[0.1, 0, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.75, 4, 8]} />
        <meshStandardMaterial ref={bodyMatRef} color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.02, 0.42]} castShadow>
        <sphereGeometry args={[0.24, 12, 12]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.95, 0.68]}>
        <coneGeometry args={[0.1, 0.28, 8]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[-0.1, 1.22, 0.36]} rotation={[0, 0, -0.2]}>
        <coneGeometry args={[0.06, 0.18, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.1, 1.22, 0.36]} rotation={[0, 0, 0.2]}>
        <coneGeometry args={[0.06, 0.18, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.08, 1.02, 0.58]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={accentColor} toneMapped={false} />
      </mesh>
      <mesh position={[0.08, 1.02, 0.58]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={accentColor} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.75, -0.5]} rotation={[0.6, 0, 0]}>
        <coneGeometry args={[0.08, 0.4, 8]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* clawed foreleg swipe */}
      <group ref={weaponRef} position={[0.22, 0.55, 0.4]}>
        <mesh rotation={[0.2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.06, 0.05, 0.4, 6]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
        {[-0.05, 0, 0.05].map((x, i) => (
          <mesh key={i} position={[x, -0.24, 0.05]} rotation={[0.8, 0, 0]}>
            <coneGeometry args={[0.025, 0.14, 5]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function Skeleton({ color, accentColor, ...rest }: EnemyModelProps) {
  const { groupRef, weaponRef, bodyMatRef } = useCombatAnimator({ ...rest, scale: rest.scale ?? 1 });
  return (
    <group ref={groupRef}>
      <RoundedBox position={[0, 1.0, 0]} args={[0.42, 0.55, 0.2]} radius={0.05} smoothness={4} castShadow>
        <meshStandardMaterial ref={bodyMatRef} color={color} roughness={0.5} />
      </RoundedBox>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.82 + i * 0.16, 0.12]}>
          <boxGeometry args={[0.36, 0.05, 0.03]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0, 1.5, 0]} castShadow>
        <sphereGeometry args={[0.24, 14, 14]} />
        <meshStandardMaterial color={color} roughness={0.4} />
      </mesh>
      <mesh position={[-0.08, 1.52, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={accentColor} toneMapped={false} />
      </mesh>
      <mesh position={[0.08, 1.52, 0.2]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial color={accentColor} toneMapped={false} />
      </mesh>
      <mesh position={[-0.2, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 0.75, 6]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      {/* bone club arm */}
      <group ref={weaponRef} position={[0.2, 0.9, 0]}>
        <mesh rotation={[0, 0, 0.1]} castShadow>
          <cylinderGeometry args={[0.045, 0.045, 0.4, 6]} />
          <meshStandardMaterial color={color} roughness={0.5} />
        </mesh>
        <mesh position={[0.03, -0.45, 0]} rotation={[0, 0, 0.15]} castShadow>
          <cylinderGeometry args={[0.05, 0.07, 0.55, 6]} />
          <meshStandardMaterial color="#e7e5e4" roughness={0.6} />
        </mesh>
        <mesh position={[0.05, -0.72, 0]} rotation={[0, 0, 0.15]}>
          <sphereGeometry args={[0.09, 8, 8]} />
          <meshStandardMaterial color="#e7e5e4" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function DarkMage({ color, accentColor, ...rest }: EnemyModelProps) {
  const { groupRef, weaponRef, bodyMatRef } = useCombatAnimator({ ...rest, scale: rest.scale ?? 1.15 });
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.9, 0]} castShadow>
        <coneGeometry args={[0.5, 1.6, 10]} />
        <meshStandardMaterial ref={bodyMatRef} color={color} roughness={0.4} transparent opacity={0.92} />
      </mesh>
      <mesh position={[0, 1.4, 0]}>
        <torusGeometry args={[0.36, 0.035, 8, 20]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.85, 0]} castShadow>
        <sphereGeometry args={[0.26, 14, 14]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} transparent opacity={0.95} />
      </mesh>
      <mesh position={[0, 1.85, 0.22]}>
        <boxGeometry args={[0.3, 0.06, 0.04]} />
        <meshBasicMaterial color={accentColor} toneMapped={false} />
      </mesh>
      {/* staff, thrust forward on attack */}
      <group ref={weaponRef} position={[0.42, 1.15, 0.05]}>
        <mesh rotation={[0, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.035, 0.04, 1.1, 8]} />
          <meshStandardMaterial color="#3f2d1a" roughness={0.6} />
        </mesh>
        <mesh position={[0.09, 0.58, 0]}>
          <sphereGeometry args={[0.13, 12, 12]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.1} transparent opacity={0.9} />
        </mesh>
        <pointLight position={[0.09, 0.58, 0]} color={accentColor} intensity={0.8} distance={2} />
      </group>
    </group>
  );
}

function GoblinKing({ color, accentColor, ...rest }: EnemyModelProps) {
  const { groupRef, weaponRef, bodyMatRef } = useCombatAnimator({ ...rest, scale: rest.scale ?? 1.9 });
  return (
    <group ref={groupRef}>
      <RoundedBox position={[0, 0.85, 0]} args={[0.9, 1.15, 0.65]} radius={0.1} smoothness={4} castShadow>
        <meshStandardMaterial ref={bodyMatRef} color={color} roughness={0.5} />
      </RoundedBox>
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.42, 16, 16]} />
        <meshStandardMaterial color={color} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.98, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.4, 0.2, 8]} />
        <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.25} emissive={accentColor} emissiveIntensity={0.4} />
      </mesh>
      {[-0.2, -0.07, 0.07, 0.2].map((x, i) => (
        <mesh key={i} position={[x, 2.1, 0]}>
          <coneGeometry args={[0.05, 0.16, 6]} />
          <meshStandardMaterial color={accentColor} metalness={0.7} roughness={0.2} />
        </mesh>
      ))}
      <mesh position={[-0.2, 1.68, 0.34]} rotation={[0.3, 0, -0.15]}>
        <coneGeometry args={[0.1, 0.3, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.2, 1.68, 0.34]} rotation={[0.3, 0, 0.15]}>
        <coneGeometry args={[0.1, 0.3, 6]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.55, 0.9, 0.2]} castShadow>
        <boxGeometry args={[0.32, 0.6, 0.34]} />
        <meshStandardMaterial color={color} roughness={0.55} />
      </mesh>
      {/* spiked warhammer arm */}
      <group ref={weaponRef} position={[0.55, 0.9, 0.2]}>
        <mesh rotation={[0, 0, -0.1]} castShadow>
          <boxGeometry args={[0.32, 0.6, 0.34]} />
          <meshStandardMaterial color={color} roughness={0.55} />
        </mesh>
        <mesh position={[0.12, -0.55, 0]} rotation={[0, 0, -0.15]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.75, 8]} />
          <meshStandardMaterial color="#44403c" roughness={0.7} />
        </mesh>
        <mesh position={[0.2, -0.95, 0]} rotation={[0, 0, -0.15]} castShadow>
          <dodecahedronGeometry args={[0.24, 0]} />
          <meshStandardMaterial color="#292524" roughness={0.85} flatShading />
        </mesh>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={i} position={[0.2 + Math.cos((i / 4) * Math.PI * 2) * 0.22, -0.95 + Math.sin((i / 4) * Math.PI * 2) * 0.22, 0]}>
            <coneGeometry args={[0.05, 0.16, 5]} />
            <meshStandardMaterial color={accentColor} metalness={0.6} roughness={0.3} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function SandTitan({ color, accentColor, ...rest }: EnemyModelProps) {
  const { groupRef, weaponRef, bodyMatRef } = useCombatAnimator({ ...rest, scale: rest.scale ?? 2.1 });
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.55, 0]} rotation={[0.15, 0.3, 0]} castShadow>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial ref={bodyMatRef} color={color} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[0, 1.35, 0]} rotation={[0.1, 0.8, 0.1]} castShadow>
        <dodecahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial color={color} roughness={0.85} flatShading />
      </mesh>
      <mesh position={[-0.14, 1.5, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={accentColor} toneMapped={false} />
      </mesh>
      <mesh position={[0.14, 1.5, 0.35]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshBasicMaterial color={accentColor} toneMapped={false} />
      </mesh>
      <mesh position={[-0.62, 0.9, 0]} rotation={[0, 0.4, 0]} castShadow>
        <dodecahedronGeometry args={[0.32, 0]} />
        <meshStandardMaterial color={color} roughness={0.85} flatShading />
      </mesh>
      {/* boulder-fist arm */}
      <group ref={weaponRef} position={[0.62, 0.9, 0]}>
        <mesh rotation={[0, -0.4, 0]} castShadow>
          <dodecahedronGeometry args={[0.32, 0]} />
          <meshStandardMaterial color={color} roughness={0.85} flatShading />
        </mesh>
        <mesh position={[0.28, -0.15, 0]} rotation={[0, -0.4, 0]} castShadow>
          <dodecahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial color={accentColor} roughness={0.9} flatShading />
        </mesh>
      </group>
      <mesh position={[0, 0.05, 0.1]}>
        <cylinderGeometry args={[0.66, 0.7, 0.15, 8]} />
        <meshStandardMaterial color={accentColor} roughness={0.9} />
      </mesh>
    </group>
  );
}

function IceDragon({ color, accentColor, ...rest }: EnemyModelProps) {
  const { groupRef, weaponRef, bodyMatRef } = useCombatAnimator({ ...rest, scale: rest.scale ?? 2.0 });
  return (
    <group ref={groupRef}>
      <mesh position={[0, 1.0, 0]} rotation={[0.1, 0, 0]} castShadow>
        <capsuleGeometry args={[0.42, 0.9, 4, 10]} />
        <meshStandardMaterial ref={bodyMatRef} color={color} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* neck + head lunges forward as the "bite" attack */}
      <group ref={weaponRef} position={[0, 1.55, 0.55]}>
        <mesh rotation={[0.4, 0, 0]} castShadow>
          <capsuleGeometry args={[0.18, 0.5, 4, 8]} />
          <meshStandardMaterial color={color} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.3, 0.3]} castShadow>
          <coneGeometry args={[0.22, 0.5, 8]} />
          <meshStandardMaterial color={color} roughness={0.25} />
        </mesh>
        <mesh position={[-0.1, 0.35, 0.47]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={accentColor} toneMapped={false} />
        </mesh>
        <mesh position={[0.1, 0.35, 0.47]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial color={accentColor} toneMapped={false} />
        </mesh>
      </group>
      {/* wings */}
      <mesh position={[-0.55, 1.2, -0.1]} rotation={[0, 0.3, 0.5]} castShadow>
        <coneGeometry args={[0.55, 1.1, 3]} />
        <meshStandardMaterial color={accentColor} roughness={0.4} transparent opacity={0.88} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.55, 1.2, -0.1]} rotation={[0, -0.3, -0.5]} castShadow>
        <coneGeometry args={[0.55, 1.1, 3]} />
        <meshStandardMaterial color={accentColor} roughness={0.4} transparent opacity={0.88} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 0.55, -0.55]} rotation={[0.5, 0, 0]} castShadow>
        <coneGeometry args={[0.2, 0.9, 8]} />
        <meshStandardMaterial color={color} roughness={0.3} />
      </mesh>
    </group>
  );
}

function CyberOverlord({ color, accentColor, ...rest }: EnemyModelProps) {
  const { groupRef, weaponRef, bodyMatRef } = useCombatAnimator({ ...rest, scale: rest.scale ?? 2.0 });
  return (
    <group ref={groupRef}>
      <mesh position={[0, 1.2, 0]} rotation={[0.3, 0.4, 0]} castShadow>
        <icosahedronGeometry args={[0.68, 0]} />
        <meshStandardMaterial ref={bodyMatRef} color={color} metalness={0.75} roughness={0.2} />
      </mesh>
      <mesh position={[0, 1.2, 0]} rotation={[0.6, 0.2, 0.3]}>
        <torusGeometry args={[0.95, 0.03, 8, 32]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.2, 0]} rotation={[1.2, 0.8, 0.1]}>
        <torusGeometry args={[0.78, 0.025, 8, 32]} />
        <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.95, 0]} rotation={[0.2, 0.6, 0]}>
        <octahedronGeometry args={[0.28, 0]} />
        <meshStandardMaterial color={accentColor} metalness={0.8} roughness={0.1} emissive={accentColor} emissiveIntensity={0.6} />
      </mesh>
      {/* energy blade appendage */}
      <group ref={weaponRef} position={[0.75, 1.2, 0]}>
        <mesh rotation={[0, 0, -0.3]} castShadow>
          <coneGeometry args={[0.06, 0.65, 4]} />
          <meshStandardMaterial color={accentColor} emissive={accentColor} emissiveIntensity={1.3} metalness={0.6} roughness={0.15} toneMapped={false} />
        </mesh>
      </group>
      <pointLight position={[0, 1.2, 0]} color={accentColor} intensity={1.4} distance={3.5} />
    </group>
  );
}

export default function EnemyModel(props: EnemyModelProps) {
  switch (props.shape) {
    case 'orc':
      return (
        <Suspense fallback={<Orc {...props} />}>
          <OrcGLB {...props} />
        </Suspense>
      );
    case 'wolf':
      return (
        <Suspense fallback={<Wolf {...props} />}>
          <WolfGLB {...props} />
        </Suspense>
      );
    case 'skeleton':
      return (
        <Suspense fallback={<Skeleton {...props} />}>
          <SkeletonSwordGLB {...props} />
        </Suspense>
      );
    case 'darkmage':
      return (
        <Suspense fallback={<DarkMage {...props} />}>
          <DarkMageGLB {...props} />
        </Suspense>
      );
    case 'goblin_king':
      return (
        <Suspense fallback={<GoblinKing {...props} />}>
          <DarkKnightGLB {...props} />
        </Suspense>
      );
    case 'sand_titan':
      return (
        <Suspense fallback={<SandTitan {...props} />}>
          <SandTitanGLB {...props} />
        </Suspense>
      );
    case 'ice_dragon':
      return (
        <Suspense fallback={<IceDragon {...props} />}>
          <IceDragonGLB {...props} />
        </Suspense>
      );
    case 'cyber_overlord':
      return (
        <Suspense fallback={<CyberOverlord {...props} />}>
          <CyberOverlordGLB {...props} />
        </Suspense>
      );
    case 'goblin':
    default:
      return (
        <Suspense fallback={<Goblin {...props} />}>
          <GoblinGLB {...props} />
        </Suspense>
      );
  }
}
