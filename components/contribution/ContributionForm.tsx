"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send, Info } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LocationPicker } from "./LocationPicker";
import {
  contributionBaseSchema,
  type ContributionBaseInput,
} from "@/lib/validation/contribution.schema";

type Category = {
  id: string;
  name: string;
  slug: string;
  color: string | null;
};

type ContributionFormProps = {
  categories: Category[];
  defaultValues?: Partial<ContributionBaseInput>;
  contributionId?: string; // Kalau edit
};

export function ContributionForm({
  categories,
  defaultValues,
  contributionId,
}: ContributionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState({
    latitude: defaultValues?.latitude ?? -2.5,
    longitude: defaultValues?.longitude ?? 118,
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContributionBaseInput>({
    resolver: zodResolver(contributionBaseSchema),
    defaultValues: {
      title: "",
      synopsis: "",
      content: "",
      categoryId: "",
      latitude: coords.latitude,
      longitude: coords.longitude,
      address: "",
      city: "",
      province: "",
      country: "Indonesia",
      period: "",
      source: "",
      heroImage: "",
      confirmAccurate: false,
      ...defaultValues,
    },
  });

  const isEdit = !!contributionId;

  // Sync coords ke form
  useEffect(() => {
    setValue("latitude", coords.latitude);
    setValue("longitude", coords.longitude);
  }, [coords, setValue]);

  async function onSubmit(data: ContributionBaseInput) {
    setLoading(true);
    try {
      const url = isEdit
        ? `/api/contributions/${contributionId}`
        : "/api/contributions";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error?.message || "Gagal menyimpan kontribusi");
        setLoading(false);
        return;
      }

      toast.success(
        isEdit
          ? "Kontribusi berhasil diperbarui"
          : "Kontribusi berhasil dikirim! Menunggu review moderator."
      );

      router.push("/profile/contributions");
      router.refresh();
    } catch (err) {
      console.error("[CONTRIBUTE_ERROR]", err);
      toast.error("Terjadi kesalahan. Coba lagi.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ============================================
          BASIC INFO
          ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Informasi Dasar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Judul */}
          <div className="space-y-2">
            <Label htmlFor="title">
              Judul Cerita <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Contoh: Legenda Situ Bagendit"
              disabled={loading}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>

          {/* Kategori */}
          <div className="space-y-2">
            <Label htmlFor="categoryId">
              Kategori <span className="text-destructive">*</span>
            </Label>
            <Select
              value={watch("categoryId")}
              onValueChange={(val) => setValue("categoryId", val)}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori..." />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    <div className="flex items-center gap-2">
                      <div
                        className="size-2 rounded-full"
                        style={{
                          backgroundColor: cat.color ?? "#1f9d69",
                        }}
                      />
                      {cat.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.categoryId && (
              <p className="text-xs text-destructive">
                {errors.categoryId.message}
              </p>
            )}
          </div>

          {/* Sinopsis */}
          <div className="space-y-2">
            <Label htmlFor="synopsis">
              Sinopsis <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="synopsis"
              placeholder="Ringkasan singkat cerita (20-500 karakter)..."
              rows={3}
              disabled={loading}
              {...register("synopsis")}
            />
            {errors.synopsis && (
              <p className="text-xs text-destructive">
                {errors.synopsis.message}
              </p>
            )}
          </div>

          {/* Konten */}
          <div className="space-y-2">
            <Label htmlFor="content">
              Isi Cerita <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="content"
              placeholder="Tulis cerita lengkap di sini... Pisahkan paragraf dengan enter 2x."
              rows={12}
              disabled={loading}
              className="font-serif"
              {...register("content")}
            />
            {errors.content && (
              <p className="text-xs text-destructive">
                {errors.content.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Minimal 100 karakter. Pisahkan paragraf dengan enter 2x.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          LOKASI
          ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Lokasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm">
            <div className="flex items-start gap-2">
              <Info className="mt-0.5 size-4 shrink-0 text-blue-600" />
              <p className="text-blue-900">
                Geser peta & klik untuk menentukan lokasi cerita. Pin akan
                menunjukkan titik cerita di peta utama.
              </p>
            </div>
          </div>

          <LocationPicker
            latitude={coords.latitude}
            longitude={coords.longitude}
            onChange={(lat, lng) =>
              setCoords({ latitude: lat, longitude: lng })
            }
          />

          <div className="grid gap-3 md:grid-cols-2">
            {/* Kota */}
            <div className="space-y-2">
              <Label htmlFor="city">Kota / Kabupaten</Label>
              <Input
                id="city"
                placeholder="Contoh: Garut"
                disabled={loading}
                {...register("city")}
              />
            </div>

            {/* Provinsi */}
            <div className="space-y-2">
              <Label htmlFor="province">Provinsi</Label>
              <Input
                id="province"
                placeholder="Contoh: Jawa Barat"
                disabled={loading}
                {...register("province")}
              />
            </div>
          </div>

          {/* Alamat */}
          <div className="space-y-2">
            <Label htmlFor="address">Alamat Lengkap (opsional)</Label>
            <Input
              id="address"
              placeholder="Nama tempat / alamat detail"
              disabled={loading}
              {...register("address")}
            />
          </div>

          {/* Koordinat — readonly */}
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Latitude</Label>
              <Input value={coords.latitude.toFixed(6)} readOnly />
            </div>
            <div className="space-y-2">
              <Label>Longitude</Label>
              <Input value={coords.longitude.toFixed(6)} readOnly />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          METADATA
          ============================================ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detail Tambahan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Periode */}
          <div className="space-y-2">
            <Label htmlFor="period">Periode / Tahun (opsional)</Label>
            <Input
              id="period"
              placeholder="Contoh: Abad ke-15 / 1945 / Tradisi kuno"
              disabled={loading}
              {...register("period")}
            />
          </div>

          {/* Sumber */}
          <div className="space-y-2">
            <Label htmlFor="source">
              Sumber / Referensi <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="source"
              placeholder="Contoh: Buku 'Sejarah Jawa Barat' (2010), wawancara dengan sesepuh desa, website..."
              rows={3}
              disabled={loading}
              {...register("source")}
            />
            {errors.source && (
              <p className="text-xs text-destructive">
                {errors.source.message}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              Wajib diisi. Sebutkan sumber jelas agar kontribusi dapat
              diverifikasi.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          KONFIRMASI
          ============================================ */}
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <Checkbox
              id="confirmAccurate"
              disabled={loading}
              onCheckedChange={(checked) =>
                setValue("confirmAccurate", checked === true)
              }
            />
            <div className="space-y-1">
              <Label
                htmlFor="confirmAccurate"
                className="cursor-pointer text-sm font-medium leading-tight"
              >
                Saya mengonfirmasi bahwa kontribusi ini berdasarkan sumber yang
                akurat dan dapat dipertanggungjawabkan.
              </Label>
              {errors.confirmAccurate && (
                <p className="text-xs text-destructive">
                  {errors.confirmAccurate.message}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ============================================
          SUBMIT
          ============================================ */}
      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" size="lg" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="size-4 mr-2 animate-spin" />
              Mengirim...
            </>
          ) : (
            <>
              <Send className="size-4 mr-2" />
              {isEdit ? "Simpan Perubahan" : "Kirim Kontribusi"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}