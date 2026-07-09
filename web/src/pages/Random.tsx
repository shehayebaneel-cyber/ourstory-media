import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/api.ts";
import { MemoryCard } from "../components/MemoryCard.tsx";
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
      <h1 className="font-display text-2xl font-bold text-ink">Random memory 🎲</h1>
      {empty ? (
        <p className="mt-10 text-center text-muted">No memories yet — add some first 📖</p>
      ) : mem ? (
        <div className="mt-5">
          <MemoryCard m={mem} onClick={() => { /* view */ }} />
          <button onClick={load} className="btn btn-primary mt-5 w-full py-2.5">🎲 Show me another</button>
        </div>
      ) : <p className="mt-10 text-center text-muted">Loading…</p>}
    </div>
  );
}
