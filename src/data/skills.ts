import type { SkillDef } from '../types';

export const SKILLS: SkillDef[] = [
  {
    id: 'attackPower',
    name: 'Attack Power',
    description: 'Increases damage dealt per word by 4%.',
    maxLevel: 20,
    perLevel: 0.04,
    icon: 'sword',
  },
  {
    id: 'critChance',
    name: 'Critical Chance',
    description: 'Increases critical hit chance by 1.5%.',
    maxLevel: 20,
    perLevel: 0.015,
    icon: 'bolt',
  },
  {
    id: 'comboBonus',
    name: 'Combo Bonus',
    description: 'Increases combo multiplier growth by 6%.',
    maxLevel: 20,
    perLevel: 0.06,
    icon: 'flame',
  },
  {
    id: 'xpGain',
    name: 'XP Gain',
    description: 'Increases XP earned by 5%.',
    maxLevel: 20,
    perLevel: 0.05,
    icon: 'star',
  },
  {
    id: 'health',
    name: 'Vitality',
    description: 'Increases max health by 8%.',
    maxLevel: 20,
    perLevel: 0.08,
    icon: 'heart',
  },
];

export function getSkill(id: string): SkillDef {
  return SKILLS.find((s) => s.id === id)!;
}
