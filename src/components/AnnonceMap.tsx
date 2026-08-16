"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

const pinIcon = (color: string) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="42" viewBox="0 0 30 42"><path d="M15 0C6.7 0 0 6.7 0 15c0 10.5 15 27 15 27s15-16.5 15-27C30 6.7 23.3 0 15 0z" fill="${color}"/><circle cx="15" cy="15" r="6" fill="white"/></svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

export default function AnnonceMap({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    let map: import("leaflet").Map | undefined;
    let cancelled = false;

    import("leaflet").then((L) => {
      if (cancelled || !containerRef.current) return;

      map = L.map(containerRef.current, {
        zoomControl: true,
        dragging: true,
        scrollWheelZoom: false,
      }).setView([latitude, longitude], 13);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
        maxZoom: 19,
      }).addTo(map);

      const icon = L.icon({
        iconUrl: pinIcon("#0f5238"),
        iconSize: [30, 42],
        iconAnchor: [15, 42],
      });

      L.marker([latitude, longitude], { icon }).addTo(map).bindPopup(label);
    });

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [latitude, longitude, label]);

  return (
    <div
      ref={containerRef}
      className="h-56 w-full overflow-hidden rounded-lg border border-[#dfe3e0]"
    />
  );
}
