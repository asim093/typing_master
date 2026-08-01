import { useMemo } from 'react';
import * as THREE from 'three';

interface GradientSkyProps {
  top: string;
  horizon: string;
}

// The two sky colors were already part of each world's palette but only the
// horizon one was ever used, as a flat `<color attach="background">`. A tiny
// vertical-gradient texture painted on a big inverted sphere gives real depth
// to the sky for the cost of one extra draw call — no shaders, no per-frame
// work, computed once and cached per world.
function buildGradientTexture(top: string, horizon: string) {
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 64;
  const ctx = canvas.getContext('2d')!;
  const gradient = ctx.createLinearGradient(0, 0, 0, 64);
  gradient.addColorStop(0, top);
  gradient.addColorStop(1, horizon);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function GradientSky({ top, horizon }: GradientSkyProps) {
  const texture = useMemo(() => buildGradientTexture(top, horizon), [top, horizon]);

  return (
    <mesh scale={[-1, 1, 1]} renderOrder={-1}>
      <sphereGeometry args={[60, 16, 12]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} depthWrite={false} fog={false} toneMapped={false} />
    </mesh>
  );
}
