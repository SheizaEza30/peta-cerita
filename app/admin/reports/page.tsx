import Link from "next/link";
import { Flag, ExternalLink, AlertCircle } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { REPORT_REASONS } from "@/lib/constants";

export const metadata = {
  title: "Laporan Cerita",
};

type PageProps = {
  searchParams: Promise<{ status?: string }>;
};

const TABS = [
  { value: "OPEN", label: "Terbuka" },
  { value: "REVIEWING", label: "Ditinjau" },
  { value: "RESOLVED", label: "Selesai" },
  { value: "DISMISSED", label: "Ditolak" },
  { value: "ALL", label: "Semua" },
];

const STATUS_CONFIG = {
  OPEN: {
    label: "Terbuka",
    color: "bg-red-100 text-red-700",
  },
  REVIEWING: {
    label: "Ditinjau",
    color: "bg-yellow-100 text-yellow-700",
  },
  RESOLVED: {
    label: "Selesai",
    color: "bg-green-100 text-green-700",
  },
  DISMISSED: {
    label: "Ditolak",
    color: "bg-gray-100 text-gray-700",
  },
} as const;

// Reason map — di luar function, dipakai sebagai lookup
const REASON_MAP = new Map<string, string>(
  REPORT_REASONS.map((r) => [String(r.value), String(r.label)])
);

export default async function AdminReportsPage({ searchParams }: PageProps) {
  const { status: statusParam } = await searchParams;
  const activeTab = statusParam?.toUpperCase() || "OPEN";

  const where =
    activeTab === "ALL"
      ? {}
      : { status: activeTab as "OPEN" | "REVIEWING" | "RESOLVED" | "DISMISSED" };

  const [reports, counts] = await Promise.all([
    prisma.report.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        reason: true,
        description: true,
        status: true,
        reviewedAt: true,
        createdAt: true,
        user: {
          select: { id: true, username: true, name: true, avatar: true },
        },
        story: {
          select: {
            id: true,
            title: true,
            slug: true,
            heroImage: true,
          },
        },
        reviewer: {
          select: { id: true, username: true, name: true },
        },
      },
    }),
    prisma.report.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
  ]);

  const statusCounts: Record<string, number> = {
    OPEN: 0,
    REVIEWING: 0,
    RESOLVED: 0,
    DISMISSED: 0,
  };
  let totalAll = 0;
  for (const row of counts) {
    statusCounts[row.status] = row._count._all;
    totalAll += row._count._all;
  }

  return (
    <div className="container py-6">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold md:text-3xl">
          Laporan Cerita
        </h1>
        <p className="text-sm text-muted-foreground">
          Review laporan dari pengguna tentang cerita yang bermasalah
        </p>
      </div>

      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.value;
          const count =
            tab.value === "ALL" ? totalAll : statusCounts[tab.value] || 0;

          return (
            <Link
              key={tab.value}
              href={`/admin/reports?status=${tab.value}`}
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

      {reports.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Flag className="mb-3 size-12 text-muted-foreground/50" />
            <p className="mb-1 font-semibold">
              {activeTab === "OPEN"
                ? "Tidak ada laporan terbuka"
                : `Tidak ada laporan dengan status ${activeTab.toLowerCase()}`}
            </p>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              {activeTab === "OPEN"
                ? "Semua laporan sudah ditangani. Kerja bagus! 🎉"
                : "Belum ada laporan di kategori ini."}
            </p>
            <Button asChild variant="outline">
              <Link href="/admin">Kembali ke Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const config =
              STATUS_CONFIG[report.status as keyof typeof STATUS_CONFIG];
            const reasonLabel =
              REASON_MAP.get(report.reason) ?? report.reason;

            return (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-1 gap-3">
                      <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                        {report.story.heroImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={report.story.heroImage}
                            alt={report.story.title}
                            className="size-full object-cover"
                          />
                        ) : (
                          <div className="flex size-full items-center justify-center text-muted-foreground">
                            <Flag className="size-6" />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <Badge className={`${config.color} border-0`}>
                            {config.label}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {reasonLabel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(report.createdAt)}
                          </span>
                        </div>

                        <h3 className="mb-1 truncate text-sm font-semibold">
                          {report.story.title}
                        </h3>

                        {report.description && (
                          <p className="mb-2 line-clamp-2 text-xs text-muted-foreground">
                            &ldquo;{report.description}&rdquo;
                          </p>
                        )}

                        <p className="text-xs text-muted-foreground">
                          Dilaporkan oleh{" "}
                          <span className="font-medium">
                            @{report.user.username}
                          </span>
                          {report.user.name && ` (${report.user.name})`}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/story/${report.story.slug}`}>
                          <ExternalLink className="size-3.5 mr-1.5" />
                          Lihat Cerita
                        </Link>
                      </Button>
                      <Button asChild size="sm">
                        <Link href={`/admin/reports/${report.id}`}>
                          Tangani
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}