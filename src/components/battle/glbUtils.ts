import * as THREE from 'three';

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

  const clone = source.clone(true);
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
