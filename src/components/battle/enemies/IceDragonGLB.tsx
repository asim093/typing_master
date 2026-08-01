import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { useCombatAnimator } from '../../../game/useCombatAnimator';
import { assetUrl } from '../../../game/assetUrl';
import { findFirstStandardMaterial, normalizeGLTFScene } from '../glbUtils';
import type { EnemyModelProps } from './EnemyModel';

const MODEL_URL = assetUrl('/magma_fire_dragon_knight.glb');
useGLTF.preload(MODEL_URL);

export default function IceDragonGLB({ attackSeed, hitSeed, hitCrit, dying, scale }: EnemyModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => normalizeGLTFScene(scene, 3.0), [scene]);
  const { groupRef, bodyMatRef } = useCombatAnimator({ attackSeed, hitSeed, hitCrit, dying, scale: scale ?? 1 });

  useEffect(() => {
    bodyMatRef.current = findFirstStandardMaterial(model);
  }, [model, bodyMatRef]);

  return (
    <group ref={groupRef}>
      {/* Was facing away from the hero (screen-right) — flip 180deg so it turns to face the hero on screen-left. */}
      <group rotation={[0, -Math.PI / 2, 0]}>
        <primitive object={model} />
      </group>
    </group>
  );
}
