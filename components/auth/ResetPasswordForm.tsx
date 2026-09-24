"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .regex(/[A-Z]/, "Harus ada minimal 1 huruf besar")
      .regex(/[a-z]/, "Harus ada minimal 1 huruf kecil")
      .regex(/[0-9]/, "Harus ada minimal 1 angka"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

type FormInput = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  });

  async function onSubmit(data: FormInput) {
    if (!token) {
      setTokenError("Token tidak ditemukan di URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (json.error?.details?.token) {
          setTokenError(json.error.details.token[0]);
          setLoading(false);
          return;
        }
        toast.error(json.error?.message || "Gagal reset password");
        setLoading(false);
        return;
      }

      setDone(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err) {
      console.error("[RESET_PASSWORD_ERROR]", err);
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  // Token error
  if (tokenError) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="size-8" />
          </div>
        </div>

        <div>
          <h2 className="mb-2 font-semibold">Link Tidak Valid</h2>
          <p className="text-sm text-muted-foreground">{tokenError}</p>
        </div>

        <Button asChild className="w-full">
          <Link href="/forgot-password">Minta Link Baru</Link>
        </Button>
      </div>
    );
  }

  // No token in URL
  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertCircle className="size-8" />
          </div>
        </div>

        <div>
          <h2 className="mb-2 font-semibold">Link Tidak Valid</h2>
          <p className="text-sm text-muted-foreground">
            URL tidak memiliki token. Pastikan kamu klik link dari email.
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/forgot-password">Minta Link Baru</Link>
        </Button>
      </div>
    );
  }

  // Success
  if (done) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="size-8" />
          </div>
        </div>

        <div>
          <h2 className="mb-2 font-semibold">Password Berhasil Direset!</h2>
          <p className="text-sm text-muted-foreground">
            Kamu akan diarahkan ke halaman login dalam 3 detik...
          </p>
        </div>

        <Button asChild className="w-full">
          <Link href="/login">Masuk Sekarang</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
        <Label htmlFor="confirmPassword">Konfirmasi Password</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          disabled={loading}
          {...register("confirmPassword")}
        />
        {errors.confirmPassword && (
          <p className="text-xs text-destructive">
            {errors.confirmPassword.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Menyimpan...
          </>
        ) : (
          <>
            <KeyRound className="size-4 mr-2" />
            Simpan Password Baru
          </>
        )}
      </Button>
    </form>
  );
}