import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { api } from "../lib/api.ts";
import { pretty, todayStr } from "../lib/util.ts";
import { uploadFile } from "../lib/upload.ts";
import { MemoryCard } from "../components/MemoryCard.tsx";
import { EmptyState } from "../components/EmptyState.tsx";
import { BookOpen, X, MapPin } from "lucide-react";
import type { Media, Memory } from "../types.ts";

const REACTIONS = ["❤️", "😂", "🥹", "😍", "😭", "⭐"];
const MOODS = ["😍 in love", "😊 happy", "😌 calm", "🥰 grateful", "😂 silly", "🥹 emotional", "😴 cozy", "🔥 excited"];

export function Journal() {
  const [items, setItems] = useState<Memory[]>([]);
  const [editing, setEditing] = useState<Memory | "new" | null>(null);
  const [viewing, setViewing] = useState<Memory | null>(null);
  const load = () => api.get<Memory[]>("/api/memories").then(setItems).catch(() => {});
  useEffect(() => { load(); }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink"><BookOpen className="h-6 w-6 text-rose" /> Our journal</h1>
        <button onClick={() => setEditing("new")} className="btn btn-primary px-4 py-2 text-sm">+ New memory</button>
      </div>
      {items.length === 0 ? <EmptyState Icon={BookOpen} title="Your story is just beginning" subtitle="Write your first memory — a moment, a photo, how the day felt." /> : (
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {items.map((m) => <MemoryCard key={m.id} m={m} onClick={() => setViewing(m)} />)}
        </div>
      )}
      {editing && <MemoryForm memory={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
      {viewing && <MemoryDetail m={viewing} onClose={() => setViewing(null)} onChanged={(m) => { setViewing(m); load(); }} onEdit={() => { setEditing(viewing); setViewing(null); }} onDeleted={() => { setViewing(null); load(); }} />}
    </div>
  );
}

function MemoryForm({ memory, onClose, onSaved }: { memory: Memory | null; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState({
    title: memory?.title ?? "", date: memory?.date ?? todayStr(), time: memory?.time ?? "", location: memory?.location ?? "",
    mood: memory?.mood ?? "", rating: memory?.rating ?? 0, story: memory?.story ?? "", favoriteMoment: memory?.favoriteMoment ?? "",
    funnyMoment: memory?.funnyMoment ?? "", food: memory?.food ?? "", songs: memory?.songs ?? "", insideJokes: memory?.insideJokes ?? "",
    notesA: memory?.notesA ?? "", notesB: memory?.notesB ?? "",
  });
  const [media, setMedia] = useState<Media[]>(memory?.media ?? []);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [err, setErr] = useState("");

  function pinCurrentLocation() {
    if (!navigator.geolocation) { setErr("Location isn't available on this device — you can type it instead."); return; }
    setLocating(true); setErr("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude, lng = pos.coords.longitude;
        setCoords({ lat, lng });
        try {
          const r = await api.get<{ name: string }>(`/api/geocode/reverse?lat=${lat}&lng=${lng}`);
          setF((prev) => ({ ...prev, location: r.name || "My current location" }));
        } catch { setF((prev) => ({ ...prev, location: "My current location" })); }
        finally { setLocating(false); }
      },
      () => { setErr("Couldn't get your location — please type it instead."); setLocating(false); },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true); setErr("");
    try { const added: Media[] = []; for (const file of files) added.push(await uploadFile(file)); setMedia((m) => [...m, ...added]); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message : "Photo uploads turn on once storage is connected."); }
    finally { setUploading(false); }
  }
  async function save(e: FormEvent) {
    e.preventDefault();
    if (!f.title.trim()) { setErr("Give it a title 🤍"); return; }
    setBusy(true); setErr("");
    const payload = { ...f, media, ...(coords ? coords : {}) };
    try { if (memory) await api.patch(`/api/memories/${memory.id}`, payload); else await api.post("/api/memories", payload); onSaved(); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message : "Couldn't save."); setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/40 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <form onSubmit={save} className="w-full max-w-lg rounded-t-3xl bg-surface p-5 shadow-2xl sm:my-4 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between"><p className="font-display text-lg font-bold text-ink">{memory ? "Edit memory" : "New memory"}</p><button type="button" onClick={onClose} className="text-xl text-muted"><X className="h-4 w-4" /></button></div>
        <div className="mt-3 space-y-2">
          <input value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Title *" className="input" autoFocus />
          <div className="grid grid-cols-2 gap-2">
            <input type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} className="input" />
            <input type="time" value={f.time} onChange={(e) => setF({ ...f, time: e.target.value })} className="input" />
          </div>
          <div>
            <div className="flex gap-2">
              <input value={f.location} onChange={(e) => { setF({ ...f, location: e.target.value }); setCoords(null); }} placeholder="Location — type it, or tap 📍" className="input flex-1" />
              <button type="button" onClick={pinCurrentLocation} disabled={locating} className="btn btn-ghost flex shrink-0 items-center gap-1 px-3 disabled:opacity-60" title="Use my current location"><MapPin className="h-4 w-4" />{locating ? "…" : "Current"}</button>
            </div>
            {coords && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-rose"><MapPin className="h-3 w-3" /> Pinned to your current location</p>}
          </div>
          <select value={f.mood} onChange={(e) => setF({ ...f, mood: e.target.value })} className="input"><option value="">Mood…</option>{MOODS.map((m) => <option key={m} value={m}>{m}</option>)}</select>
          <label className="block text-sm text-muted">Rating: <b className="text-ink">{f.rating}/10</b><input type="range" min={0} max={10} value={f.rating} onChange={(e) => setF({ ...f, rating: Number(e.target.value) })} className="w-full accent-rose" /></label>
          <textarea rows={3} value={f.story} onChange={(e) => setF({ ...f, story: e.target.value })} placeholder="The story of the day…" className="input" />
          <input value={f.favoriteMoment} onChange={(e) => setF({ ...f, favoriteMoment: e.target.value })} placeholder="Favorite moment" className="input" />
          <input value={f.funnyMoment} onChange={(e) => setF({ ...f, funnyMoment: e.target.value })} placeholder="Funniest moment" className="input" />
          <div className="grid grid-cols-2 gap-2">
            <input value={f.food} onChange={(e) => setF({ ...f, food: e.target.value })} placeholder="What we ate" className="input" />
            <input value={f.songs} onChange={(e) => setF({ ...f, songs: e.target.value })} placeholder="Songs" className="input" />
          </div>
          <input value={f.insideJokes} onChange={(e) => setF({ ...f, insideJokes: e.target.value })} placeholder="Inside jokes" className="input" />
          <div className="grid grid-cols-2 gap-2">
            <textarea rows={2} value={f.notesA} onChange={(e) => setF({ ...f, notesA: e.target.value })} placeholder="Note from you" className="input" />
            <textarea rows={2} value={f.notesB} onChange={(e) => setF({ ...f, notesB: e.target.value })} placeholder="Note from them" className="input" />
          </div>
          <div>
            <label className="btn btn-ghost w-full cursor-pointer py-2.5 text-sm">{uploading ? "Uploading…" : "📷 Add photos / videos"}<input type="file" accept="image/*,video/*" multiple hidden onChange={pick} /></label>
            {media.length > 0 && <div className="mt-2 flex gap-2 overflow-x-auto">{media.map((x, i) => <div key={i} className="relative shrink-0"><img src={x.url} alt="" className="h-20 w-20 rounded-xl object-cover" /><button type="button" onClick={() => setMedia(media.filter((_, j) => j !== i))} className="absolute right-0.5 top-0.5 rounded-full bg-black/60 px-1.5 text-xs text-white"><X className="h-4 w-4" /></button></div>)}</div>}
          </div>
        </div>
        {err && <p className="mt-2 text-sm font-medium text-red-500">{err}</p>}
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={onClose} className="btn btn-ghost flex-1 py-2.5">Cancel</button>
          <button type="submit" disabled={busy} className="btn btn-primary flex-1 py-2.5 disabled:opacity-60">{busy ? "Saving…" : "Save memory"}</button>
        </div>
      </form>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return <div className="mt-2"><p className="text-xs font-semibold uppercase tracking-wide text-rose">{label}</p><p className="whitespace-pre-line text-ink">{value}</p></div>;
}

function MemoryDetail({ m, onClose, onChanged, onEdit, onDeleted }: { m: Memory; onClose: () => void; onChanged: (m: Memory) => void; onEdit: () => void; onDeleted: () => void }) {
  async function react(emoji: string) { onChanged(await api.post<Memory>(`/api/memories/${m.id}/react`, { emoji })); }
  async function del() { if (confirm("Delete this memory?")) { await api.del(`/api/memories/${m.id}`); onDeleted(); } }
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 backdrop-blur-sm sm:p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-t-3xl bg-surface shadow-2xl sm:my-4 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        {m.media[0]?.url && <img src={m.media[0].url} alt="" className="max-h-80 w-full rounded-t-3xl object-cover" />}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2">
            <div><p className="font-display text-2xl font-bold text-ink">{m.title}</p><p className="text-xs text-muted">{pretty(m.date)}{m.time ? ` · ${m.time}` : ""}{m.location ? ` · ${m.location}` : ""}{m.mood ? ` · ${m.mood}` : ""}</p></div>
            <button onClick={onClose} className="text-xl text-muted"><X className="h-4 w-4" /></button>
          </div>
          {m.rating > 0 && <p className="mt-1 text-sm font-semibold text-gold">Rating {m.rating}/10</p>}
          {m.media.length > 1 && <div className="mt-3 grid grid-cols-3 gap-2">{m.media.slice(1).map((x, i) => <img key={i} src={x.url} alt="" className="aspect-square w-full rounded-xl object-cover" />)}</div>}
          <DetailField label="Story" value={m.story} />
          <DetailField label="Favorite moment" value={m.favoriteMoment} />
          <DetailField label="Funniest moment" value={m.funnyMoment} />
          <DetailField label="What we ate" value={m.food} />
          <DetailField label="Songs" value={m.songs} />
          <DetailField label="Inside jokes" value={m.insideJokes} />
          {(m.notesA || m.notesB) && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {m.notesA && <div className="rounded-2xl bg-rose-soft/60 p-3"><p className="text-xs text-rose">Note</p><p className="text-sm text-ink">{m.notesA}</p></div>}
              {m.notesB && <div className="rounded-2xl bg-surface-2 p-3"><p className="text-xs text-muted">Note</p><p className="text-sm text-ink">{m.notesB}</p></div>}
            </div>
          )}
          <div className="mt-4 flex items-center gap-1">
            {REACTIONS.map((e) => <button key={e} onClick={() => react(e)} className={`rounded-full px-2 py-1 text-lg transition hover:scale-110 ${m.reactions.some((r) => r.emoji === e) ? "bg-rose-soft" : ""}`}>{e}</button>)}
          </div>
          <div className="mt-4 flex gap-2">
            <button onClick={onEdit} className="btn btn-ghost flex-1 py-2.5 text-sm">Edit</button>
            <button onClick={del} className="btn btn-ghost flex-1 py-2.5 text-sm text-red-500">Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}
