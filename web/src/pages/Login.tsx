import { useState, type FormEvent } from "react";
import { useAuth } from "../context/Auth.tsx";
import { useTheme } from "../context/Theme.tsx";

export function Login() {
  const { login } = useAuth();
  const { dark, toggle } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try { await login(email.trim().toLowerCase(), password); }
    catch (e2) { setErr(e2 instanceof Error ? e2.message : "Couldn't sign in."); setBusy(false); }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-5">
      <div className="pointer-events-none absolute -right-20 -top-24 h-80 w-80 rounded-full bg-rose-soft blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-gold/20 blur-3xl" />
      <button onClick={toggle} aria-label="Toggle theme" className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-ink">{dark ? "☀️" : "🌙"}</button>
      <div className="reveal w-full max-w-sm">
        <div className="text-center">
          <p className="float-slow text-5xl">🤍</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-ink">Our <span className="italic text-rose">Story</span></h1>
          <p className="mt-2 text-muted">Our private little corner of the world.</p>
        </div>
        <form onSubmit={submit} className="card mt-8 space-y-3 p-6">
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" autoFocus className="input" />
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="input" />
          {err && <p className="text-sm font-medium text-red-500">{err}</p>}
          <button disabled={busy} className="btn btn-primary w-full py-3 text-base disabled:opacity-60">{busy ? "…" : "Enter"}</button>
        </form>
      </div>
    </div>
  );
}
