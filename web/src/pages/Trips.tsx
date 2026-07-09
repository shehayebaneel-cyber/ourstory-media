import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api.ts";
import { pretty } from "../lib/util.ts";
import { EmptyState } from "../components/EmptyState.tsx";
import type { Trip } from "../types.ts";

export function Trips() {
  const [items, setItems] = useState<Trip[]>([]);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ destination: "", startDate: "", endDate: "", notes: "" });
  const load = () => api.get<Trip[]>("/api/trips").then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  async function add(e: FormEvent) { e.preventDefault(); if (!f.destination.trim()) return; await api.post("/api/trips", f); setF({ destination: "", startDate: "", endDate: "", notes: "" }); setAdding(false); load(); }
  const patch = (t: Trip, body: Partial<Trip>) => api.patch(`/api/trips/${t.id}`, body).then(load);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Trips ✈️</h1>
        <button onClick={() => setAdding((a) => !a)} className="btn btn-primary px-4 py-2 text-sm">+ Trip</button>
      </div>
      {adding && (
        <form onSubmit={add} className="card mt-4 space-y-2 p-4">
          <input value={f.destination} onChange={(e) => setF({ ...f, destination: e.target.value })} placeholder="Destination" className="input" autoFocus />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={f.startDate} onChange={(e) => setF({ ...f, startDate: e.target.value })} className="input" />
            <input type="date" value={f.endDate} onChange={(e) => setF({ ...f, endDate: e.target.value })} className="input" />
          </div>
          <button className="btn btn-primary w-full py-2.5">Add trip</button>
        </form>
      )}
      {items.length === 0 ? <EmptyState icon="✈️" title="No trips yet" subtitle="Plan your next adventure together — with a packing checklist." /> : (
        <div className="mt-5 space-y-3">{items.map((t) => <TripCard key={t.id} t={t} onPatch={patch} onDelete={() => api.del(`/api/trips/${t.id}`).then(load)} />)}</div>
      )}
    </div>
  );
}

function TripCard({ t, onPatch, onDelete }: { t: Trip; onPatch: (t: Trip, b: Partial<Trip>) => void; onDelete: () => void }) {
  const [item, setItem] = useState("");
  const toggle = (i: number) => onPatch(t, { checklist: t.checklist.map((c, idx) => idx === i ? { ...c, done: !c.done } : c) });
  const addItem = () => { if (!item.trim()) return; onPatch(t, { checklist: [...t.checklist, { text: item, done: false }] }); setItem(""); };
  return (
    <div className="card p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="font-display text-lg font-bold text-ink">{t.destination}</p>
          {(t.startDate || t.endDate) && <p className="text-xs text-muted">{[t.startDate && pretty(t.startDate), t.endDate && pretty(t.endDate)].filter(Boolean).join(" → ")}</p>}
        </div>
        <button onClick={onDelete} className="text-muted hover:text-rose">✕</button>
      </div>
      {t.checklist.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {t.checklist.map((c, i) => (
            <label key={i} className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={c.done} onChange={() => toggle(i)} className="h-4 w-4 accent-rose" />
              <span className={c.done ? "text-muted line-through" : "text-ink"}>{c.text}</span>
            </label>
          ))}
        </div>
      )}
      <div className="mt-2 flex gap-2">
        <input value={item} onChange={(e) => setItem(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addItem(); } }} placeholder="Add to checklist…" className="input !py-2 text-sm" />
        <button onClick={addItem} className="btn btn-ghost px-3 text-sm">+</button>
      </div>
    </div>
  );
}
