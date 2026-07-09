import { useEffect, useState } from "react";
import { api } from "../lib/api.ts";
import { MemoryCard } from "../components/MemoryCard.tsx";
import { Star } from "lucide-react";
import { EmptyState } from "../components/EmptyState.tsx";
import type { Memory } from "../types.ts";

export function Favorites() {
  const [items, setItems] = useState<Memory[]>([]);
  useEffect(() => { api.get<Memory[]>("/api/favorites").then(setItems).catch(() => {}); }, []);
  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink"><Star className="h-6 w-6 text-rose" /> Favorites</h1>
      {items.length === 0 ? <EmptyState Icon={Star} title="No favorites yet" subtitle="Star the memories you love most and they'll gather here." /> : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">{items.map((m) => <MemoryCard key={m.id} m={m} onClick={() => { /* view in journal */ }} />)}</div>
      )}
    </div>
  );
}
