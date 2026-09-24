import { redirect } from "next/navigation";
import Link from "next/link";
import { Bookmark, MapPin, Compass } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Cerita Disimpan",
};

export default async function SavedPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/profile/saved");

  const [user, savedStories] = await Promise.all([
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
    prisma.savedStory.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        createdAt: true,
        story: {
          select: {
            id: true,
            title: true,
            slug: true,
            synopsis: true,
            heroImage: true,
            city: true,
            province: true,
            status: true,
            category: {
              select: { name: true, slug: true, color: true },
            },
            author: {
              select: { id: true, username: true, name: true },
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

      {/* Header */}
      <div className="mt-6 mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Cerita Disimpan</h2>
        <span className="text-sm text-muted-foreground">
          {savedStories.length} cerita
        </span>
      </div>

      {/* Empty state */}
      {savedStories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Bookmark className="mb-3 size-10 text-muted-foreground/50" />
            <p className="mb-1 font-semibold">Belum ada cerita yang disimpan</p>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              Jelajahi peta dan simpan cerita yang ingin kamu baca nanti.
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
          {savedStories.map((item) => {
            const story = item.story;
            const location = [story.city, story.province]
              .filter(Boolean)
              .join(", ");

            return (
              <Card key={item.id} className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-3 p-4">
                    {/* Hero */}
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
                          <Bookmark
                            className="size-6"
                            style={{
                              color: story.category?.color ?? undefined,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      {story.category && (
                        <Badge
                          variant="secondary"
                          className="mb-1 text-[10px]"
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

                      <h3 className="mb-1 line-clamp-2 text-sm font-semibold leading-tight">
                        <Link
                          href={`/story/${story.slug}`}
                          className="hover:text-primary"
                        >
                          {story.title}
                        </Link>
                      </h3>

                      {location && (
                        <p className="mb-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="size-3" />
                          {location}
                        </p>
                      )}

                      <p className="text-xs text-muted-foreground/70">
                        Disimpan {formatDate(item.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-border px-4 py-2">
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link href={`/story/${story.slug}`}>Baca Cerita</Link>
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