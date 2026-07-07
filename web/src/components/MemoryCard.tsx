import type { Memory } from "../types.ts";
import { pretty } from "../lib/util.ts";

export function MemoryCard({ m, onClick }: { m: Memory; onClick?: () => void }) {
  const photo = m.media.find((x) => x.url && x.type !== "VIDEO") ?? m.media.find((x) => x.url);
  return (
    <button onClick={onClick} className="lift card block w-full overflow-hidden text-left">
      {photo && <img src={photo.url} alt="" loading="lazy" className="h-44 w-full object-cover" />}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="font-display text-lg font-bold text-ink">{m.title}</p>
          {m.rating > 0 && <span className="shrink-0 text-sm font-semibold text-gold">{m.rating}/10</span>}
        </div>
        <p className="text-xs text-muted">{pretty(m.date)}{m.location ? ` · ${m.location}` : ""}{m.mood ? ` · ${m.mood}` : ""}</p>
        {m.story && <p className="mt-1 line-clamp-2 text-sm text-muted">{m.story}</p>}
        {m.reactions.length > 0 && <p className="mt-2 text-base">{m.reactions.map((r, i) => <span key={i}>{r.emoji}</span>)}</p>}
      </div>
    </button>
  );
}
