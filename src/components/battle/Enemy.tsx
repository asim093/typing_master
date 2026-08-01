import type { EnemyRuntime } from '../../game/useCombatEngine';
import EnemyModel from './enemies/EnemyModel';
import { ENEMY_FACING, ENEMY_POS } from './positions';

interface EnemyProps {
  enemy: EnemyRuntime;
  hitSeed: number;
  hitCrit: boolean;
  attackSeed: number;
  dying: boolean;
}

export default function EnemyMesh({ enemy, hitSeed, hitCrit, attackSeed, dying }: EnemyProps) {
  return (
    <group position={ENEMY_POS} rotation={[0, ENEMY_FACING, 0]}>
      <EnemyModel
        shape={enemy.shape}
        color={enemy.color}
        accentColor={enemy.accentColor}
        attackSeed={attackSeed}
        hitSeed={hitSeed}
        hitCrit={hitCrit}
        dying={dying}
      />
    </group>
  );
}
