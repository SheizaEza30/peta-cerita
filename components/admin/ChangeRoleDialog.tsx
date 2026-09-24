"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, UserCog, Shield, User as UserIcon } from "lucide-react";
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
import { cn } from "@/lib/utils";

type Role = "USER" | "MODERATOR" | "ADMIN";

const ROLE_OPTIONS: {
  value: Role;
  label: string;
  description: string;
  icon: typeof UserIcon;
  color: string;
}[] = [
  {
    value: "USER",
    label: "Kontributor",
    description: "Bisa submit cerita, simpan, komentar",
    icon: UserIcon,
    color: "text-blue-600 bg-blue-100",
  },
  {
    value: "MODERATOR",
    label: "Moderator",
    description: "Bisa approve/reject kontribusi & laporan",
    icon: Shield,
    color: "text-purple-600 bg-purple-100",
  },
  {
    value: "ADMIN",
    label: "Admin",
    description: "Akses penuh ke semua fitur",
    icon: Shield,
    color: "text-red-600 bg-red-100",
  },
];

type ChangeRoleDialogProps = {
  userId: string;
  username: string;
  userName: string | null;
  currentRole: Role;
  open: boolean;
  onClose: () => void;
};

export function ChangeRoleDialog({
  userId,
  username,
  userName,
  currentRole,
  open,
  onClose,
}: ChangeRoleDialogProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Role>(currentRole);
  const [loading, setLoading] = useState(false);

  // Reset state saat dialog dibuka
  useEffect(() => {
    if (open) setSelected(currentRole);
  }, [open, currentRole]);

  const hasChange = selected !== currentRole;

  async function handleSubmit() {
    if (!hasChange) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: selected }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || "Gagal mengubah role");
        setLoading(false);
        return;
      }

      toast.success(
        `Role @${username} berhasil diubah menjadi ${selected}`
      );
      onClose();
      router.refresh();
    } catch (err) {
      console.error("[CHANGE_ROLE_ERROR]", err);
      toast.error("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-2">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <UserCog className="size-5" />
            </div>
            <DialogTitle>Ubah Role User</DialogTitle>
          </div>
          <DialogDescription>
            Ubah role untuk{" "}
            <strong>{userName ?? username}</strong> (@{username}).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          {ROLE_OPTIONS.map((role) => {
            const Icon = role.icon;
            const isSelected = selected === role.value;
            return (
              <button
                key={role.value}
                type="button"
                disabled={loading}
                onClick={() => setSelected(role.value)}
                className={cn(
                  "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:bg-muted/50",
                  loading && "cursor-not-allowed opacity-50"
                )}
              >
                <div
                  className={cn(
                    "flex size-10 shrink-0 items-center justify-center rounded-full",
                    role.color
                  )}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{role.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {role.description}
                  </p>
                </div>
                <div
                  className={cn(
                    "mt-1 flex size-4 shrink-0 items-center justify-center rounded-full border-2",
                    isSelected
                      ? "border-primary bg-primary"
                      : "border-muted-foreground/30"
                  )}
                >
                  {isSelected && (
                    <div className="size-1.5 rounded-full bg-white" />
                  )}
                </div>
              </button>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !hasChange}
          >
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : hasChange ? (
              "Ubah Role"
            ) : (
              "Tidak Ada Perubahan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}