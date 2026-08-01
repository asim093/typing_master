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
  /**
   * Peak height of the idle breathing sway, applied as ± this value around
   * the model's already-grounded Y=0 — so on the low half of the cycle the
   * feet sink this far below the floor. Fine at the default for a small
   * placeholder mesh; visibly clips a detailed character's feet through
   * the ground, so real-model heroes pass 0 to turn it off entirely.
   */
  idleBobAmplitude?: number;
  /**
   * How far the whole group dashes toward the target on attack, in world
   * units. On a real character this position jump has repeatedly shown up
   * as an instant teleport rather than visible movement (confirmed on
   * video) — capping/slowing the underlying delta didn't fully fix it, so
   * real-model heroes pass 0 to remove the position change outright. The
   * hit still reads from the scale-squash pulse, any skeletal swing clip,
   * and the damage number/HP bar, none of which can "teleport".
   */
  lungeDistance?: number;
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
  idleBobAmplitude = 0.045,
  lungeDistance = 3.05,
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
    // A frame hitch (asset load, GC pause, a heavy new action starting —
    // exactly what tends to happen the instant an attack triggers) can
    // hand us a huge rawDelta. Without a cap, that single frame advances
    // attackT/animTime through the whole dash-and-recover arc at once, so
    // the character never visibly moves through it — it reads as
    // teleporting to the attack position and back instead of running
    // there. Capping to a 24fps-equivalent step spreads a hitch's
    // "lost" time across the next few frames instead of skipping it.
    const clampedDelta = Math.min(rawDelta, 1 / 24);
    const delta = clampedDelta * s;
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

    // Whole dash+recover arc runs ~0.67s (0.27s out, 0.4s back). The
    // original 4.2 finished the entire thing in 0.24s — far too few frames
    // to read as movement, so it looked like a snap rather than a dash.
    // The out-phase here is what HERO_CONTACT_DELAY_MS in useCombatEngine
    // is timed against; changing this rate means revisiting that constant.
    attackT.current = Math.min(1, attackT.current + delta * 1.5);
    hitT.current = Math.max(0, hitT.current - delta * 3.5);
    knockback.current = Math.max(0, knockback.current - delta * 4.5);
    victoryT.current = Math.min(1, victoryT.current + delta * 1.4);
    deathT.current = dying ? Math.min(1, deathT.current + delta * 1.7) : 0;

    const t = attackT.current;
    // Close most of the gap to the opponent for an actual strike-range dash,
    // not just a lean-forward — this is the "real hit" contact motion.
    const dashPhase = Math.min(1, t / 0.4);
    // Smoothstep (accelerate out of idle, decelerate into the hit) rather
    // than a cubic ease-out. The ease-out was so front-loaded it covered a
    // third of the distance in the first two frames — which is what made
    // the dash read as a snap/teleport instead of the hero running over.
    const dash = dashPhase * dashPhase * (3 - 2 * dashPhase);
    const recoverPhase = Math.max(0, (t - 0.4) / 0.6);
    const recover = recoverPhase * recoverPhase;
    const lunge = dash * lungeDistance - recover * lungeDistance;
    // The forward/backward pitch-tilt below was designed as part of the
    // same lunge motion (lean into the dash, lean back on recovery) — with
    // lungeDistance at 0 there's no position change to go with that tilt
    // anymore, so it reads as the character rocking in place instead of
    // leaning into a step. Scaling it by the same knob keeps them as one
    // concept instead of two independently-tunable ones.
    const lungeIntensity = lungeDistance / 3.05;
    const swing = dash * -2.5 + recover * 2.5;
    const attackSquash = Math.sin(Math.min(1, dashPhase) * Math.PI) * 0.08;

    const victoryPlaying = victoryT.current < 1;
    const vT = victoryT.current;
    const victoryHop = victoryPlaying ? Math.sin(Math.min(1, vT * 2.2) * Math.PI) * 0.35 : 0;
    const victorySpin = victoryPlaying ? Math.sin(vT * Math.PI) * 0.6 : 0;

    const idle = Math.sin(animTime.current * 2) * idleBobAmplitude;
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
        g.rotation.x = (-dash * 0.12 + recover * 0.12) * lungeIntensity;
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
