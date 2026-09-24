"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, Compass } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StoryCard } from "@/components/story/StoryCard";
import { useStories } from "@/hooks/useStories";
import { CATEGORIES } from "@/lib/constants";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";

type ExploreClientProps = {
  initialSearch: string;
  initialCategory: string;
  initialSort: "recent" | "popular";
  initialPage: number;
};

export function ExploreClient({
  initialSearch,
  initialCategory,
  initialSort,
  initialPage,
}: ExploreClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [sortBy, setSortBy] = useState<"recent" | "popular">(initialSort);
  const [page, setPage] = useState(initialPage);

  const debouncedSearch = useDebounce(search, 400);

  const { data, isLoading, isError } = useStories({
    page,
    limit: 12,
    search: debouncedSearch || undefined,
    categorySlug: category || undefined,
    sortBy,
  });

  const stories = data?.stories ?? [];
  const meta = data?.meta;

  function updateURL(updates: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) params.set(key, value);
      else params.delete(key);
    });
    router.push(`/explore?${params.toString()}`, { scroll: false });
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
    updateURL({ q: value });
  }

  function handleCategoryChange(slug: string) {
    const newCat = category === slug ? "" : slug;
    setCategory(newCat);
    setPage(1);
    updateURL({ category: newCat });
  }

  function handleSortChange(value: "recent" | "popular") {
    setSortBy(value);
    setPage(1);
    updateURL({ sort: value });
  }

  function handleClearAll() {
    setSearch("");
    setCategory("");
    setPage(1);
    router.push("/explore", { scroll: false });
  }

  const hasFilters = !!(search || category);

  return (
    <div className="container max-w-6xl py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Compass className="size-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold md:text-3xl">
              Jelajah Cerita
            </h1>
            <p className="text-sm text-muted-foreground">
              Telusuri cerita sejarah, budaya, dan legenda Indonesia
            </p>
          </div>
        </div>
      </div>

      {/* Search + Sort */}
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari cerita, kota, kategori..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-10 pl-9"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Hapus pencarian"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger className="h-10 w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">Terbaru</SelectItem>
            <SelectItem value="popular">Terpopuler</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category chips */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        <Button
          variant={category === "" ? "default" : "outline"}
          size="sm"
          onClick={() => handleCategoryChange("")}
        >
          Semua
        </Button>

        {CATEGORIES.map((cat) => {
          const isActive = category === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => handleCategoryChange(cat.slug)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                isActive
                  ? "border-transparent text-white"
                  : "border-border bg-background hover:bg-muted"
              )}
              style={
                isActive
                  ? { backgroundColor: cat.color, color: "white" }
                  : undefined
              }
            >
              <div
                className="size-2 rounded-full"
                style={{
                  backgroundColor: isActive ? "white" : cat.color,
                }}
              />
              {cat.name}
            </button>
          );
        })}

        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearAll}
            className="text-muted-foreground"
          >
            <X className="size-3.5 mr-1" />
            Hapus Filter
          </Button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-[4/3] w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          ))}
        </div>
      ) : isError ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-destructive">
              Gagal memuat cerita. Coba refresh halaman.
            </p>
          </CardContent>
        </Card>
      ) : stories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Compass className="mb-3 size-12 text-muted-foreground/50" />
            <p className="mb-1 font-semibold">Tidak ada cerita</p>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              {hasFilters
                ? "Coba ubah kata kunci atau hapus filter."
                : "Belum ada cerita yang dipublikasikan."}
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={handleClearAll}>
                Hapus Semua Filter
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {meta?.total ?? 0} cerita ditemukan
              {debouncedSearch && ` untuk "${debouncedSearch}"`}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => {
                  const newPage = page - 1;
                  setPage(newPage);
                  updateURL({ page: String(newPage) });
                }}
              >
                Sebelumnya
              </Button>

              <span className="px-4 text-sm text-muted-foreground">
                Halaman {meta.page} / {meta.totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= meta.totalPages}
                onClick={() => {
                  const newPage = page + 1;
                  setPage(newPage);
                  updateURL({ page: String(newPage) });
                }}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}