import type { WorldId } from '../../../types';
import ForestEnvironment from './ForestEnvironment';
import DesertEnvironment from './DesertEnvironment';
import FrozenEnvironment from './FrozenEnvironment';
import CyberEnvironment from './CyberEnvironment';

export default function WorldEnvironment({ worldId }: { worldId: WorldId }) {
  switch (worldId) {
    case 'desert':
      return <DesertEnvironment />;
    case 'frozen':
      return <FrozenEnvironment />;
    case 'cyber':
      return <CyberEnvironment />;
    case 'forest':
    default:
      return <ForestEnvironment />;
  }
}
