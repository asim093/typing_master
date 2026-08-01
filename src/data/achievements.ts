import type { AchievementDef } from '../types';

export const ACHIEVEMENTS: AchievementDef[] = [
  { id: 'first_victory', name: 'First Victory', description: 'Defeat your first enemy.', icon: 'sword' },
  { id: 'combo_50', name: 'Combo Master', description: 'Reach a 50 combo.', icon: 'flame' },
  { id: 'combo_100', name: 'Unstoppable', description: 'Reach a 100 combo.', icon: 'fire' },
  { id: 'wpm_60', name: 'Swift Fingers', description: 'Reach 60 WPM.', icon: 'wind' },
  { id: 'wpm_100', name: 'Speed Demon', description: 'Reach 100 WPM.', icon: 'bolt' },
  { id: 'accuracy_100', name: 'Flawless', description: 'Finish a battle with 100% accuracy.', icon: 'target' },
  { id: 'boss_slayer', name: 'Boss Slayer', description: 'Defeat your first boss.', icon: 'crown' },
  { id: 'boss_slayer_4', name: 'Realm Conqueror', description: 'Defeat all four world bosses.', icon: 'trophy' },
  { id: 'level_10', name: 'Rising Hero', description: 'Reach level 10.', icon: 'star' },
  { id: 'level_25', name: 'Veteran Adventurer', description: 'Reach level 25.', icon: 'shield' },
  { id: 'level_40', name: 'Legendary Hero', description: 'Reach level 40.', icon: 'gem' },
  { id: 'words_500', name: 'Wordsmith', description: 'Type 500 words in battle.', icon: 'book' },
  { id: 'words_2000', name: 'Lexicon Master', description: 'Type 2000 words in battle.', icon: 'scroll' },
  { id: 'enemies_100', name: 'Monster Hunter', description: 'Defeat 100 enemies.', icon: 'skull' },
  { id: 'all_worlds', name: 'World Traveler', description: 'Unlock every world.', icon: 'map' },
];

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}
