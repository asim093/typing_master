import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { playSfx } from '../../game/audio';
import { getHeroClass } from '../../data/heroClasses';
import { xpToNextLevel } from '../../game/combat';
import MenuBackdrop from '../ui/MenuBackdrop';
import ScreenBackground from '../ui/ScreenBackground';
import type { GameScreen, HeroClassId } from '../../types';

interface MainMenuProps {
  onNavigate: (screen: GameScreen) => void;
}

const HERO_ICON: Record<HeroClassId, string> = {
  knight: '🛡️',
  ranger: '🏹',
  mage: '🔥',
  samurai: '⚔️',
  cyberninja: '🗡️',
};

const NAV_ITEMS: { screen: GameScreen; label: string; icon: string }[] = [
  { screen: 'heroSelect', label: 'Heroes & Weapons', icon: '🗡️' },
  { screen: 'skillTree', label: 'Skills', icon: '📈' },
  { screen: 'achievements', label: 'Achievements', icon: '🏆' },
  { screen: 'profile', label: 'Profile', icon: '👤' },
  { screen: 'howToPlay', label: 'How to Play', icon: '📜' },
  { screen: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function MainMenu({ onNavigate }: MainMenuProps) {
  const level = usePlayerStore((s) => s.level);
  const xp = usePlayerStore((s) => s.xp);
  const coins = usePlayerStore((s) => s.coins);
  const streakDays = usePlayerStore((s) => s.streakDays);
  const skillPoints = usePlayerStore((s) => s.skillPoints);
  const heroClass = usePlayerStore((s) => s.heroClass);
  const hero = getHeroClass(heroClass);

  const xpNeeded = xpToNextLevel(level);
  const xpPct = Math.min(100, Math.round((xp / xpNeeded) * 100));

  const nav = (screen: GameScreen) => {
    playSfx('uiClick');
    onNavigate(screen);
  };

  return (
    <div className="relative w-full h-full overflow-hidden isolate">
      <ScreenBackground overlayStrength="heavy" living />
      <div className="absolute inset-0 -z-10">
        <MenuBackdrop embersOnly accent="#f0c766" glow="#f5d98a" />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between px-8 md:px-14 py-8 md:py-10">
        {/* Logo block */}
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="pt-4"
        >
          <h1 className="text-gold-shimmer text-5xl md:text-7xl font-black tracking-tight leading-none">
            TypeQuest
          </h1>
          <div className="mt-3 flex items-center gap-3 max-w-md">
            <span className="h-px flex-1 bg-gradient-to-r from-transparent via-amber-200/50 to-amber-200/50" />
            <span className="text-[11px] md:text-xs uppercase tracking-[0.35em] text-amber-100/70 font-semibold whitespace-nowrap">
              Type. Fight. Conquer.
            </span>
            <span className="h-px flex-1 bg-gradient-to-l from-transparent via-amber-200/50 to-amber-200/50" />
          </div>
        </motion.div>

        {/* Nav ribbon + player widget */}
        <div className="flex items-end justify-between gap-6">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25, duration: 0.6, ease: 'easeOut' }}
            className="flex flex-col gap-2 w-full max-w-xs"
          >
            <motion.button
              onClick={() => nav('worldSelect')}
              whileHover={{ x: 4 }}
              whileTap={{ scale: 0.98 }}
              className="ribbon-btn ribbon-active rounded-sm px-5 py-3.5 text-left flex items-center gap-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
            >
              <span className="text-lg">▶</span>
              <span className="font-bold text-lg tracking-wide text-amber-50">Play</span>
              {streakDays > 0 && (
                <span className="ml-auto text-[11px] font-mono-game text-orange-200/80">🔥 {streakDays}</span>
              )}
            </motion.button>

            {NAV_ITEMS.map((item, i) => (
              <motion.button
                key={item.screen}
                onClick={() => nav(item.screen)}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
                className="ribbon-btn rounded-sm px-5 py-2.5 text-left flex items-center gap-3 text-white/80 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300/70"
              >
                <span className="text-sm opacity-80">{item.icon}</span>
                <span className="font-semibold text-sm tracking-wide">{item.label}</span>
                {item.screen === 'skillTree' && skillPoints > 0 && (
                  <span className="ml-auto bg-amber-400 text-black text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {skillPoints}
                  </span>
                )}
              </motion.button>
            ))}
          </motion.div>

          {/* Player mini-panel */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6, ease: 'easeOut' }}
            className="hidden sm:flex items-center gap-3 rounded-sm px-4 py-3 bg-black/45 border border-amber-200/20 backdrop-blur-sm shrink-0"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500/80 to-amber-800/80 border border-amber-200/40 flex items-center justify-center text-xl shrink-0">
              {HERO_ICON[heroClass]}
            </div>
            <div className="min-w-[9rem]">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-sm text-amber-50 tracking-wide">{hero.name}</span>
                <span className="text-[11px] font-mono-game text-amber-200/70">Lv {level}</span>
              </div>
              <div className="mt-1.5 relative h-1.5 w-40 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-300"
                  style={{ width: `${xpPct}%`, boxShadow: '0 0 8px rgba(251,191,36,0.7)' }}
                />
              </div>
              <div className="mt-1 flex items-center justify-between text-[10px] font-mono-game text-white/40">
                <span>{xpPct}% to next</span>
                <span className="text-amber-300/80">🪙 {coins}</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
