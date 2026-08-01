import { useMemo } from 'react';

interface MenuBackdropProps {
  accent?: string;
  glow?: string;
  /** When true, skip the dark base fill + aurora glow blobs — just the rising embers, meant to sit as a light overlay on top of a real background image. */
  embersOnly?: boolean;
}

interface Ember {
  id: number;
  left: number;
  bottom: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

// A reliable, always-visible animated backdrop — pure CSS, no asset loading,
// no 3D scene to fail to load. Slow-drifting aurora glow + rising embers.
export default function MenuBackdrop({ accent = '#c084fc', glow = '#a78bfa', embersOnly = false }: MenuBackdropProps) {
  const embers = useMemo<Ember[]>(
    () =>
      Array.from({ length: 40 }).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        bottom: -5 - Math.random() * 15,
        size: 1.5 + Math.random() * 3,
        duration: 9 + Math.random() * 12,
        delay: Math.random() * 14,
        drift: (Math.random() - 0.5) * 60,
        opacity: 0.35 + Math.random() * 0.45,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
      {!embersOnly && (
        <>
          <div
            className="absolute inset-0"
            style={{ background: 'radial-gradient(circle at 20% 30%, #0d0a18 0%, #05050a 65%)' }}
          />
          <div
            className="menu-aurora-a absolute -inset-1/4 rounded-full blur-3xl opacity-35"
            style={{ background: `radial-gradient(circle, ${accent}55, transparent 60%)` }}
          />
          <div
            className="menu-aurora-b absolute -inset-1/4 rounded-full blur-3xl opacity-25"
            style={{ background: `radial-gradient(circle at 70% 60%, ${glow}55, transparent 55%)`, left: '20%', top: '10%' }}
          />
        </>
      )}
      {embers.map((e) => (
        <span
          key={e.id}
          className="ember-particle absolute rounded-full"
          style={{
            left: `${e.left}%`,
            bottom: `${e.bottom}%`,
            width: e.size,
            height: e.size,
            background: accent,
            boxShadow: `0 0 ${e.size * 3}px ${accent}`,
            animation: `emberFloat ${e.duration}s ease-in ${e.delay}s infinite`,
            ['--ember-drift' as string]: `${e.drift}px`,
            ['--ember-opacity' as string]: e.opacity,
          }}
        />
      ))}
    </div>
  );
}
