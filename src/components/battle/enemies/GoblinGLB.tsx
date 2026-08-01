import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { useCombatAnimator } from '../../../game/useCombatAnimator';
import { assetUrl } from '../../../game/assetUrl';
import { findFirstStandardMaterial, normalizeGLTFScene } from '../glbUtils';
import type { EnemyModelProps } from './EnemyModel';

const MODEL_URL = assetUrl('/dark_nature_hybrid_warrior.glb');
useGLTF.preload(MODEL_URL);

export default function GoblinGLB({ attackSeed, hitSeed, hitCrit, dying, scale }: EnemyModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => normalizeGLTFScene(scene, 1.7), [scene]);
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
