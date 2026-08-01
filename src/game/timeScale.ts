// Shared, mutable (non-React) time-scale state read directly inside R3F
// useFrame loops. Kept outside React so every animated mesh can react to a
// freeze-frame / slow-motion beat within the same tick, with zero re-renders.
export const timeScaleState = {
  value: 1,
  target: 1,
  freezeUntil: 0,
};

/** Hard-stop all animation for `durationMs` (impact freeze-frame). */
export function triggerFreeze(durationMs: number) {
  const until = performance.now() + durationMs;
  if (until > timeScaleState.freezeUntil) timeScaleState.freezeUntil = until;
  timeScaleState.value = 0;
}

/** Ease toward `scale` and hold for `durationMs`, then ease back to 1. */
export function triggerSlowMo(scale: number, durationMs: number) {
  timeScaleState.target = scale;
  window.setTimeout(() => {
    timeScaleState.target = 1;
  }, durationMs);
}

export function resetTimeScale() {
  timeScaleState.value = 1;
  timeScaleState.target = 1;
  timeScaleState.freezeUntil = 0;
}
