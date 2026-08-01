import * as THREE from 'three';

/**
 * Mixamo animation exports name every track after the standard
 * "mixamorig:BoneName" skeleton. A model rigged from the same Mixamo bone
 * set but exported without that prefix (as hero2.glb is — "Hips", "Spine",
 * not "mixamorig:Hips") can still play the clip directly: THREE's
 * AnimationMixer binds each track to a scene node purely by name lookup at
 * play time, so renaming "mixamorig:Hips.quaternion" to "Hips.quaternion"
 * is enough to retarget the clip onto a differently-named-but-compatible
 * skeleton — no Blender re-rigging step required.
 */
export function stripTrackPrefix(clip: THREE.AnimationClip, prefix: string): THREE.AnimationClip {
  const tracks = clip.tracks.map((track) => {
    if (!track.name.startsWith(prefix)) return track;
    const clone = track.clone();
    clone.name = track.name.slice(prefix.length);
    return clone;
  });
  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}

/**
 * Downloaded "in-world" Mixamo clips (jump attacks, dashes, etc.) bake the
 * character's own forward/vertical travel into the root bone's position
 * track. The arena already has its own tuned lunge-and-recover motion for
 * attacks (useCombatAnimator, applied to the whole hero group) — layering a
 * multi-unit skeletal root translation on top of that would send the model
 * flying off its mark. Dropping the root bone's `.position` track keeps
 * every rotation (the actual swing) intact while leaving the bone pinned at
 * its bind-pose position, so the clip plays "in place".
 */
export function stripRootMotion(clip: THREE.AnimationClip, rootBoneName: string): THREE.AnimationClip {
  const tracks = clip.tracks.filter((track) => track.name !== `${rootBoneName}.position`);
  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}

/**
 * Rescales a clip's root-bone translation into the proportions of the rig
 * it's being retargeted onto.
 *
 * A root position track is *absolute*, not relative — it says "put the hips
 * here", in the units of whichever skeleton the clip was authored against.
 * Play it on a rig with differently-placed hips and the character snaps to
 * that foreign height the moment the clip starts. That's what made the
 * death animation launch the hero into the air before dropping: the clip
 * opens at hip height 0.943 while this model stands at 0.574.
 *
 * Multiplying the whole track by (targetBaseY / firstFrameY) pins frame one
 * to where the character actually stands, and scales the rest of the motion
 * by the same ratio — so a shorter rig falls a proportionally shorter
 * distance and still ends up flat on the floor rather than buried under it.
 *
 * Only for clips whose travel is worth keeping (a death collapse). Clips
 * that should play in place want stripRootMotion instead.
 */
export function scaleRootMotion(
  clip: THREE.AnimationClip,
  rootBoneName: string,
  targetBaseY: number,
): THREE.AnimationClip {
  const trackName = `${rootBoneName}.position`;
  const tracks = clip.tracks.map((track) => {
    if (track.name !== trackName) return track;
    const clone = track.clone();
    const values = clone.values as Float32Array;
    const firstY = values[1];
    // A near-zero opening height means the clip is already relative (or the
    // track is degenerate); scaling by it would explode the motion.
    if (!Number.isFinite(firstY) || Math.abs(firstY) < 1e-4) return clone;
    const ratio = targetBaseY / firstY;
    for (let i = 0; i < values.length; i++) values[i] *= ratio;
    return clone;
  });
  return new THREE.AnimationClip(clip.name, clip.duration, tracks);
}
