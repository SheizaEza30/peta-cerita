"use client";

import Link from "next/link";
import { MapPin, BookOpen, Clock, Eye } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { estimateReadingTime, formatNumber } from "@/lib/utils";
import type { StoryListItem } from "@/hooks/useStories";

type StoryCardProps = {
  story: StoryListItem;
};

export function StoryCard({ story }: StoryCardProps) {
  const location = [story.city, story.province].filter(Boolean).join(", ");
  const readingTime = estimateReadingTime(story.synopsis ?? "");

  return (
    <Link href={`/story/${story.slug}`} className="group block">
      <Card className="story-card h-full overflow-hidden">
        {/* Hero */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
          {story.heroImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={story.heroImage}
              alt={story.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center"
              style={{
                background: story.category?.color
                  ? `linear-gradient(135deg, ${story.category.color}30, ${story.category.color}10)`
                  : "linear-gradient(135deg, #1f9d6930, #1f9d6910)",
              }}
            >
              <BookOpen
                className="size-12"
                style={{ color: story.category?.color ?? "#1f9d69" }}
              />
            </div>
          )}

          {/* Category badge */}
          {story.category && (
            <Badge
              className="absolute left-3 top-3 border-0 shadow-sm"
              style={{
                backgroundColor: story.category.color ?? "#1f9d69",
                color: "white",
              }}
            >
              {story.category.name}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="mb-2 line-clamp-2 font-serif text-base font-bold leading-tight transition-colors group-hover:text-primary">
            {story.title}
          </h3>

          <p className="mb-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {story.synopsis}
          </p>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            {location && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3" />
                <span className="line-clamp-1">{location}</span>
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="size-3" />
              {readingTime} min
            </span>
            {story.viewCount > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="size-3" />
                {formatNumber(story.viewCount)}
              </span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}