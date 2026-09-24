import { FolderTree, BookOpen } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";

export const metadata = {
  title: "Kelola Kategori",
};

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      icon: true,
      color: true,
      description: true,
      createdAt: true,
      _count: {
        select: { stories: true },
      },
    },
  });

  const totalCategories = categories.length;
  const totalStories = categories.reduce(
    (sum, c) => sum + c._count.stories,
    0
  );

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold md:text-3xl">
          Kelola Kategori
        </h1>
        <p className="text-sm text-muted-foreground">
          {totalCategories} kategori · {formatNumber(totalStories)} cerita total
        </p>
      </div>

      {/* Info box */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="flex items-start gap-3 p-4">
          <FolderTree className="mt-0.5 size-5 shrink-0 text-blue-600" />
          <div>
            <p className="mb-1 text-sm font-medium text-blue-900">
              Tentang Kategori
            </p>
            <p className="text-xs text-blue-800">
              Kategori membantu pengguna memfilter cerita berdasarkan jenis
              (Sejarah, Legenda, Budaya, dll). Setiap cerita wajib punya 1
              kategori. Kategori dengan cerita terkait tidak dapat dihapus.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Categories grid */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <FolderTree className="mb-3 size-12 text-muted-foreground/50" />
            <p className="mb-1 font-semibold">Belum ada kategori</p>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              Kategori akan muncul setelah di-seed atau ditambahkan.
            </p>
            <Button asChild variant="outline">
              <a href="/admin">Kembali ke Dashboard</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="overflow-hidden transition-shadow hover:shadow-md"
            >
              <CardContent className="p-0">
                {/* Color header */}
                <div
                  className="h-2 w-full"
                  style={{
                    backgroundColor: category.color ?? "#1f9d69",
                  }}
                />

                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    {/* Icon circle */}
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-lg text-white"
                      style={{
                        backgroundColor: category.color ?? "#1f9d69",
                      }}
                    >
                      <FolderTree className="size-5" />
                    </div>

                    {/* Story count */}
                    <Badge variant="secondary" className="shrink-0">
                      <BookOpen className="size-3 mr-1" />
                      {category._count.stories}
                    </Badge>
                  </div>

                  <h3 className="mb-1 font-serif text-base font-bold">
                    {category.name}
                  </h3>

                  <p className="mb-2 font-mono text-[10px] text-muted-foreground">
                    /{category.slug}
                  </p>

                  {category.description && (
                    <p className="line-clamp-2 text-xs text-muted-foreground">
                      {category.description}
                    </p>
                  )}

                  {/* Stats footer */}
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
                    <span>
                      {category._count.stories === 0
                        ? "Belum ada cerita"
                        : `${category._count.stories} cerita`}
                    </span>
                    {category._count.stories > 0 ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        disabled
                        title="Tidak dapat dihapus karena masih ada cerita"
                      >
                        Tidak dapat dihapus
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-destructive hover:text-destructive"
                        disabled
                        title="Fitur hapus kategori akan segera tersedia"
                      >
                        Hapus
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Info footer */}
      {categories.length > 0 && (
        <Card className="mt-6 border-dashed">
          <CardContent className="flex items-start gap-3 p-4">
            <FolderTree className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="mb-1 text-sm font-semibold">
                Edit / Tambah Kategori
              </p>
              <p className="text-xs text-muted-foreground">
                Fitur CRUD kategori lengkap (tambah/edit/hapus) akan tersedia
                di versi berikutnya. Untuk sekarang, kategori di-seed dari
                database.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}