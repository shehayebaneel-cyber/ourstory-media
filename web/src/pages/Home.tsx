import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api.ts";
import { pretty } from "../lib/util.ts";
import { useAuth } from "../context/Auth.tsx";
import { MemoryCard } from "../components/MemoryCard.tsx";
import type { HomeData, Memory } from "../types.ts";

// Ease-out count-up for the hero number.
function useCountUp(target: number, ms = 1300) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / ms);
      setN(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, ms]);
  return n;
}

export function Home() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [d, setD] = useState<HomeData | null>(null);
  const [surprise, setSurprise] = useState<Memory | null>(null);
  useEffect(() => { api.get<HomeData>("/api/home").then(setD).catch(() => {}); }, []);
  async function random() { setSurprise(await api.get<Memory | null>("/api/memories/random").catch(() => null)); }
  const days = useCountUp(d?.daysTogether ?? 0);
  if (!d) return <p className="py-16 text-center text-muted">Loading our story…</p>;

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="reveal flex items-center gap-3" style={{ animationDelay: "0s" }}>
        <div className="flex -space-x-2">
          {d.users.map((u) => u.avatarUrl
            ? <img key={u.id} src={u.avatarUrl} alt="" className="h-11 w-11 rounded-full border-2 border-surface object-cover" />
            : <span key={u.id} className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-surface bg-rose-soft font-display font-bold text-rose">{u.name.slice(0, 1).toUpperCase()}</span>)}
        </div>
        <div>
          <p className="text-sm text-muted">Welcome back{user ? `, ${user.name}` : ""} 🤍</p>
          <p className="font-display text-lg font-bold text-ink">{d.users.map((u) => u.name).join(" & ")}</p>
        </div>
      </div>

      {/* HERO — relationship counter */}
      <div className="reveal card-love relative overflow-hidden rounded-3xl border border-rose/15 p-8 text-center shadow-[0_22px_54px_-28px_rgba(224,132,154,0.55)]" style={{ animationDelay: "0.06s" }}>
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(120% 90% at 50% -10%, color-mix(in srgb, var(--rose) 22%, transparent), transparent 60%)" }} />
        <p className="relative text-[11px] font-semibold uppercase tracking-[0.32em] text-rose">together for</p>
        <p className="relative mt-1.5 font-display text-7xl font-extrabold leading-none text-ink" style={{ textShadow: "0 6px 24px rgba(224,132,154,0.32)" }}>{days.toLocaleString()}</p>
        <p className="relative mt-1 text-sm font-semibold text-ink/70">days together 💗</p>
        <p className="relative mt-2 text-xs text-muted">{d.monthsTogether} months · {d.yearsTogether} years · since {pretty(d.startDate)}</p>
      </div>

      {/* Secondary: anniversary + quote */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="reveal card p-5" style={{ animationDelay: "0.12s" }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">Next anniversary</p>
          <p className="mt-1 font-display text-3xl font-bold text-rose">{d.nextAnniversary.inDays} <span className="text-lg text-ink">days</span></p>
          <p className="text-sm text-muted">{pretty(d.nextAnniversary.date)} · year {d.nextAnniversary.year}</p>
        </div>
        <div className="reveal card-cream flex items-center rounded-3xl border border-border p-5" style={{ animationDelay: "0.16s" }}>
          <p className="font-display text-lg italic leading-snug text-ink/90">“{d.quote}”</p>
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

      {/* Subtle stats */}
      <div className="reveal card-tint flex items-center justify-between gap-3 rounded-3xl border border-border p-4">
        <p className="text-xs text-muted">{d.stats.memories} memories · {d.stats.photos} photos · {d.stats.videos} videos</p>
        <button onClick={random} className="btn btn-ghost shrink-0 px-4 py-2 text-sm">Surprise me ✨</button>
      </div>
      {surprise && <MemoryCard m={surprise} onClick={() => nav("/journal")} />}
    </div>
  );
}
