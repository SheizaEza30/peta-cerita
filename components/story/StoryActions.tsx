"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Bookmark,
  BookmarkCheck,
  Share2,
  Flag,
  Sparkles,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type StoryActionsProps = {
  storyId: string;
  storySlug: string;
  initialSaved?: boolean;
  onOpenStorytelling?: () => void;
};

export function StoryActions({
  storyId,
  storySlug,
  initialSaved = false,
  onOpenStorytelling,
}: StoryActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [saved, setSaved] = useState(initialSaved);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(true);

  // Cek status saved dari API saat mount
  useEffect(() => {
    if (!session?.user) {
      setChecking(false);
      return;
    }

    let cancelled = false;

    async function checkSaved() {
      try {
        // Cek via GET saved-stories?storyId=... atau cek di list
        const res = await fetch(`/api/saved-stories?storyId=${storyId}`, {
          cache: "no-store",
        });
        if (res.ok) {
          const json = await res.json();
          const isSaved = json?.data?.some?.(
            (s: { id: string }) => s.id === storyId
          );
          if (!cancelled && typeof isSaved === "boolean") {
            setSaved(isSaved);
          }
        }
      } catch {
        // Silent fail — pakai initialSaved
      } finally {
        if (!cancelled) setChecking(false);
      }
    }

    checkSaved();

    return () => {
      cancelled = true;
    };
  }, [storyId, session?.user]);

  async function handleSave() {
    // Belum login → redirect
    if (!session?.user) {
      toast.error("Login dulu untuk menyimpan cerita");
      router.push(`/login?callbackUrl=/story/${storySlug}`);
      return;
    }

    setSaving(true);

    // Optimistic update
    const prevSaved = saved;
    setSaved(!prevSaved);

    try {
      const method = prevSaved ? "DELETE" : "POST";
      const res = await fetch(`/api/stories/${storyId}/save`, {
        method,
        cache: "no-store",
      });

      if (!res.ok) {
        // Rollback
        setSaved(prevSaved);
        const json = await res.json().catch(() => null);
        toast.error(
          json?.error?.message ||
            (prevSaved
              ? "Gagal menghapus dari simpanan"
              : "Gagal menyimpan cerita")
        );
        return;
      }

      // Refresh saved page cache
      router.refresh();

      toast.success(
        prevSaved
          ? "Dihapus dari simpanan"
          : "Disimpan ke daftar baca"
      );
    } catch (err) {
      console.error("[SAVE_ERROR]", err);
      setSaved(prevSaved); // rollback
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  }

  async function handleShare() {
    const url = `${window.location.origin}/story/${storySlug}`;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: document.title,
          url,
        });
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

  function handleReport() {
    if (!session?.user) {
      toast.error("Login dulu untuk melaporkan cerita");
      router.push(`/login?callbackUrl=/story/${storySlug}`);
      return;
    }
    toast.info("Fitur laporan akan segera tersedia");
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      {onOpenStorytelling && (
        <Button
          onClick={onOpenStorytelling}
          className="flex-1 bg-gradient-to-r from-primary to-primary/80"
        >
          <Sparkles className="size-4 mr-2" />
          Mode Dongeng
        </Button>
      )}

      <Button
        onClick={handleSave}
        disabled={saving || checking}
        variant={saved ? "default" : "outline"}
      >
        {saving ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            {saved ? "Menyimpan..." : "Menghapus..."}
          </>
        ) : saved ? (
          <>
            <BookmarkCheck className="size-4 mr-2" />
            Tersimpan
          </>
        ) : (
          <>
            <Bookmark className="size-4 mr-2" />
            Simpan
          </>
        )}
      </Button>

      <Button onClick={handleShare} variant="outline">
        <Share2 className="size-4 mr-2" />
        Bagikan
      </Button>

      <Button onClick={handleReport} variant="outline">
        <Flag className="size-4 mr-2" />
        Laporkan
      </Button>
    </div>
  );
}