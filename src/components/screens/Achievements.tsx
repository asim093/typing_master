import { motion } from 'framer-motion';
import { ACHIEVEMENTS } from '../../data/achievements';
import { usePlayerStore } from '../../store/playerStore';

interface AchievementsProps {
  onBack: () => void;
}

export default function Achievements({ onBack }: AchievementsProps) {
  const unlocked = usePlayerStore((s) => s.unlockedAchievements);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start sm:justify-center overflow-y-auto p-4 sm:p-8 pt-14 sm:pt-8">
      <button onClick={onBack} className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 p-2 -m-2 text-white/60 hover:text-white text-sm font-semibold">
        ← Back
      </button>
      <h2 className="text-2xl sm:text-3xl font-black mb-1 text-white/90">Achievements</h2>
      <p className="text-white/40 mb-8 text-sm">
        {unlocked.length} / {ACHIEVEMENTS.length} unlocked
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl w-full max-h-[60vh] overflow-y-auto pr-1">
        {ACHIEVEMENTS.map((a, i) => {
          const isUnlocked = unlocked.includes(a.id);
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className={`panel rounded-xl p-4 flex items-center gap-3 ${isUnlocked ? '' : 'opacity-45 grayscale'}`}
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg shrink-0"
                style={{ background: isUnlocked ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.05)' }}
              >
                {isUnlocked ? '🏆' : '🔒'}
              </div>
              <div>
                <div className="font-bold text-white/90 text-sm">{a.name}</div>
                <div className="text-xs text-white/45">{a.description}</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
