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

type DeleteUserDialogProps = {
  userId: string;
  username: string;
  userName: string | null;
  open: boolean;
  onClose: () => void;
};

export function DeleteUserDialog({
  userId,
  username,
  userName,
  open,
  onClose,
}: DeleteUserDialogProps) {
  const router = useRouter();
  const [confirmText, setConfirmText] = useState("");
  const [loading, setLoading] = useState(false);

  const isConfirmed = confirmText === username;

  async function handleDelete() {
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      const json = await res.json().catch(() => null);

      if (!res.ok) {
        toast.error(json?.error?.message || "Gagal menghapus user");
        setLoading(false);
        return;
      }

      toast.success(`User @${username} berhasil dihapus`);
      onClose();
      router.refresh();
    } catch (err) {
      console.error("[DELETE_USER_ERROR]", err);
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
            <DialogTitle>Hapus User</DialogTitle>
          </div>
          <DialogDescription>
            User akan dihapus permanen dari sistem.
          </DialogDescription>
        </DialogHeader>

        {/* Warning */}
        <div className="rounded-lg border border-red-200 bg-red-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600" />
            <div className="text-xs text-red-800">
              <p className="mb-1 font-semibold">Tindakan ini tidak dapat dibatalkan!</p>
              <p>
                Semua data user — cerita, kontribusi, komentar, achievement,
                poin — akan dihapus permanen.
              </p>
            </div>
          </div>
        </div>

        {/* Confirm input */}
        <div className="space-y-2">
          <Label htmlFor="confirmDelete">
            Ketik <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{username}</code> untuk konfirmasi:
          </Label>
          <Input
            id="confirmDelete"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder={username}
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
                Hapus Permanen
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}