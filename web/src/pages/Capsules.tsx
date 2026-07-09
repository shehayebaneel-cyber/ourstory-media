import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api.ts";
import { pretty, todayStr } from "../lib/util.ts";
import { Modal } from "../components/Modal.tsx";
import { EmptyState } from "../components/EmptyState.tsx";
import type { Capsule } from "../types.ts";

export function Capsules() {
  const [items, setItems] = useState<Capsule[]>([]);
  const [creating, setCreating] = useState(false);
  const [viewing, setViewing] = useState<Capsule | null>(null);
  const load = () => api.get<Capsule[]>("/api/capsules").then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Time capsules ⏳</h1>
        <button onClick={() => setCreating(true)} className="btn btn-primary px-4 py-2 text-sm">+ Seal one</button>
      </div>
      <p className="mt-1 text-sm text-muted">Messages sealed until a future date 🔒</p>

      {items.length === 0 ? <EmptyState icon="⏳" title="No capsules yet" subtitle="Seal a message or memory to open together on a future date." /> : (
        <div className="mt-5 space-y-3">
          {items.map((c) => (
            <button key={c.id} onClick={() => { if (!c.sealed) setViewing(c); }} className={`card block w-full p-4 text-left transition ${c.sealed ? "opacity-80" : "hover:border-rose"}`}>
              <p className="font-display text-lg font-bold text-ink">{c.sealed ? "🔒 Sealed capsule" : (c.title || "Capsule")}</p>
              {c.sealed
                ? <p className="mt-1 text-sm text-rose">Opens {pretty(String(c.unlockAt).slice(0, 10))} ✨</p>
                : <p className="mt-1 line-clamp-2 text-sm text-muted">{c.story || ""}</p>}
            </button>
          ))}
        </div>
      )}

      {creating && <SealCapsule onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load(); }} />}
      {viewing && (
        <Modal title={viewing.title || "Capsule"} onClose={() => setViewing(null)}>
          <p className="whitespace-pre-wrap leading-relaxed text-ink">{viewing.story}</p>
        </Modal>
      )}
    </div>
  );
}

function SealCapsule({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ title: "", story: "", unlockAt: "" });
  const [busy, setBusy] = useState(false);
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!f.title.trim() || !f.unlockAt) return;
    setBusy(true);
    try { await api.post("/api/memories", { title: f.title, story: f.story, date: todayStr(), unlockAt: f.unlockAt + "T00:00:00" }); onSaved(); } finally { setBusy(false); }
  }
  return (
    <Modal title="Seal a time capsule" onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Capsule title" className="input" autoFocus />
        <textarea value={f.story} onChange={(e) => setF({ ...f, story: e.target.value })} rows={6} placeholder="A message to open in the future…" className="input" />
        <label className="block text-sm text-muted">Open on
          <input type="date" value={f.unlockAt} onChange={(e) => setF({ ...f, unlockAt: e.target.value })} className="input mt-1" />
        </label>
        <button disabled={busy} className="btn btn-primary w-full py-2.5 disabled:opacity-60">{busy ? "Sealing…" : "Seal it 🔒"}</button>
      </form>
    </Modal>
  );
}
