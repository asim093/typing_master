import { useFrame, useThree } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { ENEMY_POS } from './positions';
import { prefersReducedMotion } from '../../utils/motion';

interface CameraRigProps {
  shakeSeed: number;
  bossIntro: boolean;
}

// Side-on "versus" framing: hero and enemy sit on the same Z line,
// camera looks straight down that line for a flat, fighting-game profile shot.
const BASE_POS = new THREE.Vector3(0, 2.0, 9.0);
const LOOK_AT = new THREE.Vector3(0, 1.3, 0);
const INTRO_POS = new THREE.Vector3(0.7, 1.9, 4.0);
const INTRO_LOOK = new THREE.Vector3(ENEMY_POS[0] - 0.2, 1.9, ENEMY_POS[2]);
const SHAKE_DURATION = 0.32;

export default function CameraRig({ shakeSeed, bossIntro }: CameraRigProps) {
  const { camera } = useThree();
  const shakeTime = useRef(0);
  const shakeIntensity = useRef(0);
  const punchIntensity = useRef(0);
  const lastSeed = useRef(shakeSeed);
  const tmp = useRef(new THREE.Vector3());
  const lookTmp = useRef(new THREE.Vector3().copy(LOOK_AT));
  const dollyDir = useRef(new THREE.Vector3().subVectors(LOOK_AT, BASE_POS).normalize());
  const reduceMotion = useRef(prefersReducedMotion());

  useFrame((_, delta) => {
    if (lastSeed.current !== shakeSeed) {
      const jump = shakeSeed - lastSeed.current;
      const scale = reduceMotion.current ? 0.15 : 1;
      lastSeed.current = shakeSeed;
      shakeTime.current = SHAKE_DURATION;
      shakeIntensity.current = Math.min(0.6, shakeIntensity.current + 0.16 * jump * scale);
      punchIntensity.current = Math.min(0.85, punchIntensity.current + 0.32 * jump * scale);
    }

    const targetPos = bossIntro ? INTRO_POS : BASE_POS;
    const targetLook = bossIntro ? INTRO_LOOK : LOOK_AT;
    lookTmp.current.lerp(targetLook, 0.06);

    if (!bossIntro && shakeTime.current > 0) {
      shakeTime.current = Math.max(0, shakeTime.current - delta);
      const decay = shakeTime.current / SHAKE_DURATION;
      const amt = shakeIntensity.current * decay;
      const dollyAmt = punchIntensity.current * decay * decay;
      tmp.current
        .copy(BASE_POS)
        .addScaledVector(dollyDir.current, dollyAmt)
        .set(
          BASE_POS.x + (Math.random() - 0.5) * amt,
          BASE_POS.y + (Math.random() - 0.5) * amt * 0.7,
          tmp.current.z + (Math.random() - 0.5) * amt * 0.4,
        );
      camera.position.lerp(tmp.current, 0.92);
      if (shakeTime.current === 0) {
        shakeIntensity.current = 0;
        punchIntensity.current = 0;
      }
    } else {
      camera.position.lerp(targetPos, bossIntro ? 0.045 : 0.08);
    }
    camera.lookAt(lookTmp.current);
  });

  return null;
}
