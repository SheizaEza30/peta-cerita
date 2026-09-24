"use client";

import { User, Star, BookOpen, Bookmark, Award } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";

type ProfileHeaderProps = {
  name: string | null;
  username: string;
  avatar: string | null;
  bio: string | null;
  role: "USER" | "MODERATOR" | "ADMIN";
  points: number;
  stats: {
    stories: number;
    contributions: number;
    saved: number;
    achievements: number;
    history: number;
  };
};

const ROLE_LABELS = {
  USER: { label: "Kontributor", color: "bg-blue-100 text-blue-700" },
  MODERATOR: { label: "Moderator", color: "bg-purple-100 text-purple-700" },
  ADMIN: { label: "Admin", color: "bg-red-100 text-red-700" },
};

export function ProfileHeader({
  name,
  username,
  avatar,
  bio,
  role,
  points,
  stats,
}: ProfileHeaderProps) {
  const roleInfo = ROLE_LABELS[role];

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Cover gradient */}
      <div className="h-24 bg-gradient-to-r from-primary/30 via-primary/20 to-primary/10 md:h-32" />

      {/* Content */}
      <div className="px-5 pb-5 md:px-6 md:pb-6">
        {/* Avatar + Role — overlap cover */}
        <div className="-mt-12 mb-4 flex items-end justify-between md:-mt-14">
          <div className="flex size-24 items-center justify-center rounded-full border-4 border-background bg-primary text-primary-foreground md:size-28">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatar}
                alt={name ?? username}
                className="size-full rounded-full object-cover"
              />
            ) : (
              <User className="size-10 md:size-12" />
            )}
          </div>

          <Badge className={`${roleInfo.color} border-0`}>
            {roleInfo.label}
          </Badge>
        </div>

        {/* Name + Username */}
        <div className="mb-3">
          <h1 className="font-serif text-xl font-bold leading-tight md:text-2xl">
            {name ?? username}
          </h1>
          <p className="text-sm text-muted-foreground">@{username}</p>
        </div>

        {/* Bio */}
        {bio && (
          <p className="mb-4 text-sm text-foreground/80 md:max-w-2xl">{bio}</p>
        )}

        {/* Points + Stats grid */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          <StatCard
            icon={Star}
            label="Poin"
            value={formatNumber(points)}
            highlight
          />
          <StatCard
            icon={BookOpen}
            label="Cerita"
            value={formatNumber(stats.stories)}
          />
          <StatCard
            icon={BookOpen}
            label="Kontribusi"
            value={formatNumber(stats.contributions)}
          />
          <StatCard
            icon={Bookmark}
            label="Disimpan"
            value={formatNumber(stats.saved)}
          />
          <StatCard
            icon={Award}
            label="Achievement"
            value={formatNumber(stats.achievements)}
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`rounded-xl border p-3 ${
        highlight
          ? "border-primary/30 bg-primary/5"
          : "border-border bg-muted/30"
      }`}
    >
      <div className="mb-1 flex items-center gap-1.5">
        <Icon
          className={`size-3.5 ${
            highlight ? "text-primary" : "text-muted-foreground"
          }`}
        />
        <span
          className={`text-[10px] font-medium uppercase tracking-wider ${
            highlight ? "text-primary" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
      </div>
      <p className="text-lg font-bold md:text-xl">{value}</p>
    </div>
  );
}