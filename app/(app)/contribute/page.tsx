import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, PlusCircle, Info } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ContributionForm } from "@/components/contribution/ContributionForm";

export const metadata = {
  title: "Kontribusi Baru",
};

export default async function ContributePage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/contribute");

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      color: true,
    },
  });

  return (
    <div className="container max-w-3xl py-6">
      {/* Back button */}
      <Link
        href="/profile"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke profil
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="mb-2 flex items-center gap-2">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <PlusCircle className="size-5" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold md:text-3xl">
              Kontribusi Cerita Baru
            </h1>
            <p className="text-sm text-muted-foreground">
              Bagikan cerita sejarah, legenda, atau budaya dari daerahmu.
            </p>
          </div>
        </div>

        {/* Info box */}
        <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 size-5 shrink-0 text-blue-600" />
            <div className="text-sm">
              <p className="mb-1 font-medium text-blue-900">
                Proses Kontribusi
              </p>
              <ol className="ml-4 list-decimal space-y-0.5 text-blue-800">
                <li>Isi form kontribusi dengan lengkap</li>
                <li>Kirim → status <strong>PENDING</strong></li>
                <li>Moderator akan mereview dalam 1-3 hari</li>
                <li>
                  Kalau disetujui → dipublikasikan di peta + dapat{" "}
                  <strong>+50 poin</strong>
                </li>
                <li>Kalau ditolak → Anda dapat alasan & bisa edit ulang</li>
              </ol>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <ContributionForm categories={categories} />
    </div>
  );
}