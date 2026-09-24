"use client";

import { useQuery } from "@tanstack/react-query";
import type { MapStory } from "@/components/map/MapView";

type StoriesResponse = {
  success: boolean;
  data: MapStory[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

async function fetchStories(): Promise<MapStory[]> {
  const res = await fetch("/api/stories?limit=100", {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal memuat cerita");
  }

  const json = (await res.json()) as StoriesResponse;
  return json.data ?? [];
}

export function useMapStories() {
  return useQuery({
    queryKey: ["map-stories"],
    queryFn: fetchStories,
    staleTime: 60 * 1000, // 1 menit
    refetchOnWindowFocus: false,
  });
}