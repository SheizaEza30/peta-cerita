import { Suspense } from "react";

import { ExploreClient } from "./ExploreClient";

export const metadata = {
  title: "Jelajah Cerita",
  description:
    "Jelajahi semua cerita sejarah, budaya, dan legenda Indonesia.",
};

type PageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    sort?: string;
    page?: string;
  }>;
};

export default async function ExplorePage({ searchParams }: PageProps) {
  const params = await searchParams;

  return (
    <Suspense fallback={null}>
      <ExploreClient
        initialSearch={params.q ?? ""}
        initialCategory={params.category ?? ""}
        initialSort={(params.sort as "recent" | "popular") ?? "recent"}
        initialPage={Number(params.page) || 1}
      />
    </Suspense>
  );
}