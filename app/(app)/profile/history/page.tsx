import { redirect } from "next/navigation";
import Link from "next/link";
import { History, MapPin, Compass, Clock } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Riwayat Baca",
};

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/profile/history");

  const [user, history] = await Promise.all([
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
    prisma.readingHistory.findMany({
      where: { userId: session.user.id },
      orderBy: { lastReadAt: "desc" },
      select: {
        id: true,
        progress: true,
        completed: true,
        lastReadAt: true,
        story: {
          select: {
            id: true,
            title: true,
            slug: true,
            synopsis: true,
            heroImage: true,
            city: true,
            province: true,
            category: {
              select: { name: true, color: true },
            },
          },
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

      <div className="mt-6 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Riwayat Baca</h2>
        <span className="text-sm text-muted-foreground">
          {history.length} cerita
        </span>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <History className="mb-3 size-10 text-muted-foreground/50" />
            <p className="mb-1 font-semibold">Belum ada riwayat baca</p>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              Mulai baca cerita dari peta dan riwayatmu akan muncul di sini.
            </p>
            <Button asChild>
              <Link href="/">
                <Compass className="size-4 mr-2" />
                Jelajahi Peta
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((item) => {
            const story = item.story;
            const location = [story.city, story.province]
              .filter(Boolean)
              .join(", ");

            return (
              <Card key={item.id}>
                <CardContent className="p-0">
                  <div className="flex gap-3 p-4">
                    <div className="size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {story.heroImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={story.heroImage}
                          alt={story.title}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div
                          className="flex size-full items-center justify-center"
                          style={{
                            background: story.category?.color
                              ? `${story.category.color}20`
                              : undefined,
                          }}
                        >
                          <History
                            className="size-6"
                            style={{
                              color: story.category?.color ?? undefined,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        {story.category && (
                          <Badge
                            variant="secondary"
                            className="text-[10px]"
                            style={
                              story.category.color
                                ? {
                                    backgroundColor: `${story.category.color}20`,
                                    color: story.category.color,
                                    borderColor: `${story.category.color}40`,
                                  }
                                : undefined
                            }
                          >
                            {story.category.name}
                          </Badge>
                        )}
                        {item.completed && (
                          <Badge className="bg-green-100 text-green-700 border-0 text-[10px]">
                            Selesai
                          </Badge>
                        )}
                      </div>

                      <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-tight">
                        <Link
                          href={`/story/${story.slug}`}
                          className="hover:text-primary"
                        >
                          {story.title}
                        </Link>
                      </h3>

                      {location && (
                        <p className="mb-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {location}
                        </p>
                      )}

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                          <span>Progress</span>
                          <span className="font-medium">{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="h-1.5" />
                      </div>

                      <p className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground/70">
                        <Clock className="size-3" />
                        Terakhir dibaca {formatDate(item.lastReadAt)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border px-4 py-2">
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link href={`/story/${story.slug}`}>
                        {item.completed ? "Baca Ulang" : "Lanjutkan Baca"}
                      </Link>
                    </Button>
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