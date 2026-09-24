"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, XCircle, AlertTriangle } from "lucide-react";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type RejectDialogProps = {
  contributionId: string;
  contributionTitle: string;
  open: boolean;
  onClose: () => void;
};

export function RejectDialog({
  contributionId,
  contributionTitle,
  open,
  onClose,
}: RejectDialogProps) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReject() {
    setError(null);

    // Validasi lokal
    if (reason.trim().length < 10) {
      setError("Alasan minimal 10 karakter agar jelas bagi kontributor");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `/api/admin/contributions/${contributionId}/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rejectionReason: reason.trim() }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        const msg = json.error?.message || "Gagal menolak kontribusi";
        setError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }

      toast.success("Kontribusi ditolak. Kontributor akan mendapat notifikasi.");
      setReason("");
      onClose();
      router.refresh();
    } catch (err) {
      console.error("[REJECT_ERROR]", err);
      setError("Terjadi kesalahan. Coba lagi.");
      toast.error("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  function handleClose() {
    if (loading) return;
    setReason("");
    setError(null);
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle className="size-5" />
            </div>
            <DialogTitle>Tolak Kontribusi</DialogTitle>
          </div>
          <DialogDescription>
            Kontribusi <strong>&ldquo;{contributionTitle}&rdquo;</strong> akan
            ditolak. Kontributor dapat memperbaiki dan mengajukan ulang.
          </DialogDescription>
        </DialogHeader>

        {/* Warning */}
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-600" />
            <p className="text-xs text-yellow-800">
              Alasan penolakan akan dikirim ke kontributor. Berikan feedback
              yang jelas & membangun agar mereka bisa memperbaiki.
            </p>
          </div>
        </div>

        {/* Reason input */}
        <div className="space-y-2">
          <Label htmlFor="rejectionReason">
            Alasan Penolakan <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="rejectionReason"
            placeholder="Contoh: Sumber referensi belum jelas. Mohon cantumkan nama buku atau website yang valid."
            rows={4}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError(null);
            }}
            disabled={loading}
            maxLength={1000}
          />
          <div className="flex items-center justify-between text-xs">
            {error ? (
              <span className="text-destructive">{error}</span>
            ) : (
              <span className="text-muted-foreground">
                Minimal 10 karakter, jelaskan dengan detail
              </span>
            )}
            <span className="text-muted-foreground">
              {reason.length}/1000
            </span>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading}
          >
            Batal
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={loading || reason.trim().length < 10}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Menolak...
              </>
            ) : (
              <>
                <XCircle className="size-4 mr-2" />
                Tolak Kontribusi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}