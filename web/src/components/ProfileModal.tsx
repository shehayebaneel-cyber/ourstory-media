import { useState, type ChangeEvent } from "react";
import { Camera, LogOut } from "lucide-react";
import { api } from "../lib/api.ts";
import { uploadFile } from "../lib/upload.ts";
import { useAuth } from "../context/Auth.tsx";
import { Modal } from "./Modal.tsx";

export function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, refresh, logout } = useAuth();
  const [name, setName] = useState(user?.name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setErr("");
    try { const m = await uploadFile(file); setAvatarUrl(m.url); }
    catch { setErr("Couldn't upload — is storage connected?"); }
    finally { setUploading(false); }
  }
  async function save() {
    setBusy(true); setErr("");
    try { await api.patch("/api/me", { name: name.trim(), avatarUrl }); refresh(); onClose(); }
    catch { setErr("Couldn't save."); }
    finally { setBusy(false); }
  }

  return (
    <Modal title="Your profile" onClose={onClose}>
      <div className="flex flex-col items-center">
        <label className="relative cursor-pointer active:scale-95">
          {avatarUrl
            ? <img src={avatarUrl} alt="" className="h-24 w-24 rounded-full object-cover ring-4 ring-rose-soft" />
            : <span className="flex h-24 w-24 items-center justify-center rounded-full bg-rose-soft font-display text-3xl font-bold text-rose ring-4 ring-rose-soft">{(name || "?").slice(0, 1).toUpperCase()}</span>}
          <span className="absolute -bottom-0.5 -right-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-rose text-white shadow-lg"><Camera className="h-4 w-4" /></span>
          <input type="file" accept="image/*" onChange={pick} className="hidden" />
        </label>
        <p className="mt-2 text-xs text-muted">{uploading ? "Uploading…" : "Tap the photo to change it"}</p>
      </div>

      <label className="mt-5 block text-sm font-semibold text-muted">Your name
        <input value={name} onChange={(e) => setName(e.target.value)} className="input mt-1" />
      </label>

      {err && <p className="mt-3 text-sm font-medium text-red-600">{err}</p>}

      <div className="mt-5 flex gap-2">
        <button onClick={save} disabled={busy || uploading} className="btn btn-primary flex-1 py-2.5 disabled:opacity-60">{busy ? "Saving…" : "Save"}</button>
        <button onClick={onClose} className="btn btn-ghost px-5 py-2.5">Cancel</button>
      </div>
      <button onClick={logout} className="mt-4 flex w-full items-center justify-center gap-1.5 text-sm text-muted transition hover:text-rose"><LogOut className="h-4 w-4" /> Log out</button>
    </Modal>
  );
}
