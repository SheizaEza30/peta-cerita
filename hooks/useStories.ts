"use client";

import { useQuery } from "@tanstack/react-query";

export type StoryListItem = {
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
  status: string;
  viewCount: number;
  createdAt: string;
  category: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    color: string | null;
  } | null;
  author: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
  _count: {
    images: number;
    savedBy: number;
    reports: number;
  };
};

export type StoriesQuery = {
  page?: number;
  limit?: number;
  categorySlug?: string;
  search?: string;
  sortBy?: "recent" | "popular";
  city?: string;
  province?: string;
};

type ApiResponse = {
  success: boolean;
  data: StoryListItem[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

async function fetchStories(query: StoriesQuery): Promise<{
  stories: StoryListItem[];
  meta: ApiResponse["meta"];
}> {
  const params = new URLSearchParams();

  if (query.page) params.set("page", String(query.page));
  if (query.limit) params.set("limit", String(query.limit));
  if (query.categorySlug) params.set("categorySlug", query.categorySlug);
  if (query.search) params.set("search", query.search);
  if (query.sortBy) params.set("sortBy", query.sortBy);
  if (query.city) params.set("city", query.city);
  if (query.province) params.set("province", query.province);

  const res = await fetch(`/api/stories?${params.toString()}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Gagal memuat cerita");
  }

  const json = (await res.json()) as ApiResponse;
  return {
    stories: json.data ?? [],
    meta: json.meta,
  };
}

export function useStories(query: StoriesQuery = {}) {
  return useQuery({
    queryKey: ["stories", query],
    queryFn: () => fetchStories(query),
    staleTime: 60 * 1000,
    refetchOnWindowFocus: false,
  });
}