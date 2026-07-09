import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api.ts";
import type { BucketItem } from "../types.ts";

const CATS = ["Travel", "Food", "Adventure", "Cozy", "Someday"];
const EMOJI: Record<string, string> = { Travel: "✈️", Food: "🍜", Adventure: "🏔️", Cozy: "🛋️", Someday: "✨" };

export function Bucket() {
  const [items, setItems] = useState<BucketItem[]>([]);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Travel");
  const [filter, setFilter] = useState("All");
  const load = () => api.get<BucketItem[]>("/api/bucket").then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  async function add(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/api/bucket", { title, category });
    setTitle(""); setAdding(false); load();
  }
  const toggle = (b: BucketItem) => api.patch(`/api/bucket/${b.id}`, { done: !b.done }).then(load);
  const remove = (b: BucketItem) => api.del(`/api/bucket/${b.id}`).then(load);

  const shown = filter === "All" ? items : items.filter((i) => i.category === filter);
  const done = items.filter((i) => i.done).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Bucket list</h1>
        <button onClick={() => setAdding((a) => !a)} className="btn btn-primary px-4 py-2 text-sm">+ Add</button>
      </div>

      {items.length > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm text-muted"><span>{done} of {items.length} done</span><span>{Math.round((done / items.length) * 100)}%</span></div>
          <div className="mt-1 h-2 rounded-full bg-surface-2"><div className="h-2 rounded-full bg-rose transition-all" style={{ width: `${(done / items.length) * 100}%` }} /></div>
        </div>
      )}

      {adding && (
        <form onSubmit={add} className="card mt-4 space-y-3 p-4">
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Something to do together…" className="input" autoFocus />
          <div className="flex flex-wrap gap-2">{CATS.map((c) => <button type="button" key={c} onClick={() => setCategory(c)} className={`chip ${category === c ? "chip-active" : ""}`}>{EMOJI[c]} {c}</button>)}</div>
          <button className="btn btn-primary w-full py-2.5">Add to list</button>
        </form>
      )}

      <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
        {["All", ...CATS].map((c) => <button key={c} onClick={() => setFilter(c)} className={`chip shrink-0 ${filter === c ? "chip-active" : ""}`}>{c === "All" ? "All" : `${EMOJI[c]} ${c}`}</button>)}
      </div>

      {shown.length === 0 ? <p className="mt-10 text-center text-muted">Nothing here yet — add your first dream ✨</p> : (
        <div className="mt-4 space-y-2">
          {shown.map((b) => (
            <div key={b.id} className="card flex items-center gap-3 p-3.5">
              <button onClick={() => toggle(b)} className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-sm transition ${b.done ? "border-rose bg-rose text-white" : "border-border text-transparent"}`}>✓</button>
              <div className="min-w-0 flex-1">
                <p className={`font-semibold ${b.done ? "text-muted line-through" : "text-ink"}`}>{b.title}</p>
                {b.category && <p className="text-xs text-muted">{EMOJI[b.category] ?? "•"} {b.category}</p>}
              </div>
              <button onClick={() => remove(b)} className="shrink-0 px-1 text-muted transition hover:text-rose">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
