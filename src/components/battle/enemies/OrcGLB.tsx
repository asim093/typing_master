import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo, useRef } from 'react';
import { useCombatAnimator } from '../../../game/useCombatAnimator';
import { assetUrl } from '../../../game/assetUrl';
import { findFirstStandardMaterial, normalizeGLTFScene, extractWeaponToGroup } from '../glbUtils';
import type { EnemyModelProps } from './EnemyModel';

const MODEL_URL = assetUrl('/skeleton_elite.glb');
useGLTF.preload(MODEL_URL);

export default function OrcGLB({ attackSeed, hitSeed, hitCrit, dying, scale }: EnemyModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => normalizeGLTFScene(scene, 2.05), [scene]);
  const { groupRef, weaponRef, bodyMatRef } = useCombatAnimator({ attackSeed, hitSeed, hitCrit, dying, scale: scale ?? 1 });
  const extracted = useRef(false);

  useEffect(() => {
    bodyMatRef.current = findFirstStandardMaterial(model);
  }, [model, bodyMatRef]);

  useEffect(() => {
    if (extracted.current || !weaponRef.current) return;
    // This model ships its weapon as a separate node ("Skeleton_Preview"),
    // unlike the other fused-mesh GLBs — pull it out so it actually swings
    // on attack instead of the whole body just lunging forward.
    extracted.current = extractWeaponToGroup(model, 'Skeleton_Preview', weaponRef.current);
  }, [model, weaponRef]);

  return (
    <group ref={groupRef}>
      {/* Was facing away from the hero (screen-right) — flip 180deg so it turns to face the hero on screen-left. */}
      <group rotation={[0, 0, 0]}>
        <primitive object={model} />
        <group ref={weaponRef} />
      </group>
    </group>
  );
}
