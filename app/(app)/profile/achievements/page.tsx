import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Trophy,
  Award,
  Lock,
  CheckCircle2,
  Compass,
  Star,
} from "lucide-react";

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
  title: "Achievement",
};

export default async function AchievementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/profile/achievements");

  const [user, achievements, userAchievements] = await Promise.all([
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
    prisma.achievement.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        requirement: true,
        points: true,
      },
    }),
    prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      select: {
        achievementId: true,
        unlockedAt: true,
      },
    }),
  ]);

  if (!user) redirect("/login");

  // Map unlocked
  const unlockedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
  );

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;
  const overallProgress =
    totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

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

      {/* Header + overall progress */}
      <div className="mt-6 mb-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Achievement</h2>
          <Badge variant="secondary">
            {unlockedCount} / {totalCount} terbuka
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Progres keseluruhan</span>
            <span className="font-medium">{overallProgress}%</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </div>

      {/* Achievement grid */}
      {achievements.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Trophy className="mb-3 size-10 text-muted-foreground/50" />
            <p className="mb-1 font-semibold">Belum ada achievement</p>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              Achievement akan muncul setelah admin mengonfigurasinya.
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
        <div className="grid gap-3 md:grid-cols-2">
          {achievements.map((ach) => {
            const unlockedAt = unlockedMap.get(ach.id);
            const isUnlocked = !!unlockedAt;

            return (
              <Card
                key={ach.id}
                className={
                  isUnlocked
                    ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
                    : "opacity-75"
                }
              >
                <CardContent className="flex items-start gap-3 p-4">
                  {/* Icon */}
                  <div
                    className={`flex size-12 shrink-0 items-center justify-center rounded-full ${
                      isUnlocked
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isUnlocked ? (
                      <Trophy className="size-6" />
                    ) : (
                      <Lock className="size-5" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="text-sm font-semibold">{ach.name}</h3>
                      {isUnlocked && (
                        <CheckCircle2 className="size-4 text-primary" />
                      )}
                    </div>

                    <p className="mb-2 text-xs text-muted-foreground">
                      {ach.description}
                    </p>

                    {/* Points */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Star className="size-3" />
                        +{ach.points} poin
                      </span>

                      {isUnlocked && unlockedAt && (
                        <span className="text-primary">
                          {formatDate(unlockedAt)}
                        </span>
                      )}
                      {!isUnlocked && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] bg-muted"
                        >
                          Belum terbuka
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Info */}
      {unlockedCount === 0 && achievements.length > 0 && (
        <Card className="mt-4 border-dashed">
          <CardContent className="flex items-start gap-3 p-4">
            <Award className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
            <div>
              <p className="mb-1 text-sm font-semibold">
                Cara membuka achievement
              </p>
              <p className="text-xs text-muted-foreground">
                Kirim kontribusi cerita dan dapatkan persetujuan dari moderator
                untuk membuka achievement pertama kamu.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}