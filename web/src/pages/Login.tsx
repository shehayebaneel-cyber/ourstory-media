import { useState, type FormEvent } from "react";
import { Sun, Moon } from "lucide-react";
import { useAuth } from "../context/Auth.tsx";
import { useTheme } from "../context/Theme.tsx";

export function Login() {
  const { loginPasscode } = useAuth();
  const { dark, toggle } = useTheme();
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true); setErr("");
    try { await loginPasscode(code.trim()); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message : "Wrong passcode."); setBusy(false); setCode(""); }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-rose-soft blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <button onClick={toggle} aria-label="Toggle theme" className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-ink">{dark ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}</button>
      <div className="reveal w-full max-w-sm">
        <div className="text-center">
          <p className="float-slow text-5xl">🤍</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-ink">Our <span className="italic text-rose">Story</span></h1>
          <p className="mt-2 text-muted">Enter your passcode to come in.</p>
        </div>
        <form onSubmit={submit} className="card mt-8 space-y-3 p-6">
          <input type="password" inputMode="numeric" autoComplete="off" value={code} onChange={(e) => setCode(e.target.value)} placeholder="• • • •" autoFocus className="input text-center text-2xl tracking-[0.4em]" />
          {err && <p className="text-center text-sm font-medium text-red-500">{err}</p>}
          <button disabled={busy} className="btn btn-primary w-full py-3 text-base disabled:opacity-60">{busy ? "…" : "Enter 💗"}</button>
        </form>
      </div>
    </div>
  );
}
