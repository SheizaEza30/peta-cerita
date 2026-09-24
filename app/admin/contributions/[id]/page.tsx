import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { ContributionReviewCard } from "@/components/admin/ContributionReviewCard";

export const metadata = {
  title: "Detail Kontribusi",
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function AdminContributionDetailPage({
  params,
}: PageProps) {
  const { id } = await params;

  const contribution = await prisma.contribution.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      submissionData: true,
      rejectionReason: true,
      reviewedAt: true,
      createdAt: true,
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      story: {
        select: { id: true, slug: true, status: true },
      },
      reviewer: {
        select: { id: true, username: true, name: true },
      },
    },
  });

  if (!contribution) {
    notFound();
  }

  // Ambil kategori
  const data = contribution.submissionData as { categoryId?: string };
  const category = data.categoryId
    ? await prisma.category.findUnique({
        where: { id: data.categoryId },
        select: { name: true, color: true },
      })
    : null;

  return (
    <div className="container max-w-3xl py-6">
      {/* Back */}
      <Link
        href="/admin/contributions"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke antrean
      </Link>

      <h1 className="mb-6 font-serif text-2xl font-bold">
        Detail Kontribusi
      </h1>

      <ContributionReviewCard
        contribution={{
          id: contribution.id,
          status: contribution.status,
          submissionData: contribution.submissionData as never,
          rejectionReason: contribution.rejectionReason,
          reviewedAt: contribution.reviewedAt?.toISOString() ?? null,
          createdAt: contribution.createdAt.toISOString(),
          user: {
            id: contribution.user.id,
            username: contribution.user.username,
            name: contribution.user.name,
            email: contribution.user.email,
            avatar: contribution.user.avatar,
          },
          story: contribution.story,
          reviewer: contribution.reviewer,
        }}
        categoryName={category?.name}
        categoryColor={category?.color ?? undefined}
      />
    </div>
  );
}