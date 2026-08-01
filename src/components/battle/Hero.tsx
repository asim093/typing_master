import type { HeroClassId, SkinDef, WeaponDef } from '../../types';
import HeroModel from './heroes/HeroModel';
import { HERO_FACING, HERO_POS } from './positions';

interface HeroProps {
  heroClass: HeroClassId;
  colors: SkinDef['colors'];
  weapon: WeaponDef;
  attackSeed: number;
  hitSeed: number;
  hitCrit?: boolean;
  victorySeed: number;
}

export default function Hero(props: HeroProps) {
  return (
    <group position={HERO_POS} rotation={[0, HERO_FACING, 0]}>
      <HeroModel {...props} />
    </group>
  );
}
