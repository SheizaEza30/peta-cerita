"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  X,
  BookOpen,
  MapPin,
  Clock,
  Share2,
  Bookmark,
  BookmarkCheck,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { estimateReadingTime, truncate } from "@/lib/utils";

export type SlideUpStory = {
  id: string;
  title: string;
  slug: string;
  synopsis: string;
  heroImage: string | null;
  city: string | null;
  province: string | null;
  period: string | null;
  content?: string | null;
  category: {
    name: string;
    slug: string;
    color: string | null;
  } | null;
};

type StorySlideUpProps = {
  story: SlideUpStory | null;
  open: boolean;
  onClose: () => void;
};

export function StorySlideUp({ story, open, onClose }: StorySlideUpProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cek status saved saat slide-up dibuka
  useEffect(() => {
    if (!open || !story || !session?.user) {
      setSaved(false);
      return;
    }

    let cancelled = false;

    async function checkSaved() {
      try {
        const res = await fetch(
          `/api/saved-stories?storyId=${story!.id}`,
          { cache: "no-store" }
        );
        if (!res.ok) return;
        const json = await res.json();
        // Response: { data: [{...story}] } atau { data: [] }
        const isSaved = Array.isArray(json?.data) && json.data.length > 0;
        if (!cancelled) setSaved(isSaved);
      } catch {
        // Silent fail
      }
    }

    checkSaved();

    return () => {
      cancelled = true;
    };
  }, [open, story, session?.user]);

  async function handleSave() {
    if (!story) return;

    // Belum login → redirect
    if (!session?.user) {
      toast.error("Login dulu untuk menyimpan cerita");
      router.push(`/login?callbackUrl=/story/${story.slug}`);
      return;
    }

    setSaving(true);
    const prevSaved = saved;
    setSaved(!prevSaved); // optimistic

    try {
      const method = prevSaved ? "DELETE" : "POST";
      const res = await fetch(`/api/stories/${story.id}/save`, {
        method,
        cache: "no-store",
      });

      if (!res.ok) {
        setSaved(prevSaved); // rollback
        const json = await res.json().catch(() => null);
        toast.error(
          json?.error?.message ||
            (prevSaved ? "Gagal menghapus" : "Gagal menyimpan")
        );
        return;
      }

      toast.success(
        prevSaved ? "Dihapus dari simpanan" : "Disimpan ke daftar baca"
      );
      router.refresh();
    } catch (err) {
      console.error("[SLIDEUP_SAVE_ERROR]", err);
      setSaved(prevSaved); // rollback
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    if (!story) return;
    const url = `${window.location.origin}/story/${story.slug}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: story.title, url });
      } catch {
        // User cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success("Link disalin ke clipboard");
      } catch {
        toast.error("Gagal menyalin link");
      }
    }
  }

  return (
    <AnimatePresence>
      {open && story && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-40 max-h-[85vh] overflow-hidden rounded-t-2xl bg-background shadow-2xl md:left-auto md:right-4 md:bottom-4 md:max-w-md md:rounded-2xl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="story-title"
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-2 md:hidden">
              <div className="h-1 w-12 rounded-full bg-border" />
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur transition-colors hover:bg-background"
              aria-label="Tutup"
            >
              <X className="size-4" />
            </button>

            {/* Hero image */}
            {story.heroImage && (
              <div className="relative h-40 w-full overflow-hidden bg-muted md:h-48">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={story.heroImage}
                  alt={story.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {/* Content */}
            <div className="max-h-[calc(85vh-11rem)] overflow-y-auto px-4 py-4 md:px-5">
              {/* Category badge */}
              {story.category && (
                <Badge
                  variant="secondary"
                  className="mb-2"
                  style={
                    story.category.color
                      ? {
                          backgroundColor: `${story.category.color}20`,
                          color: story.category.color,
                          borderColor: `${story.category.color}40`,
                        }
                      : undefined
                  }
                >
                  {story.category.name}
                </Badge>
              )}

              {/* Title */}
              <h2
                id="story-title"
                className="mb-2 font-serif text-xl font-bold leading-tight md:text-2xl"
              >
                {story.title}
              </h2>

              {/* Meta */}
              <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {(story.city || story.province) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="size-3" />
                    {[story.city, story.province].filter(Boolean).join(", ")}
                  </span>
                )}
                {story.content && (
                  <span className="flex items-center gap-1">
                    <Clock className="size-3" />
                    {estimateReadingTime(story.content)} menit baca
                  </span>
                )}
                {story.period && (
                  <span className="flex items-center gap-1">
                    <BookOpen className="size-3" />
                    {story.period}
                  </span>
                )}
              </div>

              {/* Synopsis */}
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {truncate(story.synopsis, 200)}
              </p>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <Button asChild className="flex-1" size="lg">
                  <Link href={`/story/${story.slug}`}>
                    <BookOpen className="size-4 mr-2" />
                    Lanjut Baca
                  </Link>
                </Button>

                <Button
                  variant={saved ? "default" : "outline"}
                  size="icon"
                  onClick={handleSave}
                  disabled={saving}
                  aria-label={saved ? "Tersimpan" : "Simpan"}
                >
                  {saving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : saved ? (
                    <BookmarkCheck className="size-4" />
                  ) : (
                    <Bookmark className="size-4" />
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  aria-label="Bagikan"
                >
                  <Share2 className="size-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}