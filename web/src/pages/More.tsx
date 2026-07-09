import { Link } from "react-router-dom";
import { Images, Map, Star, Shuffle, Search, Mail, Hourglass, TrendingUp, ListChecks, Plane, Timer, Gift, Music, StickyNote, type LucideIcon } from "lucide-react";

const COLOR: Record<string, string> = {
  rose: "bg-rose-400/15 text-rose-500",
  sky: "bg-sky-400/15 text-sky-500",
  teal: "bg-teal-400/15 text-teal-600",
  purple: "bg-purple-400/15 text-purple-500",
  amber: "bg-amber-400/15 text-amber-600",
  emerald: "bg-emerald-400/15 text-emerald-600",
  gold: "bg-yellow-400/15 text-yellow-600",
  indigo: "bg-indigo-400/15 text-indigo-500",
  slate: "bg-slate-400/15 text-slate-500",
};

type Item = { to: string; label: string; Icon: LucideIcon; color: string; desc: string };
const SECTIONS: { title: string; items: Item[] }[] = [
  { title: "Memories", items: [
    { to: "/gallery", label: "Gallery", Icon: Images, color: "sky", desc: "All our photos & videos" },
    { to: "/map", label: "Map", Icon: Map, color: "teal", desc: "Places we've been" },
    { to: "/favorites", label: "Favorites", Icon: Star, color: "gold", desc: "Starred memories" },
    { to: "/random", label: "Random", Icon: Shuffle, color: "purple", desc: "Surprise me with a moment" },
    { to: "/search", label: "Search", Icon: Search, color: "slate", desc: "Find any memory" },
  ] },
  { title: "Relationship", items: [
    { to: "/letters", label: "Love letters", Icon: Mail, color: "rose", desc: "Words for each other" },
    { to: "/capsules", label: "Time capsules", Icon: Hourglass, color: "amber", desc: "Sealed for the future" },
    { to: "/stats", label: "Our stats", Icon: TrendingUp, color: "indigo", desc: "Us by the numbers" },
  ] },
  { title: "Planning", items: [
    { to: "/bucket", label: "Bucket list", Icon: ListChecks, color: "emerald", desc: "Dreams to do together" },
    { to: "/trips", label: "Trips", Icon: Plane, color: "teal", desc: "Plan & pack adventures" },
    { to: "/countdowns", label: "Countdowns", Icon: Timer, color: "gold", desc: "Moments we await" },
    { to: "/gifts", label: "Gift ideas", Icon: Gift, color: "rose", desc: "Ideas for each other" },
  ] },
  { title: "Fun", items: [
    { to: "/playlist", label: "Playlist", Icon: Music, color: "purple", desc: "Songs that are ours" },
    { to: "/notes", label: "Notes & jokes", Icon: StickyNote, color: "amber", desc: "Little notes & inside jokes" },
  ] },
];

export function More() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-2xl font-bold text-ink">Explore</h1>
      {SECTIONS.map((sec) => (
        <div key={sec.title} className="space-y-2.5">
          <p className="px-1 text-[11px] font-bold uppercase tracking-[0.15em] text-muted">{sec.title}</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {sec.items.map((l) => (
              <Link key={l.to} to={l.to} className="card card-lift flex items-center gap-3 p-3.5">
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${COLOR[l.color]}`}><l.Icon className="h-5 w-5" strokeWidth={2.1} /></span>
                <div className="min-w-0"><p className="font-semibold text-ink">{l.label}</p><p className="truncate text-xs text-muted">{l.desc}</p></div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
