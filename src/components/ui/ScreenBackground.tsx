import LivingScene from './LivingScene';

interface ScreenBackgroundProps {
  /** Dial the stage-left darkening down for screens that need the art visible behind centered content. */
  overlayStrength?: 'heavy' | 'medium';
  /** Layer in the animated clouds/fog/fireflies/birds/water-shimmer scene (main menu only — keep other screens lighter). */
  living?: boolean;
}

// Full-bleed painted backdrop shared by menu-style screens. Must sit inside an
// `isolate` (or otherwise stacking-context-establishing) ancestor — plain
// `position:relative` with `z-index:auto` does NOT create one, so negative
// z-index children sink to the document root and paint behind body's opaque
// background instead of behind this screen's own content.
export default function ScreenBackground({ overlayStrength = 'medium', living = false }: ScreenBackgroundProps) {
  const sideGradient =
    overlayStrength === 'heavy'
      ? 'linear-gradient(90deg, rgba(6,4,3,0.92) 0%, rgba(8,5,4,0.72) 32%, rgba(8,5,4,0.28) 58%, rgba(8,5,4,0.05) 78%, transparent 100%)'
      : 'linear-gradient(180deg, rgba(6,4,3,0.82) 0%, rgba(8,5,4,0.6) 40%, rgba(8,5,4,0.6) 60%, rgba(6,4,3,0.85) 100%)';

  return (
    <>
      <div className="absolute inset-0 -z-20 menu-kenburns">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/mainmenu.png)' }}
        />
      </div>
      {living && <LivingScene />}
      <div className="absolute inset-0 -z-10" style={{ background: sideGradient }} />
      {overlayStrength === 'heavy' && (
        <div
          className="absolute inset-0 -z-10"
          style={{ background: 'linear-gradient(0deg, rgba(4,3,2,0.85) 0%, transparent 22%, transparent 78%, rgba(4,3,2,0.55) 100%)' }}
        />
      )}
    </>
  );
}
