import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';
import { Suspense, lazy } from 'react';
import type { HeroClassId, SkinDef, WeaponDef } from '../../../types';
import { useCombatAnimator } from '../../../game/useCombatAnimator';
import Weapon from '../Weapon';

// Only fetch these if the player actually picked that class.
const Hero2GLB = lazy(() => import('./Hero2GLB'));
const WarriorGLB = lazy(() => import('./WarriorGLB'));

export interface HeroModelProps {
  heroClass: HeroClassId;
  colors: SkinDef['colors'];
  weapon: WeaponDef;
  attackSeed: number;
  hitSeed: number;
  hitCrit?: boolean;
  victorySeed: number;
  dying: boolean;
}

const SKIN_TONE = '#f5d0a9';

function Knight({ colors, weapon, attackSeed, hitSeed, hitCrit, victorySeed }: HeroModelProps) {
  const { groupRef, weaponRef, bodyMatRef, trailMatRef } = useCombatAnimator({ attackSeed, hitSeed, hitCrit, victorySeed });
  return (
    <group ref={groupRef}>
      <mesh position={[-0.18, 0.4, 0]} castShadow>
        <boxGeometry args={[0.24, 0.8, 0.28]} />
        <meshStandardMaterial color={colors.primary} roughness={0.5} metalness={0.3} />
      </mesh>
      <mesh position={[0.18, 0.4, 0]} castShadow>
        <boxGeometry args={[0.24, 0.8, 0.28]} />
        <meshStandardMaterial color={colors.primary} roughness={0.5} metalness={0.3} />
      </mesh>
      <RoundedBox position={[0, 1.15, 0]} args={[0.68, 0.76, 0.4]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial ref={bodyMatRef} color={colors.primary} roughness={0.4} metalness={0.4} />
      </RoundedBox>
      <mesh position={[0, 1.15, 0.21]}>
        <boxGeometry args={[0.3, 0.3, 0.03]} />
        <meshStandardMaterial color={colors.accent} metalness={0.7} roughness={0.2} emissive={colors.glow} emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0, 1.05, -0.24]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[0.52, 0.95, 0.04]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.8} />
      </mesh>
      <mesh position={[0, 1.74, 0]} castShadow>
        <sphereGeometry args={[0.27, 16, 16]} />
        <meshStandardMaterial color={colors.primary} metalness={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[0, 1.7, 0.2]}>
        <boxGeometry args={[0.32, 0.07, 0.05]} />
        <meshStandardMaterial color={colors.accent} emissive={colors.glow} emissiveIntensity={0.8} toneMapped={false} />
      </mesh>
      <mesh position={[-0.44, 1.2, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.2, 0.56, 0.22]} />
        <meshStandardMaterial color={colors.primary} roughness={0.5} />
      </mesh>
      <mesh position={[-0.62, 1.15, 0.16]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.05, 0.5, 0.36]} />
        <meshStandardMaterial color={colors.secondary} metalness={0.5} roughness={0.4} />
      </mesh>
      <group ref={weaponRef} position={[0.44, 1.42, 0]}>
        <mesh position={[0, -0.24, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.2, 0.5, 0.22]} />
          <meshStandardMaterial color={colors.primary} roughness={0.5} />
        </mesh>
        <group position={[0.12, -0.5, 0.1]} rotation={[0, 0, -0.5]}>
          <Weapon weapon={weapon} trailMatRef={trailMatRef} />
        </group>
      </group>
    </group>
  );
}

function Ranger({ colors, weapon, attackSeed, hitSeed, hitCrit, victorySeed }: HeroModelProps) {
  const { groupRef, weaponRef, bodyMatRef, trailMatRef } = useCombatAnimator({ attackSeed, hitSeed, hitCrit, victorySeed });
  return (
    <group ref={groupRef}>
      <mesh position={[-0.14, 0.38, 0]} castShadow>
        <boxGeometry args={[0.17, 0.76, 0.2]} />
        <meshStandardMaterial color={colors.primary} roughness={0.6} />
      </mesh>
      <mesh position={[0.14, 0.38, 0]} castShadow>
        <boxGeometry args={[0.17, 0.76, 0.2]} />
        <meshStandardMaterial color={colors.primary} roughness={0.6} />
      </mesh>
      <RoundedBox position={[0, 1.1, 0]} args={[0.48, 0.68, 0.28]} radius={0.07} smoothness={4} castShadow>
        <meshStandardMaterial ref={bodyMatRef} color={colors.primary} roughness={0.55} />
      </RoundedBox>
      <mesh position={[0, 0.95, -0.02]}>
        <coneGeometry args={[0.36, 0.7, 4]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.75} />
      </mesh>
      <mesh position={[0, 1.62, 0]} castShadow>
        <sphereGeometry args={[0.22, 14, 14]} />
        <meshStandardMaterial color={SKIN_TONE} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.72, -0.02]} rotation={[0.3, 0, 0]}>
        <coneGeometry args={[0.26, 0.4, 12, 1, true]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.2, 1.05, -0.2]} rotation={[0.3, 0, 0.15]}>
        <cylinderGeometry args={[0.09, 0.09, 0.5, 8]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.6} />
      </mesh>
      <mesh position={[-0.36, 1.1, 0]} rotation={[0, 0, 0.25]} castShadow>
        <boxGeometry args={[0.15, 0.48, 0.16]} />
        <meshStandardMaterial color={colors.primary} roughness={0.55} />
      </mesh>
      <group ref={weaponRef} position={[0.36, 1.32, 0]}>
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, -0.15]} castShadow>
          <boxGeometry args={[0.15, 0.42, 0.16]} />
          <meshStandardMaterial color={colors.primary} roughness={0.55} />
        </mesh>
        <group position={[0.08, -0.42, 0.08]} rotation={[0, 0, -0.5]}>
          <Weapon weapon={weapon} trailMatRef={trailMatRef} />
        </group>
      </group>
    </group>
  );
}

function Mage({ colors, weapon, attackSeed, hitSeed, hitCrit, victorySeed }: HeroModelProps) {
  const { groupRef, weaponRef, bodyMatRef, trailMatRef } = useCombatAnimator({ attackSeed, hitSeed, hitCrit, victorySeed });
  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <coneGeometry args={[0.42, 1.5, 10]} />
        <meshStandardMaterial ref={bodyMatRef} color={colors.primary} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.15, 0]}>
        <torusGeometry args={[0.32, 0.035, 8, 20]} />
        <meshStandardMaterial color={colors.accent} emissive={colors.glow} emissiveIntensity={0.7} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.6, 0]} castShadow>
        <sphereGeometry args={[0.24, 14, 14]} />
        <meshStandardMaterial color={SKIN_TONE} roughness={0.7} />
      </mesh>
      <mesh position={[0, 2.0, 0]} rotation={[0, 0, 0.05]} castShadow>
        <coneGeometry args={[0.32, 0.6, 10]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.6} />
      </mesh>
      <mesh position={[-0.34, 1.1, 0]} rotation={[0, 0, 0.35]} castShadow>
        <boxGeometry args={[0.16, 0.5, 0.18]} />
        <meshStandardMaterial color={colors.primary} roughness={0.6} />
      </mesh>
      <group ref={weaponRef} position={[0.32, 1.28, 0]}>
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, -0.25]} castShadow>
          <boxGeometry args={[0.16, 0.44, 0.18]} />
          <meshStandardMaterial color={colors.primary} roughness={0.6} />
        </mesh>
        <group position={[0.08, -0.4, 0.05]} rotation={[0, 0, -0.35]}>
          <Weapon weapon={weapon} trailMatRef={trailMatRef} />
        </group>
      </group>
    </group>
  );
}

function Samurai({ colors, weapon, attackSeed, hitSeed, hitCrit, victorySeed }: HeroModelProps) {
  const { groupRef, weaponRef, bodyMatRef, trailMatRef } = useCombatAnimator({ attackSeed, hitSeed, hitCrit, victorySeed });
  return (
    <group ref={groupRef}>
      <mesh position={[-0.17, 0.4, 0]} castShadow>
        <boxGeometry args={[0.22, 0.8, 0.26]} />
        <meshStandardMaterial color={colors.primary} roughness={0.55} />
      </mesh>
      <mesh position={[0.17, 0.4, 0]} castShadow>
        <boxGeometry args={[0.22, 0.8, 0.26]} />
        <meshStandardMaterial color={colors.primary} roughness={0.55} />
      </mesh>
      <RoundedBox position={[0, 1.15, 0]} args={[0.6, 0.72, 0.36]} radius={0.08} smoothness={4} castShadow>
        <meshStandardMaterial ref={bodyMatRef} color={colors.primary} roughness={0.45} />
      </RoundedBox>
      {/* sode shoulder plates */}
      <mesh position={[-0.42, 1.42, 0]} rotation={[0, 0, 0.1]} castShadow>
        <boxGeometry args={[0.26, 0.32, 0.3]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0.42, 1.42, 0]} rotation={[0, 0, -0.1]} castShadow>
        <boxGeometry args={[0.26, 0.32, 0.3]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.4} metalness={0.3} />
      </mesh>
      <mesh position={[0, 1.72, 0]} castShadow>
        <sphereGeometry args={[0.26, 16, 16]} />
        <meshStandardMaterial color={SKIN_TONE} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.78, -0.02]}>
        <boxGeometry args={[0.3, 0.18, 0.28]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.98, -0.08]}>
        <sphereGeometry args={[0.07, 8, 8]} />
        <meshStandardMaterial color="#1c1917" roughness={0.6} />
      </mesh>
      <mesh position={[-0.4, 1.18, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.18, 0.5, 0.2]} />
        <meshStandardMaterial color={colors.primary} roughness={0.5} />
      </mesh>
      {/* sheathed saya at the hip */}
      <mesh position={[-0.3, 0.85, 0.12]} rotation={[0, 0, 0.5]}>
        <cylinderGeometry args={[0.035, 0.035, 0.75, 8]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.4} />
      </mesh>
      <group ref={weaponRef} position={[0.42, 1.42, 0]}>
        <mesh position={[0, -0.22, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.18, 0.48, 0.2]} />
          <meshStandardMaterial color={colors.primary} roughness={0.5} />
        </mesh>
        <group position={[0.1, -0.48, 0.1]} rotation={[0, 0, -0.5]}>
          <Weapon weapon={weapon} trailMatRef={trailMatRef} />
        </group>
      </group>
    </group>
  );
}

function CyberNinja({ colors, weapon, attackSeed, hitSeed, hitCrit, victorySeed }: HeroModelProps) {
  const { groupRef, weaponRef, bodyMatRef, trailMatRef } = useCombatAnimator({ attackSeed, hitSeed, hitCrit, victorySeed });
  return (
    <group ref={groupRef}>
      <mesh position={[-0.15, 0.4, 0]} castShadow>
        <boxGeometry args={[0.19, 0.8, 0.22]} />
        <meshStandardMaterial color={colors.primary} roughness={0.35} metalness={0.6} />
      </mesh>
      <mesh position={[0.15, 0.4, 0]} castShadow>
        <boxGeometry args={[0.19, 0.8, 0.22]} />
        <meshStandardMaterial color={colors.primary} roughness={0.35} metalness={0.6} />
      </mesh>
      <mesh position={[-0.15, 0.55, 0.1]}>
        <boxGeometry args={[0.03, 0.5, 0.02]} />
        <meshStandardMaterial color={colors.accent} emissive={colors.glow} emissiveIntensity={1} toneMapped={false} />
      </mesh>
      <RoundedBox position={[0, 1.12, 0]} args={[0.54, 0.66, 0.3]} radius={0.07} smoothness={4} castShadow>
        <meshStandardMaterial ref={bodyMatRef} color={colors.primary} roughness={0.3} metalness={0.6} />
      </RoundedBox>
      <mesh position={[0, 1.12, 0.16]}>
        <boxGeometry args={[0.06, 0.5, 0.02]} />
        <meshStandardMaterial color={colors.accent} emissive={colors.glow} emissiveIntensity={1.1} toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.05, -0.2]} rotation={[0.15, 0, 0]}>
        <boxGeometry args={[0.4, 0.7, 0.03]} />
        <meshStandardMaterial color={colors.secondary} roughness={0.6} />
      </mesh>
      <mesh position={[0, 1.68, 0]} castShadow>
        <sphereGeometry args={[0.24, 16, 16]} />
        <meshStandardMaterial color={colors.primary} roughness={0.3} metalness={0.5} />
      </mesh>
      <mesh position={[0, 1.68, 0.2]}>
        <boxGeometry args={[0.34, 0.06, 0.05]} />
        <meshStandardMaterial color={colors.accent} emissive={colors.glow} emissiveIntensity={1.4} toneMapped={false} />
      </mesh>
      <mesh position={[-0.4, 1.18, 0]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.16, 0.52, 0.18]} />
        <meshStandardMaterial color={colors.primary} roughness={0.35} metalness={0.5} />
      </mesh>
      <group ref={weaponRef} position={[0.4, 1.4, 0]}>
        <mesh position={[0, -0.2, 0]} rotation={[0, 0, -0.2]} castShadow>
          <boxGeometry args={[0.16, 0.46, 0.18]} />
          <meshStandardMaterial color={colors.primary} roughness={0.35} metalness={0.5} />
        </mesh>
        <group position={[0.09, -0.45, 0.08]} rotation={[0, 0, -0.5]}>
          <Weapon weapon={weapon} trailMatRef={trailMatRef} />
        </group>
      </group>
    </group>
  );
}

export default function HeroModel(props: HeroModelProps) {
  switch (props.heroClass) {
    case 'ranger':
      return <Ranger {...props} />;
    case 'mage':
      return <Mage {...props} />;
    case 'samurai':
      return (
        <Suspense fallback={<Samurai {...props} />}>
          <WarriorGLB {...props} />
        </Suspense>
      );
    case 'cyberninja':
      return <CyberNinja {...props} />;
    case 'knight':
    default:
      return (
        <Suspense fallback={<Knight {...props} />}>
          <Hero2GLB {...props} />
        </Suspense>
      );
  }
}
