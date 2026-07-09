import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api.ts";
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
      <h1 className="font-display text-2xl font-bold text-ink">Notes & inside jokes</h1>
      <form onSubmit={add} className="card mt-4 space-y-2 p-4">
        <div className="flex gap-2">
          <button type="button" onClick={() => setKind("note")} className={`chip ${kind === "note" ? "chip-active" : ""}`}>📝 Note</button>
          <button type="button" onClick={() => setKind("joke")} className={`chip ${kind === "joke" ? "chip-active" : ""}`}>😂 Inside joke</button>
        </div>
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} placeholder={kind === "joke" ? "That thing only we find funny…" : "A little note…"} className="input" />
        <button className="btn btn-primary w-full py-2.5">Add</button>
      </form>
      {items.length === 0 ? <p className="mt-10 text-center text-muted">Nothing yet — jot your first note 📝</p> : (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {items.map((n) => (
            <div key={n.id} className={`card p-4 ${n.pinned ? "ring-2 ring-rose/40" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="text-lg">{n.kind === "joke" ? "😂" : "📝"}</span>
                <div className="flex gap-2 text-sm">
                  <button onClick={() => api.patch(`/api/notes/${n.id}`, { pinned: !n.pinned }).then(load)} className={n.pinned ? "text-rose" : "text-muted hover:text-rose"}>📌</button>
                  <button onClick={() => api.del(`/api/notes/${n.id}`).then(load)} className="text-muted hover:text-rose">✕</button>
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
