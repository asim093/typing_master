import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import { playSfx } from '../../../game/audio';

// Random lightning strikes: a bright flickering light burst + thunder SFX,
// used by storm-weather worlds for a dramatic night-battle atmosphere.
export default function LightningFlash() {
  const lightRef = useRef<THREE.PointLight>(null);
  const elapsed = useRef(0);
  const nextStrike = useRef(1.5 + Math.random() * 3);
  const flashT = useRef(0);

  useFrame((_, delta) => {
    elapsed.current += delta;

    if (flashT.current <= 0 && elapsed.current > nextStrike.current) {
      flashT.current = 0.22;
      playSfx('thunder');
      nextStrike.current = elapsed.current + 6 + Math.random() * 10;
    }

    if (flashT.current > 0) {
      flashT.current = Math.max(0, flashT.current - delta);
      const flicker = Math.random() > 0.35 ? 1 : 0.3;
      const t = flashT.current / 0.22;
      if (lightRef.current) lightRef.current.intensity = t * 7 * flicker;
    } else if (lightRef.current) {
      lightRef.current.intensity = 0;
    }
  });

  return <pointLight ref={lightRef} position={[0, 14, -8]} color="#cfe0ff" intensity={0} distance={45} decay={1.2} />;
}
