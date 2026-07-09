import { useEffect, useState } from "react";
import { api } from "../lib/api.ts";
import { pretty, todayStr } from "../lib/util.ts";
import { CalendarHeart } from "lucide-react";
import { EmptyState } from "../components/EmptyState.tsx";
import type { Milestone } from "../types.ts";

export function Timeline() {
  const [items, setItems] = useState<Milestone[]>([]);
  const [open, setOpen] = useState(false);
  const load = () => api.get<Milestone[]>("/api/milestones").then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  async function del(id: string) { if (confirm("Delete this milestone?")) { await api.del(`/api/milestones/${id}`); load(); } }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink"><CalendarHeart className="h-6 w-6 text-rose" /> Our timeline</h1>
        <button onClick={() => setOpen(true)} className="btn btn-primary px-4 py-2 text-sm">+ Add</button>
      </div>
      {items.length === 0 ? <EmptyState Icon={CalendarHeart} title="Your timeline starts here" subtitle="Add the milestones that shaped your story — your first date, first trip, and beyond." /> : (
        <ol className="relative mt-6 border-s-2 border-rose-soft ps-5">
          {items.map((m) => (
            <li key={m.id} className="reveal mb-6">
              <span className="absolute -start-[9px] mt-1.5 h-4 w-4 rounded-full border-2 border-surface bg-rose" />
              <div className="card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-lg font-bold text-ink">{m.title}</p>
                    <p className="text-xs text-muted">{pretty(m.date)}{m.location ? ` · ${m.location}` : ""}</p>
                  </div>
                  <button onClick={() => del(m.id)} className="text-xs text-muted hover:text-red-500">Delete</button>
                </div>
                {m.description && <p className="mt-2 text-sm text-muted">{m.description}</p>}
                {m.media.length > 0 && <div className="mt-2 flex gap-2 overflow-x-auto">{m.media.map((x, i) => <img key={i} src={x.url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />)}</div>}
              </div>
            </li>
          ))}
        </ol>
      )}
      {open && <AddMilestone onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
    </div>
  );
}

function AddMilestone({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ title: "", date: todayStr(), description: "", location: "" });
  const [busy, setBusy] = useState(false);
  async function save() {
    if (!f.title.trim()) return;
    setBusy(true);
    try { await api.post("/api/milestones", f); onSaved(); } finally { setBusy(false); }
  }
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-3xl bg-surface p-5 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <p className="font-display text-lg font-bold text-ink">New milestone</p>
        <div className="mt-3 space-y-2">
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title (e.g. First date)" className="input" autoFocus />
          <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className="input" />
          <input value={f.location} onChange={(e) => setF({ ...f, location: e.target.value })} placeholder="Location (optional)" className="input" />
          <textarea rows={3} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="What happened…" className="input" />
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={onClose} className="btn btn-ghost flex-1 py-2.5">Cancel</button>
          <button onClick={save} disabled={busy} className="btn btn-primary flex-1 py-2.5 disabled:opacity-60">Save</button>
        </div>
      </div>
    </div>
  );
}
