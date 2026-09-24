import { Suspense } from "react";
import Link from "next/link";
import { Inbox } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { ContributionReviewCard } from "@/components/admin/ContributionReviewCard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Moderasi Kontribusi",
};

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const TABS = [
  { value: "PENDING", label: "Menunggu Review" },
  { value: "APPROVED", label: "Disetujui" },
  { value: "REJECTED", label: "Ditolak" },
  { value: "ALL", label: "Semua" },
];

export default async function AdminContributionsPage({
  searchParams,
}: PageProps) {
  const { status: statusParam } = await searchParams;
  const activeTab = statusParam?.toUpperCase() || "PENDING";

  // Build where clause
  const where =
    activeTab === "ALL" ? {} : { status: activeTab as "PENDING" | "APPROVED" | "REJECTED" };

  // Query kontribusi + counts per status
  const [contributions, counts, categories] = await Promise.all([
    prisma.contribution.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
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
    }),
    prisma.contribution.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.category.findMany({
      select: { id: true, name: true, color: true },
    }),
  ]);

  // Format counts
  const statusCounts: Record<string, number> = {
    PENDING: 0,
    APPROVED: 0,
    REJECTED: 0,
    DRAFT: 0,
  };
  let totalAll = 0;
  for (const row of counts) {
    statusCounts[row.status] = row._count._all;
    totalAll += row._count._all;
  }

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold md:text-3xl">
          Moderasi Kontribusi
        </h1>
        <p className="text-sm text-muted-foreground">
          Review kontribusi dari komunitas sebelum dipublikasikan
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count =
            tab.value === "ALL" ? totalAll : statusCounts[tab.value] || 0;

          return (
            <Link
              key={tab.value}
              href={`/admin/contributions?status=${tab.value}`}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Content */}
      <Suspense fallback={null}>
        {contributions.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Inbox className="mb-3 size-12 text-muted-foreground/50" />
              <p className="mb-1 font-semibold">
                {activeTab === "PENDING"
                  ? "Tidak ada kontribusi yang menunggu"
                  : `Tidak ada kontribusi ${activeTab.toLowerCase()}`}
              </p>
              <p className="mb-4 max-w-md text-sm text-muted-foreground">
                {activeTab === "PENDING"
                  ? "Semua kontribusi sudah direview. Kerja bagus! 🎉"
                  : "Belum ada kontribusi dengan status ini."}
              </p>
              <Button asChild variant="outline">
                <Link href="/admin">Kembali ke Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {contributions.map((contribution) => {
              const data = contribution.submissionData as {
                categoryId?: string;
              };
              const category = data.categoryId
                ? categoryMap.get(data.categoryId)
                : undefined;

              return (
                <ContributionReviewCard
                  key={contribution.id}
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
              );
            })}
          </div>
        )}
      </Suspense>
    </div>
  );
}