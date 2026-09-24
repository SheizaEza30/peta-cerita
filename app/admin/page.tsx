import Link from "next/link";
import {
  Users,
  BookOpen,
  FileText,
  Flag,
  Clock,
  CheckCircle2,
  XCircle,
  TrendingUp,
  ArrowRight,
} from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminDashboardPage() {
  // Query paralel
  const [
    totalUsers,
    totalStories,
    totalContributions,
    pendingContributions,
    approvedContributions,
    rejectedContributions,
    openReports,
    recentPending,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.story.count({ where: { status: "PUBLISHED" } }),
    prisma.contribution.count(),
    prisma.contribution.count({ where: { status: "PENDING" } }),
    prisma.contribution.count({ where: { status: "APPROVED" } }),
    prisma.contribution.count({ where: { status: "REJECTED" } }),
    prisma.report.count({ where: { status: "OPEN" } }),
    prisma.contribution.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 5,
      select: {
        id: true,
        createdAt: true,
        submissionData: true,
        user: {
          select: { username: true, name: true, avatar: true },
        },
      },
    }),
  ]);

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold md:text-3xl">
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Ringkasan aktivitas platform Peta Cerita
        </p>
      </div>

      {/* Stat cards grid */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          label="Total Pengguna"
          value={totalUsers}
          color="text-blue-600"
        />
        <StatCard
          icon={BookOpen}
          label="Cerita Published"
          value={totalStories}
          color="text-green-600"
        />
        <StatCard
          icon={Clock}
          label="Menunggu Review"
          value={pendingContributions}
          color="text-yellow-600"
          highlight={pendingContributions > 0}
        />
        <StatCard
          icon={Flag}
          label="Laporan Terbuka"
          value={openReports}
          color="text-red-600"
          highlight={openReports > 0}
        />
      </div>

      {/* Second row */}
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={FileText}
          label="Total Kontribusi"
          value={totalContributions}
          color="text-muted-foreground"
        />
        <StatCard
          icon={CheckCircle2}
          label="Disetujui"
          value={approvedContributions}
          color="text-green-600"
        />
        <StatCard
          icon={XCircle}
          label="Ditolak"
          value={rejectedContributions}
          color="text-red-600"
        />
      </div>

      {/* Pending contributions */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Menunggu Review</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/contributions?status=PENDING">
              Lihat Semua
              <ArrowRight className="size-3.5 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentPending.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CheckCircle2 className="mb-2 size-10 text-green-500/50" />
              <p className="text-sm font-medium">Tidak ada yang menunggu</p>
              <p className="text-xs text-muted-foreground">
                Semua kontribusi sudah direview
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentPending.map((c) => {
                const data = c.submissionData as { title?: string };
                return (
                  <Link
                    key={c.id}
                    href={`/admin/contributions/${c.id}`}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {data.title ?? "Tanpa Judul"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        oleh @{c.user.username} · {formatDate(c.createdAt)}
                      </p>
                    </div>
                    <Badge className="shrink-0 bg-yellow-100 text-yellow-700 border-0">
                      PENDING
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4" />
              Statistik Kontribusi
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <ProgressRow
              label="Disetujui"
              value={approvedContributions}
              total={totalContributions}
              color="bg-green-500"
            />
            <ProgressRow
              label="Menunggu"
              value={pendingContributions}
              total={totalContributions}
              color="bg-yellow-500"
            />
            <ProgressRow
              label="Ditolak"
              value={rejectedContributions}
              total={totalContributions}
              color="bg-red-500"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Aksi Cepat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              asChild
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/contributions?status=PENDING">
                <Clock className="size-4 mr-2" />
                Review Kontribusi ({pendingContributions})
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/reports?status=OPEN">
                <Flag className="size-4 mr-2" />
                Tangani Laporan ({openReports})
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="w-full justify-start"
            >
              <Link href="/admin/users">
                <Users className="size-4 mr-2" />
                Kelola Pengguna ({totalUsers})
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ============================================
// COMPONENTS
// ============================================
function StatCard({
  icon: Icon,
  label,
  value,
  color,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  highlight?: boolean;
}) {
  return (
    <Card className={highlight ? "border-yellow-300 bg-yellow-50/50" : ""}>
      <CardContent className="p-4">
        <div className="mb-2 flex items-center gap-2">
          <Icon className={`size-4 ${color}`} />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
        </div>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function ProgressRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {value} / {total} ({percent}%)
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full transition-all ${color}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}