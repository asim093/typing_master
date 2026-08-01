import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { HERO_CLASSES } from '../../data/heroClasses';
import { getSkinsForHero } from '../../data/skins';
import { getSkin } from '../../data/skins';
import { getWeaponForClass } from '../../data/weapons';
import { playSfx } from '../../game/audio';
import HeroPreviewCanvas from '../hero/HeroPreviewCanvas';
import ModelLoadingOverlay from '../ui/ModelLoadingOverlay';
import type { HeroClassId } from '../../types';

interface HeroSelectProps {
  onBack: () => void;
}

export default function HeroSelect({ onBack }: HeroSelectProps) {
  const level = usePlayerStore((s) => s.level);
  const heroClass = usePlayerStore((s) => s.heroClass);
  const setHeroClass = usePlayerStore((s) => s.setHeroClass);
  const unlockedSkins = usePlayerStore((s) => s.unlockedSkins);
  const selectedSkinByHero = usePlayerStore((s) => s.selectedSkinByHero);
  const setSkinForCurrentHero = usePlayerStore((s) => s.setSkinForCurrentHero);

  const skin = getSkin(selectedSkinByHero[heroClass]);
  const weapon = getWeaponForClass(heroClass);
  const skinsForHero = getSkinsForHero(heroClass);

  return (
    <div className="relative w-full h-full flex flex-col p-4 sm:p-6 pt-14 sm:pt-6 overflow-y-auto">
      <button onClick={onBack} className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 p-2 -m-2 text-white/60 hover:text-white text-sm font-semibold">
        ← Back
      </button>
      <h2 className="text-2xl sm:text-3xl font-black text-center text-white/90 mb-4">Choose Your Hero</h2>

      <div className="flex flex-col lg:flex-row gap-6 max-w-6xl mx-auto w-full flex-1 min-h-0">
        <div className="relative lg:w-[38%] h-72 lg:h-auto rounded-2xl overflow-hidden panel">
          <HeroPreviewCanvas heroClass={heroClass} colors={skin.colors} weapon={weapon} />
          <ModelLoadingOverlay />
        </div>

        <div className="flex-1 flex flex-col gap-6">
          {/* Hero class picker */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Hero</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {HERO_CLASSES.map((h) => {
                const levelLocked = level < h.unlockLevel;
                const locked = h.comingSoon || levelLocked;
                const levelsAway = h.unlockLevel - level;
                return (
                  <motion.button
                    key={h.id}
                    whileHover={locked ? {} : { scale: 1.03 }}
                    whileTap={locked ? {} : { scale: 0.97 }}
                    disabled={locked}
                    onClick={() => {
                      if (locked) return;
                      setHeroClass(h.id as HeroClassId);
                      playSfx('uiClick');
                    }}
                    className={`relative text-left rounded-xl px-3 py-2.5 border min-h-[3.75rem] transition-colors ${
                      locked
                        ? 'border-white/5 bg-white/[0.03] cursor-not-allowed'
                        : heroClass === h.id
                          ? 'border-violet-400 bg-violet-500/15'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className={`font-bold text-sm flex items-center gap-1.5 ${locked ? 'text-white/45' : 'text-white/90'}`}>
                      {locked && <span className="text-[11px] leading-none">🔒</span>}
                      {h.name}
                    </div>
                    {h.comingSoon ? (
                      <div className="text-[10px] text-white/30">
                        Coming Soon{!levelLocked ? '' : ` · Lv ${h.unlockLevel}`}
                      </div>
                    ) : levelLocked ? (
                      <div className="text-[10px] text-amber-300/70 font-semibold">
                        Unlocks at Level {h.unlockLevel}
                        <span className="text-white/30 font-normal"> · {levelsAway} to go</span>
                      </div>
                    ) : (
                      <div className="text-[11px] text-white/45">{h.title}</div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </section>

          {/* Skin picker */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Skin</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {skinsForHero.map((s) => {
                const unlocked = unlockedSkins.includes(s.id);
                const selected = selectedSkinByHero[heroClass] === s.id;
                return (
                  <motion.button
                    key={s.id}
                    whileHover={unlocked ? { scale: 1.03 } : {}}
                    whileTap={unlocked ? { scale: 0.97 } : {}}
                    disabled={!unlocked}
                    onClick={() => {
                      if (setSkinForCurrentHero(s.id)) playSfx('uiConfirm');
                    }}
                    className={`text-left rounded-xl px-3 py-2.5 border flex items-center gap-2 ${
                      !unlocked
                        ? 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
                        : selected
                          ? 'border-violet-400 bg-violet-500/15'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-full shrink-0 border border-white/20" style={{ background: s.colors.primary }} />
                    <div>
                      <div className="font-semibold text-sm text-white/90">{s.name}</div>
                      {!unlocked && <div className="text-[10px] text-white/40">Level {s.unlockLevel}</div>}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </section>

        </div>
      </div>
      <p className="text-center text-white/25 text-xs mt-4">Current level: {level}</p>
    </div>
  );
}
