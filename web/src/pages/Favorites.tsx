import { useEffect, useState } from "react";
import { api } from "../lib/api.ts";
import { MemoryCard } from "../components/MemoryCard.tsx";
import type { Memory } from "../types.ts";

export function Favorites() {
  const [items, setItems] = useState<Memory[]>([]);
  useEffect(() => { api.get<Memory[]>("/api/favorites").then(setItems).catch(() => {}); }, []);
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Favorites ⭐</h1>
      {items.length === 0 ? <p className="mt-10 text-center text-muted">Star a memory to see it here.</p> : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{items.map((m) => <MemoryCard key={m.id} m={m} onClick={() => { /* view in journal */ }} />)}</div>
      )}
    </div>
  );
}
