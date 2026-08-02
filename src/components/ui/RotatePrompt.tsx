import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';

/**
 * Suggests landscape on touch devices held in portrait.
 *
 * The arena is a side-on "versus" framing — hero and enemy separated
 * horizontally — so a tall narrow viewport forces the camera to pull way
 * back just to fit both fighters (see CameraRig). Landscape gives that
 * width back and the characters roughly double in apparent size.
 *
 * Deliberately a dismissible suggestion rather than a hard block: portrait
 * is fully playable, some people can't rotate (mounted device, accessibility
 * rotation lock), and locking someone out of a game they can otherwise play
 * would be worse than a slightly smaller arena.
 */
export default function RotatePrompt() {
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // `pointer: coarse` keeps this off desktops, where a narrow *window* is
    // a deliberate choice by the user and nothing can be "rotated" anyway.
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    if (!isTouch) return;

    const portrait = window.matchMedia('(orientation: portrait)');
    const update = () => setShow(portrait.matches);
    update();
    portrait.addEventListener('change', update);
    return () => portrait.removeEventListener('change', update);
  }, []);

  return (
    <AnimatePresence>
      {show && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed inset-x-0 bottom-0 z-[60] flex justify-center px-3 pb-3 pointer-events-none"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <div className="pointer-events-auto flex items-center gap-3 rounded-xl px-4 py-3 bg-black/85 border border-amber-300/30 backdrop-blur-sm shadow-lg max-w-sm w-full">
            <motion.span
              className="text-2xl shrink-0"
              animate={{ rotate: [0, 90, 90, 0] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut', times: [0, 0.35, 0.75, 1] }}
            >
              📱
            </motion.span>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-amber-100 leading-tight">Rotate for a better view</div>
              <div className="text-[11px] text-white/55 leading-snug mt-0.5">
                Landscape gives the battle arena much more room.
              </div>
            </div>
            <button
              onClick={() => setDismissed(true)}
              className="shrink-0 text-white/50 hover:text-white text-xs font-semibold px-2 py-2 -m-1 rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
              aria-label="Dismiss rotate suggestion"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
