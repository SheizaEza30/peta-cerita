"use client";

import { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { MAP_CONFIG } from "@/lib/maps/config";
import { DEFAULT_MARKER_COLOR } from "@/lib/maps/categories";

export type MapStory = {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  heroImage: string | null;
  latitude: number;
  longitude: number;
  city: string | null;
  province: string | null;
  period: string | null;
  category?: {
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  } | null;
};

type MapViewProps = {
  stories?: MapStory[];
  onMarkerClick?: (story: MapStory) => void;
  className?: string;
};

export function MapView({
  stories = [],
  onMarkerClick,
  className,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_CONFIG.styleUrl,
      center: MAP_CONFIG.defaultCenter,
      zoom: MAP_CONFIG.defaultZoom,
      minZoom: MAP_CONFIG.minZoom,
      maxZoom: MAP_CONFIG.maxZoom,
      maxBounds: MAP_CONFIG.maxBounds,
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
        showAccuracyCircle: false,
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

  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const map = mapRef.current;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    stories.forEach((story) => {
      const color = story.category?.color ?? DEFAULT_MARKER_COLOR;

      const el = document.createElement("button");
      el.className = "map-marker";
      el.setAttribute("aria-label", story.title);
      el.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        background: ${color};
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        transition: transform 0.15s ease;
      `;

      const inner = document.createElement("div");
      inner.style.cssText = `
        transform: rotate(45deg);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        height: 100%;
        font-size: 14px;
        font-weight: 600;
      `;
      inner.textContent = story.category?.name?.charAt(0) ?? "•";
      el.appendChild(inner);

      el.addEventListener("mouseenter", () => {
        el.style.transform = "rotate(-45deg) scale(1.15)";
      });
      el.addEventListener("mouseleave", () => {
        el.style.transform = "rotate(-45deg) scale(1)";
      });

      if (onMarkerClick) {
        el.addEventListener("click", (e) => {
          e.stopPropagation();
          onMarkerClick(story);
          map.flyTo({
            center: [story.longitude, story.latitude],
            zoom: Math.max(map.getZoom(), 14),
            duration: 800,
          });
        });
      }

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([story.longitude, story.latitude])
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [stories, isLoaded, onMarkerClick]);

  return (
    <div
      ref={containerRef}
      className={className ?? "absolute inset-0"}
      aria-label="Peta cerita interaktif"
    />
  );
}