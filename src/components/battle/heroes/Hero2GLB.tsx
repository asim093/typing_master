import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useCombatAnimator } from '../../../game/useCombatAnimator';
import { assetUrl } from '../../../game/assetUrl';
import { timeScaleState } from '../../../game/timeScale';
import { stripTrackPrefix, stripRootMotion, scaleRootMotion } from '../../../game/retargetAnimation';
import { findFirstStandardMaterial, normalizeGLTFScene, tintModelMaterials } from '../glbUtils';
import { getSkin, defaultSkinForHero } from '../../../data/skins';
import type { HeroModelProps } from './HeroModel';

const MODEL_URL = assetUrl('/hero2.glb');
const ATTACK_URLS = [
  assetUrl('/great_sword_attack.glb'),
  assetUrl('/attack_horizontal.glb'),
  assetUrl('/attack_combo.glb'),
];
const DEATH_URL = assetUrl('/death.glb');
useGLTF.preload(MODEL_URL);
ATTACK_URLS.forEach((url) => useGLTF.preload(url));
useGLTF.preload(DEATH_URL);

// See WarriorGLB — same reasoning: "Default" shows the model's own authored
// texture untouched, alternate skins get tinted.
const DEFAULT_KNIGHT_COLORS = getSkin(defaultSkinForHero('knight')).colors;

// The downloaded clips are wildly different lengths (roughly 2.2s, 2.4s and
// 4.6s at authored speed), so a single shared playback rate would make one
// swing feel snappy and the combo drag on well after the hero has already
// returned home. Each clip instead gets its own rate derived from its own
// duration, targeting a swing that finishes near the end of the lunge
// cycle (~0.67s, see useCombatAnimator). Clamped so nothing is slowed to a
// crawl or sped up into a blur — the long combo lands at the top of the
// range and reads as a quick flurry, which is what it should look like.
const TARGET_ATTACK_DURATION_S = 0.8;
const MIN_ATTACK_TIME_SCALE = 1.4;
const MAX_ATTACK_TIME_SCALE = 3.2;

// Every clip here plays strictly *in place* — the hero's actual travel to
// the enemy is the group-level lunge in useCombatAnimator, and the impact
// is timed against that lunge (HERO_CONTACT_DELAY_MS in useCombatEngine),
// not against any of these clips. So clip lengths can differ freely
// without desyncing the hit; they only change how the swing itself reads.
export default function Hero2GLB({ colors, attackSeed, hitSeed, hitCrit, victorySeed, dying }: HeroModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  // Hook order has to stay fixed, so each clip gets its own call rather
  // than mapping over the URL list.
  const { animations: attackAnims0 } = useGLTF(ATTACK_URLS[0]);
  const { animations: attackAnims1 } = useGLTF(ATTACK_URLS[1]);
  const { animations: attackAnims2 } = useGLTF(ATTACK_URLS[2]);
  const { animations: deathAnims } = useGLTF(DEATH_URL);
  const model = useMemo(() => normalizeGLTFScene(scene, 1.95), [scene]);
  const { groupRef, bodyMatRef } = useCombatAnimator({
    attackSeed,
    hitSeed,
    hitCrit,
    victorySeed,
    idleBobAmplitude: 0,
  });

  const mixer = useMemo(() => new THREE.AnimationMixer(model), [model]);

  // Snapshot of every bone's bind-pose transform, captured once. Mixamo
  // clips don't reliably end back at a neutral facing/pose — once the
  // swing finishes we explicitly restore every bone to this snapshot
  // instead of trusting the clip's own last frame.
  const bindPose = useMemo(() => {
    const map = new Map<THREE.Bone, { position: THREE.Vector3; quaternion: THREE.Quaternion; scale: THREE.Vector3 }>();
    model.traverse((obj) => {
      if (obj instanceof THREE.Bone) {
        map.set(obj, { position: obj.position.clone(), quaternion: obj.quaternion.clone(), scale: obj.scale.clone() });
      }
    });
    return map;
  }, [model]);

  const restoreBindPose = () => {
    bindPose.forEach((pose, bone) => {
      bone.position.copy(pose.position);
      bone.quaternion.copy(pose.quaternion);
      bone.scale.copy(pose.scale);
    });
  };

  // Root motion stripped: these play in place, at the hero's fixed spot.
  const attackActions = useMemo(() => {
    const raws = [attackAnims0[0], attackAnims1[0], attackAnims2[0]];
    return raws
      .filter((raw): raw is THREE.AnimationClip => !!raw)
      .map((raw) => {
        const clip = stripRootMotion(stripTrackPrefix(raw, 'mixamorig'), 'Hips');
        const action = mixer.clipAction(clip);
        action.loop = THREE.LoopOnce;
        action.clampWhenFinished = true;
        action.setEffectiveTimeScale(
          THREE.MathUtils.clamp(
            clip.duration / TARGET_ATTACK_DURATION_S,
            MIN_ATTACK_TIME_SCALE,
            MAX_ATTACK_TIME_SCALE,
          ),
        );
        return action;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixer, attackAnims0, attackAnims1, attackAnims2]);

  // Root motion is kept for death — the collapse-to-ground travel is what
  // sells the character going down — but it has to be rescaled first. The
  // clip's hips open at 0.943 while this rig stands at ~0.574, and a root
  // track is absolute, so playing it raw yanked the hero ~0.7 world units
  // into the air on the first frame before dropping. See scaleRootMotion.
  const deathAction = useMemo(() => {
    const raw = deathAnims[0];
    if (!raw) return null;
    const hipsBaseY = model.getObjectByName('Hips')?.position.y ?? 0;
    const clip = scaleRootMotion(stripTrackPrefix(raw, 'mixamorig'), 'Hips', hipsBaseY);
    const action = mixer.clipAction(clip);
    action.loop = THREE.LoopOnce;
    action.clampWhenFinished = true;
    return action;
  }, [mixer, deathAnims, model]);

  useEffect(() => {
    const onFinished = (event: { action: THREE.AnimationAction }) => {
      if (attackActions.includes(event.action)) {
        event.action.stop();
        restoreBindPose();
      }
    };
    mixer.addEventListener('finished', onFinished);
    return () => mixer.removeEventListener('finished', onFinished);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mixer, attackActions]);

  // A different swing is picked per attack so repeated hits don't look
  // identical. Any still-running swing is stopped first — with three clips
  // of differing lengths a fast typist can easily start the next attack
  // mid-swing, and leaving the old one running would blend two poses.
  const lastAttackSeed = useRef(attackSeed);
  useEffect(() => {
    if (dying) return;
    if (lastAttackSeed.current === attackSeed) return;
    lastAttackSeed.current = attackSeed;
    if (attackActions.length === 0) return;
    const pick = attackActions[Math.floor(Math.random() * attackActions.length)];
    attackActions.forEach((a) => a !== pick && a.stop());
    pick.reset().play();
  }, [attackSeed, attackActions, dying]);

  const hasPlayedDeath = useRef(false);
  useEffect(() => {
    if (!dying) {
      // Retry after a defeat: stand back up if the death clip had played.
      if (hasPlayedDeath.current) {
        deathAction?.stop();
        restoreBindPose();
      }
      hasPlayedDeath.current = false;
      return;
    }
    if (hasPlayedDeath.current || !deathAction) return;
    hasPlayedDeath.current = true;
    attackActions.forEach((a) => a.stop());
    deathAction.reset().play();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dying, deathAction]);

  useFrame((_, rawDelta) => {
    // Same reasoning as useCombatAnimator: an unclamped delta after a frame
    // hitch would jump the mixer far into a clip in one step instead of
    // playing through it, reading as the pose snapping instead of moving.
    mixer.update(Math.min(rawDelta, 1 / 24) * timeScaleState.value);
  });

  useEffect(() => {
    bodyMatRef.current = findFirstStandardMaterial(model);
  }, [model, bodyMatRef]);

  useEffect(() => {
    const isDefault = colors === DEFAULT_KNIGHT_COLORS;
    tintModelMaterials(model, isDefault ? '#ffffff' : colors.primary, isDefault ? '#000000' : colors.accent);
  }, [model, colors]);

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}
