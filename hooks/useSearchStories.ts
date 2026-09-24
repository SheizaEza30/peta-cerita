"use client";

import { useQuery } from "@tanstack/react-query";

import { useDebounce } from "./useDebounce";

export type SearchResult = {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  heroImage: string | null;
  location: string | null;
  latitude: number;
  longitude: number;
  category: {
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  } | null;
};

type SearchResponse = {
  success: boolean;
  data: {
    query: string;
    count: number;
    results: SearchResult[];
  };
};

async function fetchSearch(query: string): Promise<SearchResult[]> {
  if (!query || query.length < 2) return [];

  const res = await fetch(
    `/api/stories/search?q=${encodeURIComponent(query)}&limit=8`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Gagal mencari cerita");
  }

  const json = (await res.json()) as SearchResponse;
  return json.data?.results ?? [];
}

export function useSearchStories(query: string) {
  const debouncedQuery = useDebounce(query, 300);

  return useQuery({
    queryKey: ["search-stories", debouncedQuery],
    queryFn: () => fetchSearch(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 30 * 1000, // 30 detik
    refetchOnWindowFocus: false,
  });
}