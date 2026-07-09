import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";
import { api } from "../lib/api.ts";
import { pretty } from "../lib/util.ts";

// Fix Leaflet's default marker icon paths (broken under bundlers).
L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });

type Place = { id: string; title: string; date: string; location: string; lat: number; lng: number; photo: string };

export function MapPage() {
  const [places, setPlaces] = useState<Place[]>([]);
  useEffect(() => { api.get<Place[]>("/api/places").then(setPlaces).catch(() => {}); }, []);
  const center: [number, number] = places.length ? [places[0].lat, places[0].lng] : [33.8, 35.5]; // default: Lebanon

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-ink">Our map</h1>
      <p className="mt-1 text-sm text-muted">{places.length} place{places.length === 1 ? "" : "s"} we've been together 📍</p>

      <div className="mt-4 overflow-hidden rounded-3xl border border-border" style={{ height: "68vh" }}>
        <MapContainer center={center} zoom={places.length ? 6 : 3} scrollWheelZoom className="h-full w-full">
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
        <p className="mt-6 text-center text-sm text-muted">No places pinned yet — add a <b className="text-ink">location</b> to a memory (e.g. “Paris” or “Aley, Lebanon”) and it'll appear here automatically. 🗺️</p>
      )}
    </div>
  );
}
