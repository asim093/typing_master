import { motion } from 'framer-motion';
import { usePlayerStore } from '../../store/playerStore';
import { HERO_CLASSES } from '../../data/heroClasses';
import { getSkinsForHero } from '../../data/skins';
import { WEAPONS } from '../../data/weapons';
import { getSkin } from '../../data/skins';
import { getWeapon } from '../../data/weapons';
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
  const unlockedWeapons = usePlayerStore((s) => s.unlockedWeapons);
  const selectedWeapon = usePlayerStore((s) => s.selectedWeapon);
  const setWeapon = usePlayerStore((s) => s.setWeapon);

  const skin = getSkin(selectedSkinByHero[heroClass]);
  const weapon = getWeapon(selectedWeapon);
  const skinsForHero = getSkinsForHero(heroClass);

  return (
    <div className="relative w-full h-full flex flex-col p-6 overflow-y-auto">
      <button onClick={onBack} className="absolute top-6 left-6 text-white/50 hover:text-white text-sm font-semibold z-10">
        ← Back
      </button>
      <h2 className="text-3xl font-black text-center text-white/90 mb-4">Choose Your Hero</h2>

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
              {HERO_CLASSES.map((h) => (
                <motion.button
                  key={h.id}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setHeroClass(h.id as HeroClassId);
                    playSfx('uiClick');
                  }}
                  className={`text-left rounded-xl px-3 py-2.5 border ${
                    heroClass === h.id ? 'border-violet-400 bg-violet-500/15' : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="font-bold text-sm text-white/90">{h.name}</div>
                  <div className="text-[11px] text-white/45">{h.title}</div>
                </motion.button>
              ))}
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

          {/* Weapon picker */}
          <section>
            <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold mb-2">Weapon</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {WEAPONS.map((w) => {
                const unlocked = unlockedWeapons.includes(w.id);
                const selected = selectedWeapon === w.id;
                return (
                  <motion.button
                    key={w.id}
                    whileHover={unlocked ? { scale: 1.03 } : {}}
                    whileTap={unlocked ? { scale: 0.97 } : {}}
                    disabled={!unlocked}
                    onClick={() => {
                      if (setWeapon(w.id)) playSfx('uiConfirm');
                    }}
                    className={`text-left rounded-xl px-3 py-2.5 border flex items-center gap-2 ${
                      !unlocked
                        ? 'border-white/5 bg-white/[0.02] opacity-50 cursor-not-allowed'
                        : selected
                          ? 'border-violet-400 bg-violet-500/15'
                          : 'border-white/10 bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <span className="w-4 h-4 rounded-sm shrink-0 border border-white/20" style={{ background: w.bladeColor }} />
                    <div>
                      <div className="font-semibold text-sm text-white/90">{w.name}</div>
                      {!unlocked && <div className="text-[10px] text-white/40">Level {w.unlockLevel}</div>}
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
