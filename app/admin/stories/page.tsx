import Link from "next/link";
import { BookOpen, Eye, MapPin, ExternalLink } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StoryActionsMenu } from "@/components/admin/StoryActionsMenu";
import { formatDate, formatNumber } from "@/lib/utils";

export const metadata = {
  title: "Kelola Cerita",
};

export default async function AdminStoriesPage() {
  const [stories, totalCount] = await Promise.all([
    prisma.story.findMany({
      where: { status: "PUBLISHED" },
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        title: true,
        slug: true,
        synopsis: true,
        heroImage: true,
        viewCount: true,
        city: true,
        province: true,
        createdAt: true,
        category: {
          select: { name: true, color: true },
        },
        author: {
          select: { username: true, name: true },
        },
        _count: {
          select: { savedBy: true, reports: true },
        },
      },
    }),
    prisma.story.count({ where: { status: "PUBLISHED" } }),
  ]);

  return (
    <div className="container py-6">
      <div className="">
        <h1 className="font-serif text-2xl font-bold md:text-3xl">
          Kelola Cerita
        </h1>
        <p className="text-sm text-muted-foreground">
          {totalCount} cerita dipublikasikan
        </p>
      </div>

      {stories.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BookOpen className="mb-3 size-12 text-muted-foreground/50" />
            <p className="mb-1 font-semibold">Belum ada cerita</p>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              Cerita akan muncul setelah ada kontribusi yang disetujui.
            </p>
            <Button asChild variant="outline">
              <Link href="/admin">Kembali ke Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {stories.map((story) => {
            const location = [story.city, story.province]
              .filter(Boolean)
              .join(", ");

            return (
              <Card key={story.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
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
                          <BookOpen
                            className="size-6"
                            style={{
                              color: story.category?.color ?? undefined,
                            }}
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
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
                        <span className="text-xs text-muted-foreground">
                          {formatDate(story.createdAt)}
                        </span>
                      </div>

                      <h3 className="mb-1 truncate font-semibold">
                        <Link
                          href={`/story/${story.slug}`}
                          target="_blank"
                          className="hover:text-primary"
                        >
                          {story.title}
                        </Link>
                      </h3>

                      <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>oleh @{story.author.username}</span>
                        {location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="size-3" />
                            {location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Eye className="size-3" />
                          {formatNumber(story.viewCount)} views
                        </span>
                        <span>💾 {story._count.savedBy} disimpan</span>
                        {story._count.reports > 0 && (
                          <span className="text-destructive">
                            ⚠️ {story._count.reports} laporan
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="size-8"
                      >
                        <Link
                          href={`/story/${story.slug}`}
                          target="_blank"
                          aria-label="Lihat cerita"
                        >
                          <ExternalLink className="size-4" />
                        </Link>
                      </Button>
                      <StoryActionsMenu
                        storyId={story.id}
                        storySlug={story.slug}
                        storyTitle={story.title}
                      />
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