import { redirect } from "next/navigation";
import Link from "next/link";
import { BookOpen, Bookmark, PlusCircle, Sparkles } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata = {
  title: "Profil",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/profile");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      avatar: true,
      bio: true,
      role: true,
      points: true,
      createdAt: true,
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
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="container max-w-5xl py-6">
      {/* Header */}
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

      {/* Tabs */}
      <div className="mt-4">
        <ProfileTabs />
      </div>

      {/* Overview Content */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {/* Card: Kontribusi */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Kontribusi Kamu</h3>
              <BookOpen className="size-4 text-muted-foreground" />
            </div>
            <p className="mb-4 text-3xl font-bold">
              {user._count.contributions}
            </p>
            <p className="mb-4 text-sm text-muted-foreground">
              {user._count.contributions > 0
                ? "Terima kasih sudah berbagi cerita!"
                : "Belum ada kontribusi. Mulai bagikan cerita daerahmu."}
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/profile/contributions">
                Lihat Semua Kontribusi
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card: Disimpan */}
        <Card>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Cerita Disimpan</h3>
              <Bookmark className="size-4 text-muted-foreground" />
            </div>
            <p className="mb-4 text-3xl font-bold">{user._count.savedStories}</p>
            <p className="mb-4 text-sm text-muted-foreground">
              {user._count.savedStories > 0
                ? "Cerita yang kamu simpan untuk dibaca nanti."
                : "Belum ada cerita yang disimpan."}
            </p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link href="/profile/saved">Lihat Cerita Disimpan</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Card: Kontribusi Baru */}
        <Card className="md:col-span-2 border-primary/30 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="flex flex-col items-start gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="mb-1 font-semibold">Bagikan Cerita Baru</h3>
                <p className="text-sm text-muted-foreground">
                  Punya cerita sejarah, legenda, atau budaya daerah? Bagikan ke
                  seluruh Indonesia.
                </p>
              </div>
            </div>
            <Button asChild className="shrink-0">
              <Link href="/contribute">
                <PlusCircle className="size-4 mr-2" />
                Kontribusi Baru
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}