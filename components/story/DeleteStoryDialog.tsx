"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type DeleteStoryDialogProps = {
  storyId: string;
  storyTitle: string;
  storySlug: string;
  open: boolean;
  onClose: () => void;
};

export function DeleteStoryDialog({
  storyId,
  storyTitle,
  storySlug,
  open,
  onClose,
}: DeleteStoryDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/stories/${storyId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        toast.error(json?.error?.message || "Gagal menghapus cerita");
        setLoading(false);
        return;
      }

      toast.success(`Cerita "${storyTitle}" berhasil dihapus`);
      onClose();
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("[DELETE_STORY_ERROR]", err);
      toast.error("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <Trash2 className="size-5" />
            </div>
            <DialogTitle>Hapus Cerita</DialogTitle>
          </div>
          <DialogDescription>
            Cerita akan dihapus permanen dari sistem.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
            <div className="text-xs text-red-800">
              <p className="mb-1 font-semibold">
                Tindakan ini tidak dapat dibatalkan!
              </p>
              <p>
                Cerita, bookmark user, dan riwayat baca terkait akan dihapus
                permanen.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Cerita:</p>
          <p className="mt-1 text-sm font-semibold">{storyTitle}</p>
          <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
            /story/{storySlug}
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 className="size-4 mr-2" />
                Hapus Cerita
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}