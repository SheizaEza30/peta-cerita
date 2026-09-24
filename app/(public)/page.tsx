"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { useMapStories } from "@/hooks/useMapStories";
import { DEFAULT_MARKER_COLOR } from "@/lib/maps/categories";
import type { MapStory } from "@/components/map/MapView";
import {
  StorySlideUp,
  type SlideUpStory,
} from "@/components/story/StorySlideUp";

export default function HomePage() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const storiesRef = useRef<MapStory[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [selectedStory, setSelectedStory] = useState<SlideUpStory | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: stories = [], isLoading, isError } = useMapStories();

  // Simpan stories ke ref supaya tidak trigger re-render
  useEffect(() => {
    storiesRef.current = stories;
  }, [stories]);

  const handleMarkerClick = useCallback((story: MapStory) => {
    setSelectedStory({
      id: story.id,
      title: story.title,
      slug: story.slug,
      synopsis: story.synopsis ?? "",
      heroImage: story.heroImage ?? null,
      city: story.city ?? null,
      province: story.province ?? null,
      period: story.period ?? null,
      content: null,
      category: story.category ?? null,
    });
    setSheetOpen(true);
  }, []);

  // === INIT MAP (sekali saja, tidak akan re-run) ===
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainer.current,
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
            attribution:
              '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
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
      center: [118, -2.5],
      zoom: 4.5,
      minZoom: 3,
      maxZoom: 18,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "bottom-right"
    );
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: false,
      }),
      "bottom-right"
    );
    map.addControl(
      new maplibregl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.on("load", () => {
      setIsLoaded(true);
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // === RENDER MARKERS (hanya saat stories/isLoaded berubah) ===
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const map = mapRef.current;

    // Bersihkan marker lama
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Buat marker baru
stories.forEach((story: MapStory) => {
  const color = story.category?.color ?? DEFAULT_MARKER_COLOR;
  const initial = story.category?.name?.charAt(0) ?? "•";

  // Buat elemen marker dengan SVG pin
  const el = document.createElement("div");
  el.setAttribute("aria-label", story.title);
  el.setAttribute("role", "button");
  el.setAttribute("tabindex", "0");
  el.className = "peta-marker";
  el.style.setProperty("--marker-color", color);

  el.innerHTML = `
    <svg width="36" height="44" viewBox="0 0 36 44" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26s18-12.5 18-26c0-9.94-8.06-18-18-18z" 
            fill="${color}" 
            stroke="white" 
            stroke-width="2"/>
      <text x="18" y="24" 
            text-anchor="middle" 
            fill="white" 
            font-size="14" 
            font-weight="700" 
            font-family="system-ui, sans-serif">${initial}</text>
    </svg>
  `;

  el.addEventListener("click", (e) => {
    e.stopPropagation();
    handleMarkerClick(story);
    map.flyTo({
      center: [story.longitude, story.latitude],
      zoom: Math.max(map.getZoom(), 12),
      duration: 800,
    });
  });

  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleMarkerClick(story);
    }
  });

  const marker = new maplibregl.Marker({
    element: el,
    anchor: "bottom",
  })
    .setLngLat([story.longitude, story.latitude])
    .addTo(map);

  markersRef.current.push(marker);
});
  }, [stories, isLoaded, handleMarkerClick]);

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ height: "calc(100vh - 3.5rem)" }}
    >
      <div
        ref={mapContainer}
        className="absolute inset-0"
        style={{ width: "100%", height: "100%" }}
      />

      <div className="pointer-events-none absolute left-1/2 top-4 z-20 -translate-x-1/2">
        <div className="pointer-events-auto rounded-full border border-border bg-background/95 px-4 py-2 text-xs font-medium shadow-card backdrop-blur">
          {isLoading && "⏳ Memuat cerita..."}
          {isError && "⚠️ Gagal memuat cerita"}
          {!isLoading && !isError && stories.length === 0 && "📍 Belum ada cerita"}
          {!isLoading && !isError && stories.length > 0 && (
            <>📍 {stories.length} cerita tersedia — klik marker</>
          )}
        </div>
      </div>

      <StorySlideUp
        story={selectedStory}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
      />
    </div>
  );
}