import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/Auth.tsx";
import { useTheme } from "../context/Theme.tsx";
import { LoveAmbiance } from "./LoveAmbiance.tsx";

const NAV = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/timeline", label: "Timeline", icon: "✦" },
  { to: "/journal", label: "Journal", icon: "📖" },
  { to: "/gallery", label: "Gallery", icon: "🖼️" },
  { to: "/more", label: "Explore", icon: "✨" },
];

export function Layout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen pb-24">
      <LoveAmbiance />
      <header className="sticky top-0 z-30 border-b border-border/60 bg-bg/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-2.5">
          <Link to="/" className="font-display text-2xl font-bold leading-none text-ink">Our <span className="italic text-rose">Story</span></Link>
          <div className="flex items-center gap-2">
            <button onClick={toggle} aria-label="Toggle theme" className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-ink transition active:scale-90">{dark ? "☀️" : "🌙"}</button>
            <button onClick={logout} title="Log out" className="flex items-center gap-2 rounded-full bg-surface-2 py-1 pe-3 ps-1 text-sm font-semibold text-ink transition active:scale-95">
              {user?.avatarUrl ? <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" /> : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-rose-soft text-rose">{user?.name.slice(0, 1)}</span>}
              <span className="hidden text-muted sm:inline">Log out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 py-6">{children}</main>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border/60 bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-around px-4 py-1.5">
          {NAV.map((n) => {
            const active = n.to === "/" ? pathname === "/" : pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={`flex flex-1 flex-col items-center gap-1 rounded-2xl py-1.5 text-[11px] font-semibold transition ${active ? "text-rose-deep" : "text-muted"}`}>
                <span className={`flex h-8 w-8 items-center justify-center rounded-full text-lg transition-all duration-300 ${active ? "scale-110 bg-rose-soft shadow-[0_5px_14px_-4px_rgba(224,132,154,0.65)]" : ""}`}>{n.icon}</span>
                {n.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
