"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, KeyRound } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  changePasswordSchema,
  type ChangePasswordInput,
} from "@/lib/validation/auth.schema";

export function ChangePasswordForm() {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmNewPassword: data.confirmNewPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error?.details) {
          const details = json.error.details;
          const firstError = Object.values(details)[0] as string[];
          toast.error(firstError?.[0] ?? "Gagal mengubah password");
        } else {
          toast.error(json.error?.message || "Gagal mengubah password");
        }
        setLoading(false);
        return;
      }

      toast.success("Password berhasil diubah!");
      reset();
    } catch (err) {
      console.error("[CHANGE_PASSWORD_ERROR]", err);
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Ubah Password</CardTitle>
            <CardDescription>
              Password minimal 8 karakter, harus ada huruf besar, kecil, dan
              angka.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Saat Ini</Label>
            <Input
              id="currentPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={loading}
              {...register("currentPassword")}
            />
            {errors.currentPassword && (
              <p className="text-xs text-destructive">
                {errors.currentPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              type="password"
              placeholder="Min. 8 karakter, huruf besar, kecil, angka"
              autoComplete="new-password"
              disabled={loading}
              {...register("newPassword")}
            />
            {errors.newPassword && (
              <p className="text-xs text-destructive">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmNewPassword"
              type="password"
              placeholder="••••••••"
              autoComplete="new-password"
              disabled={loading}
              {...register("confirmNewPassword")}
            />
            {errors.confirmNewPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmNewPassword.message}
              </p>
            )}
          </div>

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Menyimpan...
              </>
            ) : (
              <>
                <KeyRound className="size-4 mr-2" />
                Ubah Password
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}