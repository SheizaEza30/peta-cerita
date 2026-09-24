"use client";

import { useState, useEffect } from "react";
import { Loader2, KeyRound, AlertTriangle, Copy, Check } from "lucide-react";
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

type ResetPasswordDialogProps = {
  userId: string;
  username: string;
  userName: string | null;
  open: boolean;
  onClose: () => void;
};

function generateRandomPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digit = "23456789";
  const all = upper + lower + digit;

  let pwd = "";
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digit[Math.floor(Math.random() * digit.length)];

  for (let i = 0; i < 5; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }

  return pwd
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
}

export function ResetPasswordDialog({
  userId,
  username,
  userName,
  open,
  onClose,
}: ResetPasswordDialogProps) {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (open) {
      setNewPassword(generateRandomPassword());
      setCopied(false);
      setDone(false);
    }
  }, [open]);

  async function handleReset() {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users/${userId}/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newPassword }),
        }
      );

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || "Gagal reset password");
        setLoading(false);
        return;
      }

      toast.success("Password berhasil direset");
      setDone(true);
    } catch (err) {
      console.error("[RESET_PASSWORD_ERROR]", err);
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast.success("Password disalin ke clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Gagal menyalin");
    }
  }

  function handleClose() {
    if (loading) return;
    setNewPassword("");
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
              <KeyRound className="size-5" />
            </div>
            <DialogTitle>
              {done ? "Password Direset" : "Reset Password"}
            </DialogTitle>
          </div>
          <DialogDescription>
            {done ? (
              <>
                Password untuk <strong>@{username}</strong> berhasil
                direset. Copy password di bawah dan berikan ke user.
              </>
            ) : (
              <>
                Reset password untuk{" "}
                <strong>{userName ?? username}</strong> (@{username}).
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {!done && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-yellow-600" />
              <p className="text-xs text-yellow-800">
                User akan diminta ganti password setelah login. Pastikan kamu
                komunikasikan password baru ini dengan aman.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="newPassword">
            {done ? "Password Baru" : "Password Baru (auto-generate)"}
          </Label>
          <div className="flex gap-2">
            <Input
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={loading || done}
              readOnly={done}
              className="font-mono"
            />
            {done && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleCopy}
                aria-label="Copy password"
              >
                {copied ? (
                  <Check className="size-4 text-green-600" />
                ) : (
                  <Copy className="size-4" />
                )}
              </Button>
            )}
            {!done && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setNewPassword(generateRandomPassword())}
                disabled={loading}
                aria-label="Generate ulang"
              >
                <KeyRound className="size-4" />
              </Button>
            )}
          </div>
        </div>

        <DialogFooter>
          {done ? (
            <Button onClick={handleClose} className="w-full">
              Selesai
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleClose} disabled={loading}>
                Batal
              </Button>
              <Button onClick={handleReset} disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="size-4 mr-2 animate-spin" />
                    Mereset...
                  </>
                ) : (
                  <>
                    <KeyRound className="size-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}