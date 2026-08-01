import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
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

// Half the horizontal span the framing must always contain: the fighters sit
// at x = ±2.15, plus enough room for their models and weapons.
const FIT_HALF_WIDTH = 3.5;
// A phone in portrait is far taller than it is wide. Three's `fov` is
// *vertical*, so horizontal coverage collapses as aspect drops — at the
// authored 36° the hero fell completely off the left edge on a phone. A
// wider lens on portrait keeps the pull-back needed to fit both fighters
// from becoming so extreme that they turn into specks.
const PORTRAIT_FOV = 52;
const LANDSCAPE_FOV = 36;
const MAX_PULLBACK = 18;
const LOOK_AT = new THREE.Vector3(0, 1.3, 0);
const INTRO_POS = new THREE.Vector3(0.7, 1.9, 4.0);
const INTRO_LOOK = new THREE.Vector3(ENEMY_POS[0] - 0.2, 1.9, ENEMY_POS[2]);
const SHAKE_DURATION = 0.32;

export default function CameraRig({ shakeSeed, bossIntro }: CameraRigProps) {
  const { camera, size } = useThree();
  const basePos = useRef(new THREE.Vector3().copy(BASE_POS));
  const shakeTime = useRef(0);
  const shakeIntensity = useRef(0);
  const punchIntensity = useRef(0);
  const lastSeed = useRef(shakeSeed);
  const tmp = useRef(new THREE.Vector3());
  const lookTmp = useRef(new THREE.Vector3().copy(LOOK_AT));
  const dollyDir = useRef(new THREE.Vector3().subVectors(LOOK_AT, BASE_POS).normalize());
  const reduceMotion = useRef(prefersReducedMotion());

  // Re-fit the framing whenever the viewport shape changes (rotation, resize,
  // or the mobile keyboard opening and shrinking the visible area).
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    if (!cam.isPerspectiveCamera) return;
    const aspect = size.width / Math.max(1, size.height);
    const fov = aspect < 1 ? PORTRAIT_FOV : LANDSCAPE_FOV;
    // Distance at which FIT_HALF_WIDTH exactly fills the horizontal view.
    // Horizontal half-angle is derived from the vertical fov and aspect.
    const halfH = Math.tan(THREE.MathUtils.degToRad(fov / 2));
    const needed = FIT_HALF_WIDTH / Math.max(0.0001, halfH * aspect);
    cam.fov = fov;
    cam.position.z = THREE.MathUtils.clamp(Math.max(BASE_POS.z, needed), BASE_POS.z, MAX_PULLBACK);
    cam.updateProjectionMatrix();
    // The rest of the rig lerps toward this, so it has to move too or the
    // next frame would drag the camera straight back to the desktop framing.
    basePos.current.set(BASE_POS.x, BASE_POS.y, cam.position.z);
    dollyDir.current.subVectors(LOOK_AT, basePos.current).normalize();
  }, [camera, size.width, size.height]);

  useFrame((_, delta) => {
    if (lastSeed.current !== shakeSeed) {
      const jump = shakeSeed - lastSeed.current;
      const scale = reduceMotion.current ? 0.15 : 1;
      lastSeed.current = shakeSeed;
      shakeTime.current = SHAKE_DURATION;
      shakeIntensity.current = Math.min(0.6, shakeIntensity.current + 0.16 * jump * scale);
      punchIntensity.current = Math.min(0.85, punchIntensity.current + 0.32 * jump * scale);
    }

    const targetPos = bossIntro ? INTRO_POS : basePos.current;
    const targetLook = bossIntro ? INTRO_LOOK : LOOK_AT;
    lookTmp.current.lerp(targetLook, 0.06);

    if (!bossIntro && shakeTime.current > 0) {
      shakeTime.current = Math.max(0, shakeTime.current - delta);
      const decay = shakeTime.current / SHAKE_DURATION;
      const amt = shakeIntensity.current * decay;
      const dollyAmt = punchIntensity.current * decay * decay;
      tmp.current
        .copy(basePos.current)
        .addScaledVector(dollyDir.current, dollyAmt)
        .set(
          basePos.current.x + (Math.random() - 0.5) * amt,
          basePos.current.y + (Math.random() - 0.5) * amt * 0.7,
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
