import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api.ts";
import type { Song } from "../types.ts";

export function Playlist() {
  const [items, setItems] = useState<Song[]>([]);
  const [adding, setAdding] = useState(false);
  const [f, setF] = useState({ title: "", artist: "", url: "", note: "" });
  const load = () => api.get<Song[]>("/api/songs").then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);
  async function add(e: FormEvent) { e.preventDefault(); if (!f.title.trim()) return; await api.post("/api/songs", f); setF({ title: "", artist: "", url: "", note: "" }); setAdding(false); load(); }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Our playlist 🎵</h1>
        <button onClick={() => setAdding((a) => !a)} className="btn btn-primary px-4 py-2 text-sm">+ Song</button>
      </div>
      {adding && (
        <form onSubmit={add} className="card mt-4 space-y-2 p-4">
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Song title" className="input" autoFocus />
          <input value={f.artist} onChange={(e) => setF({ ...f, artist: e.target.value })} placeholder="Artist" className="input" />
          <input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} placeholder="Spotify / YouTube link (optional)" className="input" />
          <input value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Why it's ours 💕 (optional)" className="input" />
          <button className="btn btn-primary w-full py-2.5">Add song</button>
        </form>
      )}
      {items.length === 0 ? <p className="mt-10 text-center text-muted">No songs yet — add the first one 🎶</p> : (
        <div className="mt-5 space-y-2">
          {items.map((s) => (
            <div key={s.id} className="card flex items-center gap-3 p-3.5">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-soft text-lg">🎵</span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{s.title}</p>
                <p className="truncate text-xs text-muted">{[s.artist, s.note].filter(Boolean).join(" · ")}</p>
              </div>
              {s.url && <a href={s.url} target="_blank" rel="noreferrer" className="shrink-0 text-rose">▶</a>}
              <button onClick={() => api.del(`/api/songs/${s.id}`).then(load)} className="shrink-0 px-1 text-muted hover:text-rose">✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
