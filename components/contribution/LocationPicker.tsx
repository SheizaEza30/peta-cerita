"use client";

import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

type LocationPickerProps = {
  latitude: number;
  longitude: number;
  onChange: (lat: number, lng: number) => void;
};

export function LocationPicker({
  latitude,
  longitude,
  onChange,
}: LocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  // Update onChange ref tanpa re-init map
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Init map sekali
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: [
              "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
              "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
            ],
            tileSize: 256,
            attribution: "© OpenStreetMap",
          },
        },
        layers: [
          {
            id: "osm-tiles",
            type: "raster",
            source: "osm",
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [longitude, latitude],
      zoom: 5,
      minZoom: 3,
      maxZoom: 18,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    // Buat marker awal
    const el = document.createElement("div");
    el.innerHTML = `
      <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26c0-9.94-8.06-18-18-18z" 
              fill="#1f9d69" 
              stroke="white" 
              stroke-width="2"/>
        <circle cx="18" cy="18" r="6" fill="white"/>
      </svg>
    `;
    el.style.cursor = "grab";

    const marker = new maplibregl.Marker({
      element: el,
      anchor: "bottom",
      draggable: true,
    })
      .setLngLat([longitude, latitude])
      .addTo(map);

    // Update koordinat saat marker digeser
    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      onChangeRef.current(lngLat.lat, lngLat.lng);
    });

    // Update koordinat saat peta diklik
    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      marker.setLngLat([lng, lat]);
      onChangeRef.current(lat, lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker saat lat/lng berubah dari luar
  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;

    const currentPos = markerRef.current.getLngLat();
    const diff =
      Math.abs(currentPos.lat - latitude) > 0.0001 ||
      Math.abs(currentPos.lng - longitude) > 0.0001;

    if (diff) {
      markerRef.current.setLngLat([longitude, latitude]);
      mapRef.current.flyTo({
        center: [longitude, latitude],
        duration: 500,
      });
    }
  }, [latitude, longitude]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="h-64 w-full overflow-hidden rounded-lg border border-border md:h-80"
        aria-label="Peta pemilih lokasi"
      />
      <p className="text-xs text-muted-foreground">
        💡 Klik di peta atau geser pin untuk menentukan lokasi cerita.
      </p>
    </div>
  );
}