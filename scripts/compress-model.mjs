// Shrinks a character GLB for the web: resizes/recompresses textures (PNG
// only where alpha is actually needed, JPEG everywhere else) and decimates
// geometry with meshoptimizer. These character scans/AI exports typically
// ship 4096px textures and far more triangles than a small on-screen
// character ever needs — this routinely gets 3-19x smaller with no visible
// quality loss at game render scale.
//
// Usage:
//   node scripts/compress-model.mjs <input.glb> <output.glb> [maxTextureDim=1024] [simplifyRatio=0.25]
//
// Requires (not in package.json by default — install before running):
//   npm install --no-save @gltf-transform/core @gltf-transform/extensions @gltf-transform/functions meshoptimizer sharp
//
// Always eyeball the result in the game before replacing the shipped file —
// simplifyRatio is aggressive by design; bump it up (e.g. 0.4-0.6) for a
// model that looks faceted/rough afterward.
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, simplify, weld } from '@gltf-transform/functions';
import { MeshoptSimplifier } from 'meshoptimizer';
import sharp from 'sharp';

const inputPath = process.argv[2];
const outputPath = process.argv[3];
const maxDim = Number(process.argv[4] || 1024);
// Target ratio of vertices to KEEP (0.25 = decimate to ~25% of original tris).
// These character scans are wildly overtenselated for how small they render
// on screen, so an aggressive default is fine — bump it up per-model if a
// specific one looks rough after simplification.
const simplifyRatio = Number(process.argv[5] || 0.25);

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const document = await io.read(inputPath);

await document.transform(
  weld(),
  dedup(),
  simplify({ simplifier: MeshoptSimplifier, ratio: simplifyRatio, error: 0.01 }),
  prune(),
);

const root = document.getRoot();

// Only the base color slot can carry meaningful alpha (transparency/blend);
// normal/metallic-roughness/emissive/occlusion never need an alpha channel,
// so they compress far better as JPEG regardless of how they were exported.
const alphaTextures = new Set();
for (const material of root.listMaterials()) {
  const baseColor = material.getBaseColorTexture();
  if (baseColor) alphaTextures.add(baseColor);
}

for (const texture of root.listTextures()) {
  const image = texture.getImage();
  if (!image) continue;
  const needsAlpha = alphaTextures.has(texture);

  const pipeline = sharp(Buffer.from(image)).resize(maxDim, maxDim, { fit: 'inside', withoutEnlargement: true });

  let newBuffer;
  let newMime;
  if (needsAlpha) {
    newBuffer = await pipeline.png({ compressionLevel: 9 }).toBuffer();
    newMime = 'image/png';
  } else {
    newBuffer = await pipeline.jpeg({ quality: 85, mozjpeg: true }).toBuffer();
    newMime = 'image/jpeg';
  }

  texture.setImage(new Uint8Array(newBuffer));
  texture.setMimeType(newMime);
}

await io.write(outputPath, document);
console.log('done:', outputPath);
