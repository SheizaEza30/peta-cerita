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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type DeleteStoryDialogProps = {
  storyId: string;
  storySlug: string;
  storyTitle: string;
  open: boolean;
  onClose: () => void;
};

export function DeleteStoryDialog({
  storyId,
  storySlug: _storySlug,
  storyTitle,
  open,
  onClose,
}: DeleteStoryDialogProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const isConfirmed = confirmText === "HAPUS";

  async function handleDelete() {
    if (!isConfirmed) return;

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
      router.refresh();
    } catch (err) {
      console.error("[DELETE_STORY_ERROR]", err);
      toast.error("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setConfirmText("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
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
                Cerita, gambar, riwayat baca, dan bookmark user terkait akan
                dihapus permanen.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Cerita yang akan dihapus:</p>
          <p className="mt-1 text-sm font-semibold">{storyTitle}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmDelete">
            Ketik{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              HAPUS
            </code>{" "}
            untuk konfirmasi:
          </Label>
          <Input
            id="confirmDelete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="HAPUS"
            disabled={loading}
            autoComplete="off"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={loading}>
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading || !isConfirmed}
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