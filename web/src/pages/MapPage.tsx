import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { MapPin } from "lucide-react";
import { api } from "../lib/api.ts";
import { pretty } from "../lib/util.ts";

// Fix Leaflet's default marker icon paths (broken under bundlers).
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

type Place = { id: string; title: string; date: string; location: string; lat: number; lng: number; photo: string };

// Lock the map to Lebanon — can't pan or zoom out of the country.
const LEBANON_BOUNDS: [[number, number], [number, number]] = [[33.02, 35.08], [34.70, 36.65]];

export function MapPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  useEffect(() => { api.get<Place[]>("/api/places").then(setPlaces).catch(() => {}); }, []);

  return (
    <div>
      <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-ink"><MapPin className="h-6 w-6 text-rose" /> Our map</h1>
      <p className="mt-1 text-sm text-muted">{places.length} place{places.length === 1 ? "" : "s"} we've been together 📍</p>

      <div className="mt-4 overflow-hidden rounded-3xl border border-border" style={{ height: "68vh" }}>
        <MapContainer center={[33.86, 35.88]} zoom={8} minZoom={8} maxBounds={LEBANON_BOUNDS} maxBoundsViscosity={1} scrollWheelZoom className="h-full w-full">
          <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {places.map((p) => (
            <Marker key={p.id} position={[p.lat, p.lng]}>
              <Popup>
                <div className="text-center">
                  {p.photo && <img src={p.photo} alt="" className="mb-1.5 h-24 w-40 rounded-lg object-cover" />}
                  <p className="font-bold">{p.title}</p>
                  <p className="text-xs opacity-70">{p.location}{p.location ? " · " : ""}{pretty(p.date)}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {places.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">No places pinned yet — add a <b className="text-ink">location</b> to a memory (e.g. “Aley” or “Beirut”) and it'll appear here automatically. 🗺️</p>
      )}
    </div>
  );
}
