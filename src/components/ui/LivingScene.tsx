import { useMemo } from 'react';

interface Firefly {
  id: number;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  dx: number;
  dy: number;
  dx2: number;
  dy2: number;
  opacity: number;
}

// Fireflies cluster near the foreground ivy/greenery at the bottom corners of
// the painting rather than scattering across the whole frame.
const FIREFLY_ZONES = [
  { left: [0, 13] as const, top: [68, 95] as const },
  { left: [88, 100] as const, top: [60, 90] as const },
];

function useFireflies(count: number): Firefly[] {
  return useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => {
        const zone = FIREFLY_ZONES[i % FIREFLY_ZONES.length];
        return {
          id: i,
          left: zone.left[0] + Math.random() * (zone.left[1] - zone.left[0]),
          top: zone.top[0] + Math.random() * (zone.top[1] - zone.top[0]),
          size: 2 + Math.random() * 2,
          duration: 7 + Math.random() * 7,
          delay: Math.random() * 10,
          dx: (Math.random() - 0.5) * 40,
          dy: -12 - Math.random() * 26,
          dx2: (Math.random() - 0.5) * 32,
          dy2: -24 - Math.random() * 36,
          opacity: 0.45 + Math.random() * 0.4,
        };
      }),
    [count],
  );
}

// Long, slow, staggered flight paths (in vw/vh so they scale with the
// viewport) — durations are long and delays are spread out so at most one
// bird is ever crossing the sky at a time.
const BIRDS = [
  { x0: -6, y0: 32, x1: 64, y1: 9, duration: 68, delay: 2 },
  { x0: -9, y0: 20, x1: 60, y1: 33, duration: 84, delay: 30 },
  { x0: -7, y0: 14, x1: 56, y1: 5, duration: 100, delay: 62 },
];

// Pure-CSS atmospheric layer stack for the main menu backdrop: light rays,
// drifting clouds, a water shimmer over the river, waving banner accents,
// ground fog, fireflies, and slow-flying birds. All positions are tuned to
// the composition of public/mainmenu.png (sun/castle right-of-center, river
// bending through the lower-left valley, banner pillar at the right edge).
export default function LivingScene() {
  const fireflies = useFireflies(14);

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Ambient light rays fanning down toward the sun */}
      <div
        className="living-rays absolute"
        style={{
          left: '30%',
          top: '-20%',
          width: '56%',
          height: '80%',
          background:
            'repeating-conic-gradient(from 205deg at 50% 30%, rgba(255,224,160,0.16) 0deg 1.4deg, transparent 1.4deg 9deg)',
          mixBlendMode: 'screen',
          filter: 'blur(1.5px)',
        }}
      />

      {/* Slow drifting clouds */}
      <div
        className="living-cloud-a absolute rounded-full"
        style={{
          left: '4%',
          top: '5%',
          width: '38%',
          height: '11%',
          background: 'radial-gradient(ellipse, rgba(255,240,225,0.32), transparent 70%)',
          filter: 'blur(18px)',
        }}
      />
      <div
        className="living-cloud-b absolute rounded-full"
        style={{
          left: '46%',
          top: '1%',
          width: '30%',
          height: '9%',
          background: 'radial-gradient(ellipse, rgba(255,225,200,0.26), transparent 70%)',
          filter: 'blur(16px)',
        }}
      />
      <div
        className="living-cloud-a absolute rounded-full"
        style={{
          left: '18%',
          top: '13%',
          width: '24%',
          height: '7%',
          background: 'radial-gradient(ellipse, rgba(255,235,220,0.18), transparent 70%)',
          filter: 'blur(14px)',
          animationDuration: '115s',
        }}
      />

      {/* Water shimmer along the river bend */}
      <div
        className="living-water absolute"
        style={{
          left: '28%',
          top: '50%',
          width: '30%',
          height: '18%',
          background:
            'linear-gradient(100deg, transparent 0%, rgba(255,255,255,0.15) 46%, rgba(180,225,255,0.26) 50%, transparent 56%, transparent 100%)',
          backgroundSize: '260% 100%',
          transform: 'rotate(-16deg)',
          filter: 'blur(2.5px)',
          mixBlendMode: 'screen',
          opacity: 0.5,
        }}
      />

      {/* Waving banner accents over the pillar flags */}
      <div
        className="living-banner absolute"
        style={{
          left: '0%',
          top: '11%',
          width: '5%',
          height: '28%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(150,20,30,0.12) 40%, transparent 90%)',
        }}
      />
      <div
        className="living-banner absolute"
        style={{
          left: '92%',
          top: '38%',
          width: '8%',
          height: '32%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.05), rgba(150,20,30,0.12) 40%, transparent 90%)',
          animationDelay: '1.4s',
          animationDuration: '6.5s',
        }}
      />

      {/* Ground fog rolling through the valley */}
      <div
        className="living-fog-a absolute"
        style={{
          left: '-10%',
          bottom: '0%',
          width: '120%',
          height: '22%',
          background: 'linear-gradient(0deg, rgba(210,220,235,0.2), transparent)',
          filter: 'blur(22px)',
        }}
      />
      <div
        className="living-fog-b absolute"
        style={{
          left: '-10%',
          bottom: '3%',
          width: '120%',
          height: '15%',
          background: 'linear-gradient(0deg, rgba(190,205,225,0.14), transparent)',
          filter: 'blur(28px)',
        }}
      />

      {/* Fireflies in the foreground greenery */}
      {fireflies.map((f) => (
        <span
          key={f.id}
          className="living-firefly absolute rounded-full"
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            width: f.size,
            height: f.size,
            background: '#d9f2a3',
            boxShadow: `0 0 ${f.size * 3}px #d9f2a3`,
            animationDuration: `${f.duration}s`,
            animationDelay: `${f.delay}s`,
            ['--ff-dx' as string]: `${f.dx}px`,
            ['--ff-dy' as string]: `${f.dy}px`,
            ['--ff-dx2' as string]: `${f.dx2}px`,
            ['--ff-dy2' as string]: `${f.dy2}px`,
            ['--ff-opacity' as string]: f.opacity,
          }}
        />
      ))}

      {/* Distant birds crossing the sky */}
      {BIRDS.map((b, i) => (
        <div
          key={i}
          className="living-bird absolute"
          style={{
            left: 0,
            top: 0,
            width: 16,
            height: 8,
            animationDuration: `${b.duration}s`,
            animationDelay: `${b.delay}s`,
            ['--bird-x0' as string]: `${b.x0}vw`,
            ['--bird-y0' as string]: `${b.y0}vh`,
            ['--bird-x1' as string]: `${b.x1}vw`,
            ['--bird-y1' as string]: `${b.y1}vh`,
          }}
        />
      ))}
    </div>
  );
}
