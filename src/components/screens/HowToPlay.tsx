import { motion } from 'framer-motion';

interface HowToPlayProps {
  onBack: () => void;
}

const SECTIONS = [
  {
    icon: '⌨️',
    title: 'Type to attack',
    body: 'A word appears above your hero. Type it exactly — no need to press Enter. Finishing it correctly triggers an attack.',
  },
  {
    icon: '💥',
    title: 'Damage = length × combo × accuracy',
    body: 'Longer words hit harder. Chaining hits without a miss raises your combo multiplier. Typos on the current word lower your accuracy bonus for that hit.',
  },
  {
    icon: '🔥',
    title: 'Keep the combo alive',
    body: 'Every clean word adds to your combo. One miss — a wrong word or running out of time — resets it to zero, so accuracy matters as much as speed.',
  },
  {
    icon: '⏱️',
    title: "Don't type too slowly",
    body: 'Each word has a time limit shown by the bar above it. Let it run out and the enemy lands a hit on you instead.',
  },
  {
    icon: '✨',
    title: 'Crits and Perfects',
    body: 'A portion of hits land as critical strikes for double damage — better gear and skills raise the odds. Finish a word fast and flawless for a PERFECT bonus.',
  },
  {
    icon: '👑',
    title: 'Bosses',
    body: 'A boss guards every world at levels 10, 20, 30, and 40. They hit harder and telegraph special attacks — watch for the warning banner.',
  },
];

const COLOR_KEY = [
  { swatch: 'text-white/75', label: 'Not typed yet' },
  { swatch: 'text-emerald-400', label: 'Typed correctly' },
  { swatch: 'text-rose-500', label: 'Mistyped' },
];

export default function HowToPlay({ onBack }: HowToPlayProps) {
  return (
    <div className="relative w-full h-full flex flex-col items-center p-8 overflow-y-auto">
      <button
        onClick={onBack}
        className="absolute top-6 left-6 text-white/50 hover:text-white text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400 rounded"
      >
        ← Back
      </button>
      <h2 className="text-3xl font-black mb-1 text-white/90">How to Play</h2>
      <p className="text-white/40 text-sm mb-8">Everything you need before your first fight.</p>

      <div className="max-w-2xl w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        {SECTIONS.map((s, i) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="panel rounded-xl p-4"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-xl">{s.icon}</span>
              <h3 className="font-bold text-sm text-white/90">{s.title}</h3>
            </div>
            <p className="text-xs text-white/55 leading-relaxed">{s.body}</p>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="panel rounded-xl p-4 max-w-2xl w-full"
      >
        <h3 className="font-bold text-sm text-white/90 mb-2">Reading the word</h3>
        <div className="flex items-center gap-6">
          {COLOR_KEY.map((c) => (
            <div key={c.label} className="flex items-center gap-2">
              <span className={`font-mono-game font-bold text-lg ${c.swatch}`}>Aa</span>
              <span className="text-xs text-white/50">{c.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
