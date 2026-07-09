import { useMemo } from "react";

const HEARTS = ["💗", "💖", "❤️", "💕", "💓"];

// A dreamy, GPU-cheap layer of hearts (pulsing) & butterflies (wing-flapping in 3D)
// drifting up the screen. Purely decorative — pointer-events-none, reduced-motion aware.
export function LoveAmbiance() {
  const items = useMemo(() => {
    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    return Array.from({ length: 16 }, (_, i) => {
      const butterfly = i % 4 === 0;
      return {
        id: i,
        butterfly,
        emoji: butterfly ? "🦋" : HEARTS[Math.floor(Math.random() * HEARTS.length)],
        left: `${rand(-4, 100)}%`,                                   // some drift in from the edges
        size: `${rand(butterfly ? 18 : 11, butterfly ? 40 : 34)}px`, // wider size range
        dur: `${rand(13, 28)}s`,
        delay: `${-rand(0, 28)}s`,
        sway: `${rand(-60, 60)}px`,
        beat: `${rand(0.85, 1.5)}s`,
        peak: rand(0.28, 0.8).toFixed(2),                            // varied opacity
      };
    });
  }, []);

  return (
    <div aria-hidden className="love-layer pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {items.map((it) => (
        <span key={it.id} className="love-float" style={{ left: it.left, fontSize: it.size, animationDuration: it.dur, animationDelay: it.delay, ["--sway" as string]: it.sway, ["--peak" as string]: it.peak }}>
          <span className={it.butterfly ? "love-flap" : "love-beat"} style={{ animationDuration: it.beat }}>{it.emoji}</span>
        </span>
      ))}
    </div>
  );
}
