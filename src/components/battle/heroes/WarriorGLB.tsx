import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { useCombatAnimator } from '../../../game/useCombatAnimator';
import { assetUrl } from '../../../game/assetUrl';
import { findFirstStandardMaterial, normalizeGLTFScene } from '../glbUtils';
import type { HeroModelProps } from './HeroModel';

const MODEL_URL = assetUrl('/executioner_warrior_-_hooded_axe__armor.glb');
useGLTF.preload(MODEL_URL);

export default function WarriorGLB({ attackSeed, hitSeed, hitCrit, victorySeed }: HeroModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => normalizeGLTFScene(scene, 1.95), [scene]);
  const { groupRef, bodyMatRef } = useCombatAnimator({ attackSeed, hitSeed, hitCrit, victorySeed });

  useEffect(() => {
    bodyMatRef.current = findFirstStandardMaterial(model);
  }, [model, bodyMatRef]);

  return (
    <group ref={groupRef}>
      <group rotation={[0, -Math.PI / 2, 0]}>
        <primitive object={model} />
      </group>
    </group>
  );
}
