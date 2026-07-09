import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api.ts";
import { MemoryCard } from "../components/MemoryCard.tsx";
import type { Memory } from "../types.ts";

export function Search() {
  const [all, setAll] = useState<Memory[]>([]);
  const [q, setQ] = useState("");
  useEffect(() => { api.get<Memory[]>("/api/memories").then(setAll).catch(() => {}); }, []);
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return all.filter((m) => [m.title, m.story, m.location, m.mood, m.food, m.songs, m.insideJokes, ...(m.tags || [])].join(" ").toLowerCase().includes(s));
  }, [q, all]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Search</h1>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search memories, places, moods…" className="input mt-4" autoFocus />
      {q.trim() && <p className="mt-3 text-sm text-muted">{results.length} result{results.length === 1 ? "" : "s"}</p>}
      <div className="mt-4 grid gap-4 sm:grid-cols-2">{results.map((m) => <MemoryCard key={m.id} m={m} onClick={() => { /* view */ }} />)}</div>
    </div>
  );
}
