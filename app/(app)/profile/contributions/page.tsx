import { redirect } from "next/navigation";
import Link from "next/link";
import { PlusCircle, FileText, Clock, CheckCircle2, XCircle } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Kontribusi Saya",
};

const STATUS_CONFIG = {
  DRAFT: {
    label: "Draft",
    icon: FileText,
    className: "bg-gray-100 text-gray-700",
  },
  PENDING: {
    label: "Menunggu Review",
    icon: Clock,
    className: "bg-yellow-100 text-yellow-700",
  },
  APPROVED: {
    label: "Disetujui",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-700",
  },
  REJECTED: {
    label: "Ditolak",
    icon: XCircle,
    className: "bg-red-100 text-red-700",
  },
};

export default async function ContributionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/profile/contributions");

  const [user, contributions] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        username: true,
        avatar: true,
        bio: true,
        role: true,
        points: true,
        _count: {
          select: {
            stories: true,
            contributions: true,
            savedStories: true,
            readingHistories: true,
            userAchievements: true,
          },
        },
      },
    }),
    prisma.contribution.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        submissionData: true,
        rejectionReason: true,
        reviewedAt: true,
        createdAt: true,
        story: {
          select: { id: true, title: true, slug: true, status: true },
        },
      },
    }),
  ]);

  if (!user) redirect("/login");

  return (
    <div className="container max-w-5xl py-6">
      <ProfileHeader
        name={user.name}
        username={user.username}
        avatar={user.avatar}
        bio={user.bio}
        role={user.role}
        points={user.points}
        stats={{
          stories: user._count.stories,
          contributions: user._count.contributions,
          saved: user._count.savedStories,
          achievements: user._count.userAchievements,
          history: user._count.readingHistories,
        }}
      />

      <div className="mt-4">
        <ProfileTabs />
      </div>

      {/* Header actions */}
      <div className="mt-6 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Kontribusi Saya</h2>
        <Button asChild size="sm">
          <Link href="/contribute">
            <PlusCircle className="size-4 mr-2" />
            Kontribusi Baru
          </Link>
        </Button>
      </div>

      {/* Empty state */}
      {contributions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-3 size-10 text-muted-foreground/50" />
            <p className="mb-1 font-semibold">Belum ada kontribusi</p>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              Mulai ceritakan sejarah atau budaya dari daerahmu dan bagikan ke
              seluruh Indonesia.
            </p>
            <Button asChild>
              <Link href="/contribute">
                <PlusCircle className="size-4 mr-2" />
                Mulai Berkontribusi
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {contributions.map((c) => {
            const data = c.submissionData as {
              title?: string;
              synopsis?: string;
            };
            const config =
              STATUS_CONFIG[c.status as keyof typeof STATUS_CONFIG];
            const Icon = config.icon;

            return (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge className={`${config.className} border-0`}>
                          <Icon className="size-3 mr-1" />
                          {config.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(c.createdAt)}
                        </span>
                      </div>
                      <h3 className="mb-1 truncate font-semibold">
                        {data.title ?? "Tanpa Judul"}
                      </h3>
                      {data.synopsis && (
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {data.synopsis}
                        </p>
                      )}

                      {/* Rejection reason */}
                      {c.status === "REJECTED" && c.rejectionReason && (
                        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm">
                          <p className="mb-1 font-medium text-red-800">
                            Alasan ditolak:
                          </p>
                          <p className="text-red-700">{c.rejectionReason}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      {c.story && (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/story/${c.story.slug}`}>Lihat</Link>
                        </Button>
                      )}
                      {(c.status === "REJECTED" ||
                        c.status === "DRAFT") && (
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/contribute/${c.id}/edit`}
                          >
                            Edit
                          </Link>
                        </Button>
                      )}
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