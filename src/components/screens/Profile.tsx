import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { getHeroClass } from '../../data/heroClasses';
import { getSkin } from '../../data/skins';
import { ACHIEVEMENTS } from '../../data/achievements';
import { BOSSES } from '../../data/enemies';
import { getWorld } from '../../data/worlds';

interface ProfileProps {
  onBack: () => void;
}

function formatPlayTime(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function StatCard({ label, value, accent }: { label: string; value: string | number; accent?: string }) {
  return (
    <div className="panel rounded-xl px-4 py-3">
      <div className="text-2xl font-bold font-mono-game tabular-nums" style={{ color: accent ?? '#f3f1ff' }}>
        {value}
      </div>
      <div className="text-[11px] uppercase tracking-wider text-white/40 mt-0.5">{label}</div>
    </div>
  );
}

export default function Profile({ onBack }: ProfileProps) {
  const level = usePlayerStore((s) => s.level);
  const totalXpEarned = usePlayerStore((s) => s.totalXpEarned);
  const bestWpm = usePlayerStore((s) => s.bestWpm);
  const bestAccuracy = usePlayerStore((s) => s.bestAccuracy);
  const bossesDefeated = usePlayerStore((s) => s.bossesDefeated);
  const totalTimePlayedMs = usePlayerStore((s) => s.totalTimePlayedMs);
  const unlockedAchievements = usePlayerStore((s) => s.unlockedAchievements);
  const heroClass = usePlayerStore((s) => s.heroClass);
  const selectedSkinByHero = usePlayerStore((s) => s.selectedSkinByHero);
  const bestCombo = usePlayerStore((s) => s.bestCombo);
  const totalEnemiesDefeated = usePlayerStore((s) => s.totalEnemiesDefeated);
  const streakDays = usePlayerStore((s) => s.streakDays);
  const longestStreakDays = usePlayerStore((s) => s.longestStreakDays);

  const hero = getHeroClass(heroClass);
  const skin = getSkin(selectedSkinByHero[heroClass]);

  return (
    <div className="relative w-full h-full flex flex-col items-center p-4 sm:p-6 pt-14 sm:pt-6 overflow-y-auto">
      <button
        onClick={onBack}
        className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 p-2 -m-2 text-white/60 hover:text-white text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 rounded"
      >
        ← Back
      </button>
      <h2 className="text-2xl sm:text-3xl font-black text-white/90 mb-1">Profile</h2>
      <p className="text-white/40 text-sm mb-6">
        {hero.name} — {skin.name}
      </p>

      <div className="max-w-3xl w-full mb-3 flex items-center gap-3 panel rounded-xl px-4 py-3">
        <span className="text-2xl">🔥</span>
        <div className="flex-1">
          <div className="text-sm font-bold text-white/90">
            {streakDays} day{streakDays === 1 ? '' : 's'} streak
          </div>
          <div className="text-[11px] text-white/40">Longest streak: {longestStreakDays} day{longestStreakDays === 1 ? '' : 's'}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl w-full mb-6">
        <StatCard label="Level" value={level} accent="#c084fc" />
        <StatCard label="Total XP" value={totalXpEarned.toLocaleString()} accent="#a78bfa" />
        <StatCard label="Best WPM" value={bestWpm} accent="#38bdf8" />
        <StatCard label="Accuracy" value={`${bestAccuracy}%`} accent="#4ade80" />
        <StatCard label="Best Combo" value={bestCombo} accent="#fb923c" />
        <StatCard label="Enemies Defeated" value={totalEnemiesDefeated} accent="#f472b6" />
        <StatCard label="Bosses Defeated" value={`${bossesDefeated.length} / ${BOSSES.length}`} accent="#f87171" />
        <StatCard label="Time Played" value={formatPlayTime(totalTimePlayedMs)} accent="#fde047" />
      </div>

      <div className="max-w-3xl w-full mb-6">
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Boss Trophy Case</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {BOSSES.map((b, i) => {
            const defeated = bossesDefeated.includes(b.id);
            const world = getWorld(b.worldId);
            return (
              <motion.div
                key={b.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={`panel rounded-lg px-3 py-3 text-center ${defeated ? '' : 'opacity-40 grayscale'}`}
              >
                <div className="text-xl mb-1">{defeated ? '👑' : '🔒'}</div>
                <div className="text-xs font-bold text-white/90 truncate">{b.name}</div>
                <div className="text-[10px] text-white/40">{world.name}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl w-full">
        <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">
          Achievements ({unlockedAchievements.length}/{ACHIEVEMENTS.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {ACHIEVEMENTS.map((a, i) => {
            const unlocked = unlockedAchievements.includes(a.id);
            return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.02 }}
                className={`panel rounded-lg px-3 py-2 flex items-center gap-2 ${unlocked ? '' : 'opacity-40 grayscale'}`}
              >
                <span>{unlocked ? '🏆' : '🔒'}</span>
                <span className="text-xs text-white/80">{a.name}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
