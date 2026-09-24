import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, MapPin, Calendar, BookOpen, User } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { estimateReadingTime } from "@/lib/utils";
import { StoryDetailClient } from "./StoryDetailClient";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const story = await prisma.story.findUnique({
    where: { slug },
    select: { title: true, synopsis: true, heroImage: true },
  });

  if (!story) return { title: "Cerita tidak ditemukan" };

  return {
    title: story.title,
    description: story.synopsis,
    openGraph: {
      title: story.title,
      description: story.synopsis,
      images: story.heroImage ? [story.heroImage] : undefined,
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: story.title,
      description: story.synopsis,
      images: story.heroImage ? [story.heroImage] : undefined,
    },
  };
}

export default async function StoryDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const story = await prisma.story.findUnique({
    where: { slug },
    select: {
      id: true,
      title: true,
      slug: true,
      synopsis: true,
      content: true,
      heroImage: true,
      latitude: true,
      longitude: true,
      city: true,
      province: true,
      period: true,
      source: true,
      status: true,
      viewCount: true,
      createdAt: true,
      category: {
        select: { id: true, name: true, slug: true, icon: true, color: true },
      },
      author: {
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          points: true,
        },
      },
    },
  });

  if (!story || story.status !== "PUBLISHED") {
    notFound();
  }

  const session = await auth();
  let initialSaved = false;

  if (session?.user) {
    const savedRecord = await prisma.savedStory.findUnique({
      where: {
        userId_storyId: {
          userId: session.user.id,
          storyId: story.id,
        },
      },
      select: { id: true },
    });
    initialSaved = !!savedRecord;
  }

  const isOwner = session?.user?.id === story.author.id;
  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "MODERATOR";

  const readingTime = estimateReadingTime(story.content);
  const location = [story.city, story.province].filter(Boolean).join(", ");

  return (
    <article className="relative min-h-[calc(100vh-3.5rem)] bg-background">
      <div className="relative w-full md:grid md:grid-cols-2 md:gap-0">
        <div className="order-2 px-4 py-6 md:order-1 md:px-10 md:py-10 lg:px-16 lg:py-12">
          <Link
            href="/"
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground md:mb-6"
          >
            <ArrowLeft className="size-4" />
            Kembali ke peta
          </Link>

          {story.category && (
            <Badge
              variant="secondary"
              className="mb-3"
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

          <h1 className="mb-3 font-serif text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
            {story.title}
          </h1>

          <p className="mb-5 text-base italic text-muted-foreground md:text-lg">
            {story.synopsis}
          </p>

          <div className="mb-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3.5" />
                {location}
              </span>
            )}
            {story.period && (
              <span className="flex items-center gap-1">
                <Calendar className="size-3.5" />
                {story.period}
              </span>
            )}
            <span className="flex items-center gap-1">
              <BookOpen className="size-3.5" />
              {readingTime} menit baca
            </span>
          </div>

          <Separator className="mb-5" />

          <div className="prose prose-slate max-w-none dark:prose-invert">
            {story.content.split("\n\n").map((paragraph, i) => (
              <p key={i} className="mb-4 leading-relaxed text-foreground/90">
                {paragraph}
              </p>
            ))}
          </div>

          {story.source && (
            <div className="mt-8 rounded-lg border border-border bg-muted/40 p-4">
              <p className="mb-1 text-xs font-semibold text-muted-foreground">
                SUMBER / REFERENSI
              </p>
              <p className="text-sm text-foreground/80">{story.source}</p>
            </div>
          )}

          <div className="mt-8 flex items-center gap-3 rounded-lg border border-border p-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              {story.author.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={story.author.avatar}
                  alt={story.author.name ?? ""}
                  className="size-10 rounded-full object-cover"
                />
              ) : (
                <User className="size-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold">
                {story.author.name ?? story.author.username}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                @{story.author.username}
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/profile`}>Lihat Profil</Link>
            </Button>
          </div>

          <StoryDetailClient
            storyId={story.id}
            storySlug={story.slug}
            storyTitle={story.title}
            content={story.content}
            heroImage={story.heroImage}
            initialSaved={initialSaved}
            isOwner={isOwner}
            isAdmin={isAdmin}
            category={
              story.category
                ? { name: story.category.name, color: story.category.color }
                : null
            }
          />
        </div>

        <div className="order-1 md:order-2 md:sticky md:top-14 md:h-[calc(100vh-3.5rem)] md:overflow-hidden">
          {story.heroImage ? (
            <div className="relative h-64 w-full overflow-hidden bg-muted md:h-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={story.heroImage}
                alt={story.title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-primary/10 via-background to-primary/5 md:h-full">
              <div className="text-center">
                <BookOpen className="mx-auto mb-2 size-12 text-primary/40" />
                <p className="text-sm font-medium text-muted-foreground">
                  {story.title}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}