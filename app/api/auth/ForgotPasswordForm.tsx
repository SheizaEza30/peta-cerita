"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email wajib diisi");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || "Gagal mengirim email");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch (err) {
      console.error("[FORGOT_PASSWORD_ERROR]", err);
      toast.error("Terjadi kesalahan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="size-8" />
          </div>
        </div>

        <div>
          <h2 className="mb-2 font-semibold">Email Terkirim!</h2>
          <p className="text-sm text-muted-foreground">
            Kalau <strong>{email}</strong> terdaftar, kami sudah kirim link
            reset password. Cek inbox atau folder spam kamu.
          </p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-xs text-blue-800">
          💡 Link berlaku selama 1 jam. Kalau tidak menerima email, cek folder
          spam atau coba lagi nanti.
        </div>

        <Link
          href="/login"
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <ArrowLeft className="size-4" />
          Kembali ke halaman login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="nama@email.com"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="size-4 mr-2 animate-spin" />
            Mengirim...
          </>
        ) : (
          <>
            <Mail className="size-4 mr-2" />
            Kirim Link Reset
          </>
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Ingat password kamu?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:underline"
        >
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}