import * as THREE from 'three';
import { clone as cloneSkeleton } from 'three/examples/jsm/utils/SkeletonUtils.js';

// The HD-scan source meshes have tens of millions of vertices, so a full
// Box3().setFromObject() scan is expensive (seconds of main-thread work).
// We only ever need to measure the *shared, stable* useGLTF scene once —
// every clone made from it has an identical bounding box — so the result is
// cached by source reference and reused for every subsequent instance.
const boxCache = new WeakMap<THREE.Object3D, THREE.Box3>();

function getCachedBox(source: THREE.Object3D): THREE.Box3 {
  let box = boxCache.get(source);
  if (!box) {
    source.updateMatrixWorld(true);
    box = new THREE.Box3().setFromObject(source);
    boxCache.set(source, box);
  }
  return box;
}

/**
 * Sketchfab/FBX exports commonly ship at arbitrary scale with the pivot
 * anywhere. This clones the source scene, uniformly scales it to a target
 * height, and grounds+centers it at the origin — so it drops into the arena
 * the same way the procedural rigs do. (Both sourced GLBs already ship
 * Y-up — verified empirically — so no axis correction is needed.)
 */
export function normalizeGLTFScene(source: THREE.Object3D, targetHeight: number): THREE.Group {
  const box = getCachedBox(source);
  const size = box.getSize(new THREE.Vector3());
  const scale = size.y > 0 ? targetHeight / size.y : 1;
  const center = box.getCenter(new THREE.Vector3());

  // Plain Object3D.clone(true) does NOT re-link a SkinnedMesh's
  // skeleton.bones to the cloned bone hierarchy — the mesh keeps deforming
  // from the original, untouched bones while the clone's own (identically
  // named) bone nodes are animated and do nothing visually. SkeletonUtils'
  // clone fixes that cross-reference; it's a safe drop-in for non-skinned
  // meshes too, so it's used unconditionally here.
  const clone = cloneSkeleton(source);
  clone.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      // These are multi-million-triangle scan meshes — real-time shadow
      // casting/receiving on them is prohibitively expensive per frame.
      // The arena's ambient/directional/point lights already read them fine.
      obj.castShadow = false;
      obj.receiveShadow = false;
      obj.frustumCulled = true;
      if (Array.isArray(obj.material)) {
        obj.material = obj.material.map((m) => m.clone());
      } else if (obj.material) {
        obj.material = obj.material.clone();
      }
    }
  });

  const wrapper = new THREE.Group();
  wrapper.add(clone);
  wrapper.scale.setScalar(scale);
  wrapper.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);

  return wrapper;
}

/** Finds the first mesh material under `root` for wiring up a hit-flash. */
export function findFirstStandardMaterial(root: THREE.Object3D): THREE.MeshStandardMaterial | null {
  let found: THREE.MeshStandardMaterial | null = null;
  root.traverse((obj) => {
    if (found) return;
    if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
      found = obj.material;
    }
  });
  return found;
}

const WHITE = new THREE.Color('#ffffff');
const TINT_STRENGTH = 0.42;

/**
 * AI/scan-sourced GLBs here (e.g. the Knight's "tripo" export) ship as a
 * single shared material across every mesh primitive, with all detail baked
 * into the texture and the material's own `color` left white — so skin
 * selection previously had nothing to drive. Lerping that white multiplier
 * toward the skin's primary color recolors the whole model while keeping
 * the texture's own shading/highlights intact (dark regions stay dark);
 * a full-strength multiply was tried first and read as flat/plasticky, so
 * this stops partway to keep the original material's depth.
 *
 * This armor's texture is mostly near-black to begin with, though, and
 * multiplying a near-black pixel by any tint is still near-black — so the
 * color pass alone barely shows on a skin like Dark Knight. A low, uniform
 * emissive using the skin's accent color adds real light into those dark
 * regions regardless of the base texture, which is what actually makes each
 * skin read as distinct instead of "slightly different shade of black".
 */
export function tintModelMaterials(root: THREE.Object3D, tint: string, accent: string): void {
  const tintColor = new THREE.Color(tint).lerp(WHITE, 1 - TINT_STRENGTH);
  const accentColor = new THREE.Color(accent);
  root.traverse((obj) => {
    if (obj instanceof THREE.Mesh && obj.material instanceof THREE.MeshStandardMaterial) {
      obj.material.color.copy(tintColor);
      obj.material.emissive.copy(accentColor);
      obj.material.emissiveIntensity = 0.16;
    }
  });
}

export function findNodeByName(root: THREE.Object3D, name: string): THREE.Object3D | null {
  let found: THREE.Object3D | null = null;
  root.traverse((obj) => {
    if (!found && obj.name === name) found = obj;
  });
  return found;
}

/**
 * Detaches a separately-modeled sub-mesh (e.g. a weapon that isn't fused
 * into the body mesh) and reparents it under `weaponGroup`, pivoting the
 * group at the weapon's own bounding-box center so useCombatAnimator's
 * swing rotation moves just the weapon instead of the whole body/root.
 * Returns true if the named node was found and reattached.
 */
export function extractWeaponToGroup(model: THREE.Object3D, nodeName: string, weaponGroup: THREE.Object3D): boolean {
  const weaponNode = findNodeByName(model, nodeName);
  const parent = weaponGroup.parent;
  if (!weaponNode || !parent) return false;

  model.updateMatrixWorld(true);
  parent.updateMatrixWorld(true);
  const center = new THREE.Box3().setFromObject(weaponNode).getCenter(new THREE.Vector3());
  weaponGroup.position.copy(parent.worldToLocal(center));
  weaponGroup.updateMatrixWorld(true);
  weaponGroup.attach(weaponNode);
  return true;
}
