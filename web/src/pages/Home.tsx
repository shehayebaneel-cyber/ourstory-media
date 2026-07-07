import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.ts";
import { pretty } from "../lib/util.ts";
import { useAuth } from "../context/Auth.tsx";
import { MemoryCard } from "../components/MemoryCard.tsx";
import type { HomeData, Memory } from "../types.ts";

export function Home() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [d, setD] = useState<HomeData | null>(null);
  const [surprise, setSurprise] = useState<Memory | null>(null);
  useEffect(() => { api.get<HomeData>("/api/home").then(setD).catch(() => {}); }, []);
  async function random() { setSurprise(await api.get<Memory | null>("/api/memories/random").catch(() => null)); }
  if (!d) return <p className="py-16 text-center text-muted">Loading our story…</p>;

  return (
    <div className="space-y-5">
      <div className="reveal flex items-center gap-3">
        <div className="flex -space-x-2">
          {d.users.map((u) => u.avatarUrl
            ? <img key={u.id} src={u.avatarUrl} alt="" className="h-11 w-11 rounded-full border-2 border-surface object-cover" />
            : <span key={u.id} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-surface bg-rose-soft font-display font-bold text-rose">{u.name.slice(0, 1)}</span>)}
        </div>
        <div>
          <p className="text-sm text-muted">Welcome back{user ? `, ${user.name}` : ""} 🤍</p>
          <p className="font-display text-lg font-bold text-ink">{d.users.map((u) => u.name).join(" & ")}</p>
        </div>
      </div>

      <div className="reveal card p-6 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-rose">together for</p>
        <p className="font-display text-6xl font-extrabold text-ink">{d.daysTogether.toLocaleString()}</p>
        <p className="text-muted">days · {d.monthsTogether} months · {d.yearsTogether} years</p>
        <p className="mt-1 text-xs text-muted">since {pretty(d.startDate)}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="reveal card p-5">
          <p className="text-xs uppercase tracking-wide text-muted">Next anniversary</p>
          <p className="mt-1 font-display text-3xl font-bold text-rose">{d.nextAnniversary.inDays} <span className="text-lg text-ink">days</span></p>
          <p className="text-sm text-muted">{pretty(d.nextAnniversary.date)} · year {d.nextAnniversary.year}</p>
        </div>
        <div className="reveal card flex items-center p-5">
          <p className="font-display text-lg italic leading-snug text-ink">“{d.quote}”</p>
        </div>
      </div>

      {d.onThisDay.length > 0 && (
        <div className="reveal space-y-2">
          <p className="font-display text-lg font-bold text-ink">On this day 🗓️</p>
          {d.onThisDay.map((m) => <MemoryCard key={m.id} m={m} onClick={() => nav("/journal")} />)}
        </div>
      )}

      {d.latest && (
        <div className="reveal space-y-2">
          <p className="font-display text-lg font-bold text-ink">Latest memory</p>
          <MemoryCard m={d.latest} onClick={() => nav("/journal")} />
        </div>
      )}

      {d.featuredPhoto && <img src={d.featuredPhoto.url} alt="" className="reveal max-h-96 w-full rounded-3xl object-cover" />}

      <div className="reveal card flex items-center justify-between gap-3 p-5">
        <p className="text-sm text-muted">{d.stats.memories} memories · {d.stats.photos} photos · {d.stats.videos} videos</p>
        <button onClick={random} className="btn btn-ghost shrink-0 px-4 py-2 text-sm">Surprise me ✨</button>
      </div>
      {surprise && <MemoryCard m={surprise} onClick={() => nav("/journal")} />}
    </div>
  );
}
