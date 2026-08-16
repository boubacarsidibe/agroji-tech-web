"use client";

import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";

const DAKAR: [number, number] = [14.6928, -17.4467];

const pinIcon = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42"><path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0z" fill="${color}"/><circle cx="15" cy="15" r="6" fill="white"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export type LatLng = { latitude: number; longitude: number };

export default function LocationPicker({
  value,
  onChange,
}: {
  value: LatLng | null;
  onChange: (value: LatLng) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);
  const markerRef = useRef<import("leaflet").Marker | null>(null);
  const onChangeRef = useRef(onChange);
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current || mapRef.current) return;

      const start: [number, number] = value ? [value.latitude, value.longitude] : DAKAR;
      const map = L.map(containerRef.current).setView(start, value ? 13 : 7);
      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const icon = L.icon({
        iconUrl: pinIcon("#0f5238"),
        iconSize: [30, 42],
        iconAnchor: [15, 42],
      });

      if (value) {
        markerRef.current = L.marker(start, { icon, draggable: true }).addTo(map);
        markerRef.current.on("dragend", () => {
          const pos = markerRef.current!.getLatLng();
          onChangeRef.current({ latitude: pos.lat, longitude: pos.lng });
        });
      }

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon, draggable: true }).addTo(map);
          markerRef.current.on("dragend", () => {
            const pos = markerRef.current!.getLatLng();
            onChangeRef.current({ latitude: pos.lat, longitude: pos.lng });
          });
        }
        onChangeRef.current({ latitude: lat, longitude: lng });
      });
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- map initialized once; value updates handled separately
  }, []);

  function handleLocate() {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const { latitude, longitude } = pos.coords;
        onChangeRef.current({ latitude, longitude });
        const map = mapRef.current;
        if (map) {
          map.setView([latitude, longitude], 15);
          import("leaflet").then((L) => {
            const icon = L.icon({
              iconUrl: pinIcon("#0f5238"),
              iconSize: [30, 42],
              iconAnchor: [15, 42],
            });
            if (markerRef.current) {
              markerRef.current.setLatLng([latitude, longitude]);
            } else {
              markerRef.current = L.marker([latitude, longitude], {
                icon,
                draggable: true,
              }).addTo(map);
              markerRef.current.on("dragend", () => {
                const p = markerRef.current!.getLatLng();
                onChangeRef.current({ latitude: p.lat, longitude: p.lng });
              });
            }
          });
        }
      },
      () => setLocating(false),
      { timeout: 8000 }
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="font-[family-name:var(--font-work-sans)] text-sm font-medium text-[#171c19]">
          Localisation sur la carte (optionnel)
        </span>
        <button
          type="button"
          onClick={handleLocate}
          disabled={locating}
          className="font-[family-name:var(--font-work-sans)] text-xs font-medium text-[#0f5238] hover:underline disabled:opacity-60"
        >
          {locating ? "Recherche..." : "Utiliser ma position"}
        </button>
      </div>
      <div
        ref={containerRef}
        className="h-64 w-full overflow-hidden rounded-lg border border-[#bfc9c1]"
      />
      <p className="font-[family-name:var(--font-work-sans)] text-xs text-[#7c8a80]">
        {value
          ? `Position choisie: ${value.latitude.toFixed(5)}, ${value.longitude.toFixed(5)}`
          : "Cliquez sur la carte pour placer votre pepiniere."}
      </p>
    </div>
  );
}
