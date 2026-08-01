import { useFrame } from '@react-three/fiber';
import { timeScaleState } from '../../game/timeScale';

// Advances the shared time-scale value using real (unscaled) delta so
// freeze-frames and slow-motion beats resolve on wall-clock time.
export default function TimeScaleController() {
  useFrame((_, delta) => {
    if (performance.now() < timeScaleState.freezeUntil) {
      timeScaleState.value = 0;
      return;
    }
    timeScaleState.value += (timeScaleState.target - timeScaleState.value) * Math.min(1, delta * 8);
  });
  return null;
}
