import { useCallback, useEffect, useState } from "react";
import { Shuffle, BookOpen } from "lucide-react";
import { api } from "../lib/api.ts";
import { MemoryCard } from "../components/MemoryCard.tsx";
import { EmptyState } from "../components/EmptyState.tsx";
import type { Memory } from "../types.ts";

export function Random() {
  const [mem, setMem] = useState<Memory | null>(null);
  const [empty, setEmpty] = useState(false);
  const load = useCallback(() => {
    api.get<Memory | null>("/api/memories/random").then((m) => { if (m) { setMem(m); setEmpty(false); } else setEmpty(true); }).catch(() => setEmpty(true));
  }, []);
  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink"><Shuffle className="h-6 w-6 text-rose" /> Random memory</h1>
      {empty ? (
        <EmptyState Icon={BookOpen} title="No memories yet" subtitle="Add a few memories and we'll surprise you with one." />
      ) : mem ? (
        <div className="mt-5">
          <MemoryCard m={mem} onClick={() => { /* view */ }} />
          <button onClick={load} className="btn btn-primary mt-5 w-full py-2.5"><Shuffle className="h-4 w-4" /> Show me another</button>
        </div>
      ) : <p className="mt-10 text-center text-muted">Loading…</p>}
    </div>
  );
}
