import * as THREE from 'three';

const cache = new Map<string, THREE.CanvasTexture>();

// A flat meshStandardMaterial color reads as plastic under real-time lights.
// Baking a subtle vignette + fine speckle noise into a small canvas texture
// gives the arena floor real surface variation for zero runtime cost — it's
// generated once per world color and cached forever after that.
export function getGroundTexture(baseColor: string): THREE.CanvasTexture {
  const cached = cache.get(baseColor);
  if (cached) return cached;

  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;

  const base = new THREE.Color(baseColor);
  ctx.fillStyle = `#${base.getHexString()}`;
  ctx.fillRect(0, 0, size, size);

  const cx = size / 2;
  const cy = size / 2;
  const dark = base.clone().multiplyScalar(0.55);
  const vignette = ctx.createRadialGradient(cx, cy, size * 0.12, cx, cy, size * 0.5);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, `rgba(${Math.round(dark.r * 255)}, ${Math.round(dark.g * 255)}, ${Math.round(dark.b * 255)}, 0.6)`);
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, size, size);

  const imageData = ctx.getImageData(0, 0, size, size);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 16;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  cache.set(baseColor, texture);
  return texture;
}
