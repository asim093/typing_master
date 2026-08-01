import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { timeScaleState } from './timeScale';

export interface CombatAnimatorOptions {
  /** Increment to trigger a forward dash + weapon swing. */
  attackSeed: number;
  /** Increment to trigger knockback + emissive flash. */
  hitSeed: number;
  hitCrit?: boolean;
  /** Increment (from a nonzero baseline) to trigger the victory pose. */
  victorySeed?: number;
  /** Held true to play the death/disintegrate sequence. */
  dying?: boolean;
  /** Base uniform scale (bosses run larger). */
  scale?: number;
}

export interface CombatAnimatorRefs {
  groupRef: React.RefObject<THREE.Group | null>;
  weaponRef: React.RefObject<THREE.Group | null>;
  bodyMatRef: React.RefObject<THREE.MeshStandardMaterial | null>;
  trailMatRef: React.RefObject<THREE.MeshBasicMaterial | null>;
}

export function useCombatAnimator({
  attackSeed,
  hitSeed,
  hitCrit,
  victorySeed = 0,
  dying = false,
  scale = 1,
}: CombatAnimatorOptions): CombatAnimatorRefs {
  const groupRef = useRef<THREE.Group>(null);
  const weaponRef = useRef<THREE.Group>(null);
  const bodyMatRef = useRef<THREE.MeshStandardMaterial>(null);
  const trailMatRef = useRef<THREE.MeshBasicMaterial>(null);

  const animTime = useRef(0);
  const attackT = useRef(1);
  const lastAttack = useRef(attackSeed);
  const hitT = useRef(0);
  const knockback = useRef(0);
  const lastHit = useRef(hitSeed);
  const victoryT = useRef(1);
  const lastVictory = useRef(victorySeed);
  const deathT = useRef(0);

  useFrame((_, rawDelta) => {
    const s = timeScaleState.value;
    const delta = rawDelta * s;
    animTime.current += delta;

    if (lastAttack.current !== attackSeed) {
      lastAttack.current = attackSeed;
      attackT.current = 0;
    }
    if (lastHit.current !== hitSeed) {
      lastHit.current = hitSeed;
      hitT.current = 1;
      knockback.current = hitCrit ? 1.6 : 1;
    }
    if (lastVictory.current !== victorySeed && victorySeed !== 0) {
      lastVictory.current = victorySeed;
      victoryT.current = 0;
    }

    attackT.current = Math.min(1, attackT.current + delta * 4.2);
    hitT.current = Math.max(0, hitT.current - delta * 3.5);
    knockback.current = Math.max(0, knockback.current - delta * 4.5);
    victoryT.current = Math.min(1, victoryT.current + delta * 1.4);
    deathT.current = dying ? Math.min(1, deathT.current + delta * 1.7) : 0;

    const t = attackT.current;
    // Close most of the gap to the opponent for an actual strike-range dash,
    // not just a lean-forward — this is the "real hit" contact motion.
    const dashPhase = Math.min(1, t / 0.4);
    const dash = 1 - Math.pow(1 - dashPhase, 3);
    const recoverPhase = Math.max(0, (t - 0.4) / 0.6);
    const recover = recoverPhase * recoverPhase;
    const LUNGE_DISTANCE = 3.05;
    const lunge = dash * LUNGE_DISTANCE - recover * LUNGE_DISTANCE;
    const swing = dash * -2.5 + recover * 2.5;
    const attackSquash = Math.sin(Math.min(1, dashPhase) * Math.PI) * 0.08;

    const victoryPlaying = victoryT.current < 1;
    const vT = victoryT.current;
    const victoryHop = victoryPlaying ? Math.sin(Math.min(1, vT * 2.2) * Math.PI) * 0.35 : 0;
    const victorySpin = victoryPlaying ? Math.sin(vT * Math.PI) * 0.6 : 0;

    const idle = Math.sin(animTime.current * 2) * 0.045;
    const punch = Math.sin(hitT.current * Math.PI) * (hitCrit ? 0.3 : 0.18);
    const recoil = knockback.current * 0.55;
    const squashSum = attackSquash + punch;

    const g = groupRef.current;
    if (g) {
      if (dying) {
        const d = deathT.current;
        g.position.y = idle - d * 0.9;
        g.position.z = 0;
        g.rotation.x = 0;
        g.rotation.z = d * 1.15;
        g.rotation.y = 0;
        g.scale.setScalar(scale * Math.max(0.02, 1 - d));
      } else if (victoryPlaying) {
        g.position.y = idle + victoryHop;
        g.position.z = 0;
        g.rotation.x = 0;
        g.rotation.y = victorySpin;
        g.rotation.z = 0;
        g.scale.setScalar(scale);
      } else {
        g.position.y = idle;
        g.position.z = lunge - recoil;
        g.rotation.y = lunge * 0.02;
        g.rotation.x = -dash * 0.12 + recover * 0.12;
        g.rotation.z = -knockback.current * 0.16;
        g.scale.set(
          scale * (1 - squashSum * 0.4),
          scale * (1 + squashSum),
          scale * (1 - squashSum * 0.4),
        );
      }
    }
    if (weaponRef.current) {
      weaponRef.current.rotation.x = victoryPlaying ? Math.sin(vT * Math.PI * 2) * 0.4 - 0.6 : swing;
    }
    if (trailMatRef.current) {
      const visible = !victoryPlaying && !dying && dashPhase > 0.05 && dashPhase < 0.9 && t < 0.45;
      trailMatRef.current.opacity = visible ? (1 - dashPhase) * 0.7 : 0;
    }
    if (bodyMatRef.current) {
      const flash = hitT.current * 0.6;
      bodyMatRef.current.emissive.setRGB(flash, flash * (hitCrit ? 0.85 : 0.3), flash * 0.5);
      bodyMatRef.current.emissiveIntensity = 1 + hitT.current * (hitCrit ? 1.4 : 0.8);
    }
  });

  return { groupRef, weaponRef, bodyMatRef, trailMatRef };
}
