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

type DeleteContributionDialogProps = {
  contributionId: string;
  contributionTitle: string;
  open: boolean;
  onClose: () => void;
};

export function DeleteContributionDialog({
  contributionId,
  contributionTitle,
  open,
  onClose,
}: DeleteContributionDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    try {
      const res = await fetch(`/api/contributions/${contributionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        toast.error(json?.error?.message || "Gagal menghapus kontribusi");
        setLoading(false);
        return;
      }

      toast.success("Kontribusi berhasil dihapus");
      onClose();
      router.refresh();
    } catch (err) {
      console.error("[DELETE_CONTRIBUTION_ERROR]", err);
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
            <DialogTitle>Hapus Kontribusi</DialogTitle>
          </div>
          <DialogDescription>
            Kontribusi akan dihapus permanen dari daftar Anda.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-600" />
            <p className="text-xs text-yellow-800">
              Tindakan ini tidak dapat dibatalkan. Kalau Anda hanya ingin
              memperbaiki, gunakan tombol <strong>Edit</strong>.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <p className="text-xs text-muted-foreground">Kontribusi:</p>
          <p className="mt-1 text-sm font-semibold">{contributionTitle}</p>
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
                Hapus Kontribusi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}