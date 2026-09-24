"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, UserCog, User } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/lib/validation/auth.schema";

type ProfileFormProps = {
  initialName: string;
  initialUsername: string;
  initialBio: string;
  initialAvatar: string;
  email: string;
};

export function ProfileForm({
  initialName,
  initialUsername,
  initialBio,
  initialAvatar,
  email,
}: ProfileFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: initialName,
      bio: initialBio,
      avatar: initialAvatar,
    },
  });

  async function onSubmit(data: UpdateProfileInput) {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || "Gagal memperbarui profil");
        setLoading(false);
        return;
      }

      toast.success("Profil berhasil diperbarui!");
      router.refresh();
    } catch (err) {
      console.error("[UPDATE_PROFILE_ERROR]", err);
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
            <UserCog className="size-4" />
          </div>
          <div>
            <CardTitle className="text-base">Info Profil</CardTitle>
            <CardDescription>
              Nama dan bio yang akan ditampilkan ke publik.
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              readOnly
              className="bg-muted/50 text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Email tidak dapat diubah
            </p>
          </div>

          {/* Username (readonly) */}
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={initialUsername}
              readOnly
              className="bg-muted/50 text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Username tidak dapat diubah
            </p>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              placeholder="Budi Santoso"
              disabled={loading}
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              placeholder="Ceritakan sedikit tentang dirimu..."
              rows={3}
              disabled={loading}
              maxLength={500}
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-xs text-destructive">{errors.bio.message}</p>
            )}
          </div>

          {/* Avatar URL */}
          <div className="space-y-2">
            <Label htmlFor="avatar">URL Avatar (opsional)</Label>
            <Input
              id="avatar"
              type="url"
              placeholder="https://contoh.com/foto.jpg"
              disabled={loading}
              {...register("avatar")}
            />
            {errors.avatar && (
              <p className="text-xs text-destructive">
                {errors.avatar.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Masukkan URL foto. Upload file akan tersedia nanti.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button type="submit" disabled={loading || !isDirty}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                <>
                  <User className="size-4 mr-2" />
                  Simpan Perubahan
                </>
              )}
            </Button>
            {!isDirty && (
              <p className="text-xs text-muted-foreground">
                Tidak ada perubahan
              </p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}