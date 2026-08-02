import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';

interface ArenaEnvironmentProps {
  skyTop: string;
  skyHorizon: string;
  ground: string;
  /** Warm/cool tint of the key light, used for the specular highlight. */
  keyLight: string;
}

/**
 * Image-based lighting for the arena, generated procedurally from the
 * world's own palette.
 *
 * Every metallic material in this project (armour, blades, ice plates, cyber
 * platforms) was rendering nearly black. That isn't a lighting bug — it's
 * how PBR works: `metalness` means a surface draws its colour from
 * *reflections* rather than diffuse shading, so with no environment to
 * reflect there is simply nothing for it to show. Lights alone can't fix it;
 * they only add specular pinpoints, which is why the armour read as flat
 * plastic no matter how many point lights were aimed at it.
 *
 * A real HDRI would mean downloading a multi-megabyte asset at runtime, so
 * instead this paints a tiny equirectangular gradient — sky overhead,
 * horizon band, ground below, plus a soft sun blob for a believable
 * specular streak — and runs it through PMREM to get properly blurred
 * roughness mips. It costs one small canvas and one prefilter pass per
 * world, and nothing per frame.
 */
function buildEquirect(skyTop: string, skyHorizon: string, ground: string, keyLight: string): THREE.CanvasTexture {
  const w = 256;
  const h = 128;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // Vertical band layout matches an equirect projection: top row is straight
  // up, middle is the horizon, bottom is straight down.
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, skyTop);
  grad.addColorStop(0.45, skyHorizon);
  grad.addColorStop(0.52, skyHorizon);
  grad.addColorStop(1, ground);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Soft sun, positioned to agree with the scene's directional light so the
  // highlight it produces lands where the shadow direction implies it should.
  const sunX = w * 0.68;
  const sunY = h * 0.26;
  const sun = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, w * 0.16);
  sun.addColorStop(0, keyLight);
  sun.addColorStop(0.35, `${keyLight}88`);
  sun.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = sun;
  ctx.fillRect(0, 0, w, h);

  const texture = new THREE.CanvasTexture(canvas);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export default function ArenaEnvironment({ skyTop, skyHorizon, ground, keyLight }: ArenaEnvironmentProps) {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);

  useEffect(() => {
    const pmrem = new THREE.PMREMGenerator(gl);
    const source = buildEquirect(skyTop, skyHorizon, ground, keyLight);
    const target = pmrem.fromEquirectangular(source);
    const previous = scene.environment;
    scene.environment = target.texture;

    return () => {
      // Only hand back what we took — another world's env may already have
      // replaced ours by the time this runs.
      if (scene.environment === target.texture) scene.environment = previous;
      target.dispose();
      source.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, skyTop, skyHorizon, ground, keyLight]);

  return null;
}
