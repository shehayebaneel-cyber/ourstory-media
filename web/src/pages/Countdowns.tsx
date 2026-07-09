import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api.ts";
import { pretty, todayStr } from "../lib/util.ts";
import { EmptyState } from "../components/EmptyState.tsx";
import type { Countdown } from "../types.ts";

const daysUntil = (d: string) => Math.ceil((new Date(d + "T00:00:00").getTime() - new Date(todayStr() + "T00:00:00").getTime()) / 86400000);
const EMOJIS = ["🎉", "✈️", "💍", "🎂", "🏖️", "🎄", "❤️", "🍽️"];

export function Countdowns() {
  const [items, setItems] = useState<Countdown[]>([]);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ title: "", date: "", emoji: "🎉" });
  const load = () => api.get<Countdown[]>("/api/countdowns").then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  async function add(e: FormEvent) {
    e.preventDefault();
    if (!f.title.trim() || !f.date) return;
    await api.post("/api/countdowns", f); setF({ title: "", date: "", emoji: "🎉" }); setAdding(false); load();
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Countdowns</h1>
        <button onClick={() => setAdding((a) => !a)} className="btn btn-primary px-4 py-2 text-sm">+ Add</button>
      </div>

      {adding && (
        <form onSubmit={add} className="card mt-4 space-y-3 p-4">
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="What are we counting down to?" className="input" autoFocus />
          <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className="input" />
          <div className="flex flex-wrap gap-2">{EMOJIS.map((em) => <button type="button" key={em} onClick={() => setF({ ...f, emoji: em })} className={`chip text-lg ${f.emoji === em ? "chip-active" : ""}`}>{em}</button>)}</div>
          <button className="btn btn-primary w-full py-2.5">Add countdown</button>
        </form>
      )}

      {items.length === 0 ? <EmptyState icon="🎉" title="Nothing to count down to… yet" subtitle="Add an anniversary, a trip, or a date night to look forward to." /> : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {items.map((c) => {
            const d = daysUntil(c.date);
            return (
              <div key={c.id} className="card relative overflow-hidden p-5">
                <button onClick={() => api.del(`/api/countdowns/${c.id}`).then(load)} className="absolute right-3 top-3 text-muted transition hover:text-rose">✕</button>
                <p className="text-3xl">{c.emoji}</p>
                <p className="mt-2 font-display text-lg font-bold text-ink">{c.title}</p>
                <p className="text-sm text-muted">{pretty(c.date)}</p>
                <p className="mt-3 font-display text-3xl font-extrabold text-rose">{d < 0 ? "🎊 Here!" : d === 0 ? "Today!" : `${d} ${d === 1 ? "day" : "days"}`}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
