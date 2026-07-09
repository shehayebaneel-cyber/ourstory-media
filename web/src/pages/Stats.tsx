import { useEffect, useState } from "react";
import { api } from "../lib/api.ts";
import { TrendingUp, BookOpen, Camera, Film, MapPin, Sparkles, Mail, Music, Plane } from "lucide-react";
import { pretty } from "../lib/util.ts";
import type { Stats as S } from "../types.ts";

export function Stats() {
  const [s, setS] = useState<S | null>(null);
  useEffect(() => { api.get<S>("/api/stats").then(setS).catch(() => {}); }, []);
  if (!s) return <p className="mt-10 text-center text-muted">Loading…</p>;
  const maxM = Math.max(1, ...s.byMonth.map((x) => x.count));
  const tiles = [
    { label: "Memories", value: s.memories, Icon: BookOpen }, { label: "Photos", value: s.photos, Icon: Camera },
    { label: "Videos", value: s.videos, Icon: Film }, { label: "Places", value: s.places, Icon: MapPin },
    { label: "Milestones", value: s.milestones, Icon: Sparkles }, { label: "Letters", value: s.letters, Icon: Mail },
    { label: "Songs", value: s.songs, Icon: Music }, { label: "Trips", value: s.trips, Icon: Plane },
  ];

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink"><TrendingUp className="h-6 w-6 text-rose" /> Our stats</h1>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {tiles.map((t) => (
          <div key={t.label} className="card p-4 text-center">
            <t.Icon className="mx-auto h-6 w-6 text-rose" strokeWidth={2} />
            <p className="mt-1.5 font-display text-2xl font-extrabold text-rose">{t.value}</p>
            <p className="text-xs text-muted">{t.label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {s.topMood && <div className="card p-4"><p className="text-xs text-muted">Most common mood</p><p className="mt-1 font-display text-lg font-bold text-ink">{s.topMood}</p></div>}
        {s.avgRating > 0 && <div className="card p-4"><p className="text-xs text-muted">Average day rating</p><p className="mt-1 font-display text-lg font-bold text-ink">{s.avgRating} / 10</p></div>}
        <div className="card p-4"><p className="text-xs text-muted">Bucket list</p><p className="mt-1 font-display text-lg font-bold text-ink">{s.bucketDone} / {s.bucketTotal} done</p></div>
        {s.firstDate && <div className="card p-4"><p className="text-xs text-muted">First memory</p><p className="mt-1 font-display text-lg font-bold text-ink">{pretty(s.firstDate)}</p></div>}
      </div>
      {s.byMonth.length > 0 && (
        <div className="card mt-4 p-5">
          <p className="font-display font-bold text-ink">Memories by month</p>
          <div className="mt-4 flex h-32 items-end gap-1">
            {s.byMonth.map((x) => <div key={x.month} className="flex-1 rounded-t bg-rose" style={{ height: `${(x.count / maxM) * 100}%` }} title={`${x.month}: ${x.count}`} />)}
          </div>
        </div>
      )}
    </div>
  );
}
