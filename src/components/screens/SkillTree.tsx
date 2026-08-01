import { motion } from 'framer-motion';
import { SKILLS } from '../../data/skills';
import { usePlayerStore } from '../../store/playerStore';
import type { SkillId } from '../../types';

interface SkillTreeProps {
  onBack: () => void;
}

const ICONS: Record<string, string> = {
  sword: '⚔️',
  bolt: '⚡',
  flame: '🔥',
  star: '✨',
  heart: '❤️',
};

export default function SkillTree({ onBack }: SkillTreeProps) {
  const skills = usePlayerStore((s) => s.skills);
  const skillPoints = usePlayerStore((s) => s.skillPoints);
  const spendSkillPoint = usePlayerStore((s) => s.spendSkillPoint);

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start sm:justify-center overflow-y-auto p-4 sm:p-8 pt-14 sm:pt-8">
      <button onClick={onBack} className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 p-2 -m-2 text-white/60 hover:text-white text-sm font-semibold">
        ← Back
      </button>
      <h2 className="text-2xl sm:text-3xl font-black mb-1 text-white/90">Skill Tree</h2>
      <p className="text-white/40 mb-8 text-sm">
        <span className="text-amber-300 font-bold">{skillPoints}</span> skill point{skillPoints === 1 ? '' : 's'} available
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
        {SKILLS.map((skill, i) => {
          const lvl = skills[skill.id as SkillId];
          const maxed = lvl >= skill.maxLevel;
          return (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="panel rounded-xl p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{ICONS[skill.icon]}</span>
                  <div>
                    <div className="font-bold text-white/90">{skill.name}</div>
                    <div className="text-xs text-white/40">
                      Lv {lvl} / {skill.maxLevel}
                    </div>
                  </div>
                </div>
                <button
                  disabled={skillPoints <= 0 || maxed}
                  onClick={() => spendSkillPoint(skill.id as SkillId)}
                  className="px-3 py-1.5 rounded-lg bg-violet-600 disabled:bg-white/10 disabled:text-white/30 font-bold text-sm hover:bg-violet-500 transition-colors"
                >
                  {maxed ? 'MAX' : '+1'}
                </button>
              </div>
              <p className="text-xs text-white/50 mb-2">{skill.description}</p>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-400"
                  style={{ width: `${(lvl / skill.maxLevel) * 100}%` }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
