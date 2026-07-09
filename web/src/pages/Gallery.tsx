import { useEffect, useState } from "react";
import { api } from "../lib/api.ts";
import { EmptyState } from "../components/EmptyState.tsx";
import type { GalleryItem } from "../types.ts";

const isVideo = (t?: string) => t === "VIDEO" || t === "video";

export function Gallery() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [lightbox, setLightbox] = useState<GalleryItem | null>(null);
  useEffect(() => { api.get<GalleryItem[]>("/api/gallery").then(setItems).catch(() => {}); }, []);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Gallery</h1>
      {items.length === 0 ? <EmptyState icon="📸" title="No photos yet" subtitle="Add photos to your memories and they'll all gather here." /> : (
        <div className="mt-5 grid grid-cols-3 gap-1.5 sm:grid-cols-4">
          {items.map((m, i) => (
            <button key={i} onClick={() => setLightbox(m)} className="relative aspect-square overflow-hidden rounded-xl bg-surface-2">
              {isVideo(m.type)
                ? <video src={m.url} className="h-full w-full object-cover" muted />
                : <img src={m.thumbUrl || m.url} alt={m.title} loading="lazy" className="h-full w-full object-cover transition hover:scale-105" />}
              {isVideo(m.type) && <span className="absolute bottom-1 right-1 text-sm text-white drop-shadow">▶</span>}
            </button>
          ))}
        </div>
      )}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/85 p-4" onClick={() => setLightbox(null)}>
          {isVideo(lightbox.type)
            ? <video src={lightbox.url} controls autoPlay className="max-h-[82vh] max-w-full rounded-2xl" />
            : <img src={lightbox.url} alt={lightbox.title} className="max-h-[82vh] max-w-full rounded-2xl" />}
          <p className="mt-3 text-center text-sm text-white/80">{lightbox.title}</p>
        </div>
      )}
    </div>
  );
}
