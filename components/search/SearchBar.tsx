"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, X, Loader2, MapPin, Clock } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchStories } from "@/hooks/useSearchStories";
import { cn } from "@/lib/utils";

export function SearchBar() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const { data: results = [], isLoading, isError } = useSearchStories(query);

  const showDropdown = open && query.length >= 2;

  // Close dropdown saat klik di luar
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    // Kalau ada result pertama, langsung ke story
    if (results.length > 0 && results[0]) {
      router.push(`/story/${results[0].slug}`);
      setOpen(false);
      setQuery("");
    }
  }

  function handleClear() {
    setQuery("");
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-md">
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Cari cerita, kota, kategori..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            className="h-10 pl-9 pr-9 shadow-card"
          />
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Hapus pencarian"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 max-h-96 overflow-hidden rounded-lg border border-border bg-background shadow-lg">
          {isLoading && (
            <div className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" />
              Mencari...
            </div>
          )}

          {!isLoading && isError && (
            <div className="p-4 text-sm text-destructive">
              Gagal memuat hasil. Coba lagi.
            </div>
          )}

          {!isLoading && !isError && results.length === 0 && (
            <div className="p-4 text-sm text-muted-foreground">
              Tidak ada hasil untuk &ldquo;{query}&rdquo;
            </div>
          )}

          {!isLoading && !isError && results.length > 0 && (
            <div className="max-h-96 overflow-y-auto">
              {results.map((story) => (
                <Link
                  key={story.id}
                  href={`/story/${story.slug}`}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className={cn(
                    "flex items-start gap-3 border-b border-border p-3 transition-colors last:border-b-0",
                    "hover:bg-muted/50"
                  )}
                >
                  {/* Thumbnail */}
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {story.heroImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={story.heroImage}
                        alt={story.title}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex size-full items-center justify-center text-xs font-bold text-white"
                        style={{
                          background: story.category?.color ?? "#1f9d69",
                        }}
                      >
                        {story.title.charAt(0)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p className="mb-0.5 line-clamp-1 text-sm font-medium">
                      {story.title}
                    </p>

                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[10px] text-muted-foreground">
                      {story.location && (
                        <span className="flex items-center gap-0.5">
                          <MapPin className="size-2.5" />
                          {story.location}
                        </span>
                      )}
                      {story.category && (
                        <span
                          className="font-medium"
                          style={{
                            color: story.category.color ?? undefined,
                          }}
                        >
                          {story.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

              {/* Footer */}
              <div className="border-t border-border bg-muted/30 p-2 text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs"
                  onClick={() => {
                    // Kalau nanti ada halaman /explore?q=...
                    router.push(`/explore?q=${encodeURIComponent(query)}`);
                    setOpen(false);
                  }}
                >
                  Lihat semua hasil untuk &ldquo;{query}&rdquo;
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}