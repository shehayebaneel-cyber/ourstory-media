import { Link } from "react-router-dom";

const LINKS = [
  { to: "/gallery", label: "Gallery", icon: "🖼️", desc: "All our photos & videos" },
  { to: "/map", label: "Map", icon: "🗺️", desc: "Places we've been together" },
  { to: "/bucket", label: "Bucket list", icon: "✨", desc: "Dreams to do together" },
  { to: "/letters", label: "Love letters", icon: "💌", desc: "Words for each other" },
  { to: "/countdowns", label: "Countdowns", icon: "⏳", desc: "Moments we're waiting for" },
  { to: "/favorites", label: "Favorites", icon: "⭐", desc: "Our starred memories" },
];

export function More() {
  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Explore</h1>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {LINKS.map((l) => (
          <Link key={l.to} to={l.to} className="card flex items-center gap-3 p-4 transition hover:border-rose active:scale-[0.99]">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-soft text-2xl">{l.icon}</span>
            <div><p className="font-display font-bold text-ink">{l.label}</p><p className="text-xs text-muted">{l.desc}</p></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
