import { useGLTF } from '@react-three/drei';
import { useEffect, useMemo } from 'react';
import { useCombatAnimator } from '../../../game/useCombatAnimator';
import { assetUrl } from '../../../game/assetUrl';
import { findFirstStandardMaterial, normalizeGLTFScene, tintModelMaterials } from '../glbUtils';
import { getSkin, defaultSkinForHero } from '../../../data/skins';
import type { HeroModelProps } from './HeroModel';

const MODEL_URL = assetUrl('/executioner_warrior_-_hooded_axe__armor.glb');
useGLTF.preload(MODEL_URL);

export default function WarriorGLB({ heroClass, colors, attackSeed, hitSeed, hitCrit, victorySeed }: HeroModelProps) {
  const { scene } = useGLTF(MODEL_URL);
  const model = useMemo(() => normalizeGLTFScene(scene, 1.95), [scene]);
  const { groupRef, bodyMatRef } = useCombatAnimator({
    attackSeed,
    hitSeed,
    hitCrit,
    victorySeed,
    idleBobAmplitude: 0,
  });

  useEffect(() => {
    bodyMatRef.current = findFirstStandardMaterial(model);
  }, [model, bodyMatRef]);

  // This GLB ships with one shared, texture-driven material across the whole
  // mesh (see glbUtils.tintModelMaterials) — skin selection previously had
  // nothing to actually change on screen for this class. The "Default" skin
  // should show the armor's own authored texture colors untouched — only
  // the alternate skins get recolored. This model is now reused across
  // whichever class it's assigned to (Knight originally, Samurai now), so
  // "default" has to be resolved against *that* class's own default skin,
  // not a hardcoded one — otherwise every other class's "Default" also
  // gets needlessly tinted.
  useEffect(() => {
    const isDefault = colors === getSkin(defaultSkinForHero(heroClass)).colors;
    tintModelMaterials(model, isDefault ? '#ffffff' : colors.primary, isDefault ? '#000000' : colors.accent);
  }, [model, colors, heroClass]);

  return (
    <group ref={groupRef}>
      <group rotation={[0, -Math.PI / 2, 0]}>
        <primitive object={model} />
      </group>
    </group>
  );
}
