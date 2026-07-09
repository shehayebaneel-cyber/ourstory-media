import { useEffect, useState, type FormEvent } from "react";
import { api } from "../lib/api.ts";
import { useAuth } from "../context/Auth.tsx";
import { pretty } from "../lib/util.ts";
import { Modal } from "../components/Modal.tsx";
import type { Letter } from "../types.ts";

export function Letters() {
  const { user } = useAuth();
  const [items, setItems] = useState<Letter[]>([]);
  const [writing, setWriting] = useState(false);
  const [reading, setReading] = useState<Letter | null>(null);
  const load = () => api.get<Letter[]>("/api/letters").then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  function open(l: Letter) {
    if (l.sealed) return;
    setReading(l);
    if (!l.readAt) api.patch(`/api/letters/${l.id}`, { read: true }).then(load).catch(() => {});
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-ink">Love letters</h1>
        <button onClick={() => setWriting(true)} className="btn btn-primary px-4 py-2 text-sm">✍️ Write</button>
      </div>

      {items.length === 0 ? <p className="mt-10 text-center text-muted">No letters yet — write one to your love 💌</p> : (
        <div className="mt-5 space-y-3">
          {items.map((l) => (
            <button key={l.id} onClick={() => open(l)} className={`card block w-full p-4 text-left transition active:scale-[0.99] ${l.sealed ? "opacity-80" : "hover:border-rose"}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-lg font-bold text-ink">{l.sealed ? "🔒 Sealed letter" : (l.title || "A letter")}</p>
                {!l.sealed && !l.readAt && <span className="rounded-full bg-rose px-2 py-0.5 text-[10px] font-bold text-white">new</span>}
              </div>
              <p className="mt-1 text-sm text-muted">From <b className="text-ink">{l.fromName}</b>{l.toName ? ` to ${l.toName}` : ""} · {pretty(String(l.createdAt).slice(0, 10))}</p>
              {l.sealed && <p className="mt-2 text-sm text-rose">Opens {pretty(String(l.unlockAt).slice(0, 10))} 💝</p>}
              {!l.sealed && l.body && <p className="mt-2 line-clamp-2 text-sm text-muted">{l.body}</p>}
            </button>
          ))}
        </div>
      )}

      {writing && <WriteLetter defaultFrom={user?.name ?? "Me"} onClose={() => setWriting(false)} onSaved={() => { setWriting(false); load(); }} />}
      {reading && (
        <Modal title={reading.title || "A letter"} onClose={() => setReading(null)}>
          <p className="text-sm text-muted">From <b className="text-ink">{reading.fromName}</b>{reading.toName ? ` to ${reading.toName}` : ""} · {pretty(String(reading.createdAt).slice(0, 10))}</p>
          <p className="mt-4 whitespace-pre-wrap leading-relaxed text-ink">{reading.body}</p>
          <button onClick={() => api.del(`/api/letters/${reading.id}`).then(() => { setReading(null); load(); })} className="mt-6 text-sm text-muted transition hover:text-rose">Delete letter</button>
        </Modal>
      )}
    </div>
  );
}

function WriteLetter({ defaultFrom, onClose, onSaved }: { defaultFrom: string; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({ fromName: defaultFrom, toName: "", title: "", body: "", unlockAt: "" });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!f.body.trim()) return;
    setBusy(true);
    try { await api.post("/api/letters", f); onSaved(); } finally { setBusy(false); }
  }
  return (
    <Modal title="Write a letter" onClose={onClose}>
      <form onSubmit={save} className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <input value={f.fromName} onChange={(e) => set("fromName", e.target.value)} placeholder="From" className="input" />
          <input value={f.toName} onChange={(e) => set("toName", e.target.value)} placeholder="To (optional)" className="input" />
        </div>
        <input value={f.title} onChange={(e) => set("title", e.target.value)} placeholder="Title (optional)" className="input" />
        <textarea value={f.body} onChange={(e) => set("body", e.target.value)} rows={8} placeholder="My love…" className="input" autoFocus />
        <label className="block text-sm text-muted">Seal until (optional) — hides it until this date
          <input type="date" value={f.unlockAt} onChange={(e) => set("unlockAt", e.target.value)} className="input mt-1" />
        </label>
        <button disabled={busy} className="btn btn-primary w-full py-2.5 disabled:opacity-60">{busy ? "Sending…" : "Send letter 💌"}</button>
      </form>
    </Modal>
  );
}
