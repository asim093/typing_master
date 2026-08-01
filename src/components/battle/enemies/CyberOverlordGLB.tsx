import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { useCombatAnimator } from '../../../game/useCombatAnimator';
import { assetUrl } from '../../../game/assetUrl';
import { findFirstStandardMaterial, normalizeGLTFScene } from '../glbUtils';
import type { EnemyModelProps } from './EnemyModel';

const MODEL_URL = assetUrl('/demonic_horned_horror_knight.glb');
useGLTF.preload(MODEL_URL);

export default function CyberOverlordGLB({ attackSeed, hitSeed, hitCrit, dying, scale }: EnemyModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => normalizeGLTFScene(scene, 3.4), [scene]);
  const { groupRef, bodyMatRef } = useCombatAnimator({ attackSeed, hitSeed, hitCrit, dying, scale: scale ?? 1 });

  useEffect(() => {
    bodyMatRef.current = findFirstStandardMaterial(model);
  }, [model, bodyMatRef]);

  return (
    <group ref={groupRef}>
      {/* Turn to a 3/4 profile toward the hero (right side to camera) instead of squaring up to the audience. */}
      <group rotation={[0, -Math.PI / 2, 0]}>
        <primitive object={model} />
      </group>
    </group>
  );
}
