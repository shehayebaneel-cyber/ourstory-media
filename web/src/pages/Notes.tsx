import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api.ts";
import { StickyNote, Laugh, Pin, X } from "lucide-react";
import { EmptyState } from "../components/EmptyState.tsx";
import type { Note } from "../types.ts";

export function Notes() {
  const [items, setItems] = useState<Note[]>([]);
  const [text, setText] = useState("");
  const [kind, setKind] = useState("note");
  const load = () => api.get<Note[]>("/api/notes").then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  async function add(e: FormEvent) { e.preventDefault(); if (!text.trim()) return; await api.post("/api/notes", { text, kind }); setText(""); load(); }

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink"><StickyNote className="h-6 w-6 text-rose" /> Notes & inside jokes</h1>
      <form onSubmit={add} className="card mt-4 space-y-2 p-4">
        <div className="flex gap-2">
          <button type="button" onClick={() => setKind("note")} className={`chip inline-flex items-center gap-1.5 ${kind === "note" ? "chip-active" : ""}`}><StickyNote className="h-3.5 w-3.5" /> Note</button>
          <button type="button" onClick={() => setKind("joke")} className={`chip inline-flex items-center gap-1.5 ${kind === "joke" ? "chip-active" : ""}`}><Laugh className="h-3.5 w-3.5" /> Inside joke</button>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={kind === "joke" ? "That thing only we find funny…" : "A little note…"} className="input" />
        <button className="btn btn-primary w-full py-2.5">Add</button>
      </form>
      {items.length === 0 ? <EmptyState Icon={StickyNote} title="No notes yet" subtitle="Jot a sweet note or capture an inside joke only you two get." /> : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {items.map((n) => (
            <div key={n.id} className={`card p-4 ${n.pinned ? "ring-2 ring-rose/40" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                {n.kind === "joke" ? <Laugh className="h-5 w-5 text-amber-500" /> : <StickyNote className="h-5 w-5 text-rose" />}
                <div className="flex gap-2.5 text-sm">
                  <button onClick={() => api.patch(`/api/notes/${n.id}`, { pinned: !n.pinned }).then(load)} className={n.pinned ? "text-rose" : "text-muted hover:text-rose"}><Pin className={`h-4 w-4 ${n.pinned ? "fill-rose" : ""}`} /></button>
                  <button onClick={() => api.del(`/api/notes/${n.id}`).then(load)} className="text-muted hover:text-rose"><X className="h-4 w-4" /></button>
                </div>
              </div>
              <p className="mt-1 whitespace-pre-wrap text-ink">{n.text}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
