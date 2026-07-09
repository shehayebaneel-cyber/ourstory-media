import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api.ts";
import type { Gift } from "../types.ts";

export function Gifts() {
  const [items, setItems] = useState<Gift[]>([]);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ idea: "", forName: "", occasion: "" });
  const load = () => api.get<Gift[]>("/api/gifts").then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  async function add(e: FormEvent) { e.preventDefault(); if (!f.idea.trim()) return; await api.post("/api/gifts", f); setF({ idea: "", forName: "", occasion: "" }); setAdding(false); load(); }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Gift ideas 🎁</h1>
        <button onClick={() => setAdding((a) => !a)} className="btn btn-primary px-4 py-2 text-sm">+ Idea</button>
      </div>
      {adding && (
        <form onSubmit={add} className="card mt-4 space-y-2 p-4">
          <input value={f.idea} onChange={(e) => setF({ ...f, idea: e.target.value })} placeholder="Gift idea" className="input" autoFocus />
          <div className="grid grid-cols-2 gap-2">
            <input value={f.forName} onChange={(e) => setF({ ...f, forName: e.target.value })} placeholder="For…" className="input" />
            <input value={f.occasion} onChange={(e) => setF({ ...f, occasion: e.target.value })} placeholder="Occasion" className="input" />
          </div>
          <button className="btn btn-primary w-full py-2.5">Save idea</button>
        </form>
      )}
      {items.length === 0 ? <p className="mt-10 text-center text-muted">No gift ideas yet 🎁</p> : (
        <div className="mt-5 space-y-2">
          {items.map((g) => (
            <div key={g.id} className="card flex items-center gap-3 p-3.5">
              <button onClick={() => api.patch(`/api/gifts/${g.id}`, { bought: !g.bought }).then(load)} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm transition ${g.bought ? "border-rose bg-rose text-white" : "border-border text-transparent"}`}>✓</button>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${g.bought ? "text-muted line-through" : "text-ink"}`}>{g.idea}</p>
                {(g.forName || g.occasion) && <p className="text-xs text-muted">{[g.forName && `for ${g.forName}`, g.occasion].filter(Boolean).join(" · ")}</p>}
              </div>
              <button onClick={() => api.del(`/api/gifts/${g.id}`).then(load)} className="shrink-0 px-1 text-muted hover:text-rose">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
