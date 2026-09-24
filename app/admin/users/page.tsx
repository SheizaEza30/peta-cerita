import Link from "next/link";
import { Users, Search, Shield, User as UserIcon } from "lucide-react";

import { prisma } from "@/lib/db/prisma";
import { auth } from "@/lib/auth/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { UserActionsMenu } from "@/components/admin/UserActionsMenu";
import { formatDate, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Kelola Pengguna",
};

type PageProps = {
  searchParams: Promise<{ role?: string; q?: string }>;
};

const ROLE_CONFIG = {
  USER: {
    label: "Kontributor",
    className: "bg-blue-100 text-blue-700",
  },
  MODERATOR: {
    label: "Moderator",
    className: "bg-purple-100 text-purple-700",
  },
  ADMIN: {
    label: "Admin",
    className: "bg-red-100 text-red-700",
  },
} as const;

const TABS = [
  { value: "", label: "Semua" },
  { value: "USER", label: "Kontributor" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "ADMIN", label: "Admin" },
];

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const roleFilter = params.role?.toUpperCase() ?? "";
  const searchQuery = params.q?.trim() ?? "";

  // Cek current user (untuk guard: tidak bisa ubah/hapus sendiri)
  const session = await auth();
  const currentUserId = session?.user?.id ?? "";

  const where: Record<string, unknown> = {};

  if (roleFilter && ["USER", "MODERATOR", "ADMIN"].includes(roleFilter)) {
    where.role = roleFilter;
  }

  if (searchQuery) {
    where.OR = [
      { username: { contains: searchQuery, mode: "insensitive" } },
      { name: { contains: searchQuery, mode: "insensitive" } },
      { email: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const [users, counts] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        avatar: true,
        role: true,
        points: true,
        createdAt: true,
        _count: {
          select: {
            stories: true,
            contributions: true,
            savedStories: true,
          },
        },
      },
    }),
    prisma.user.groupBy({
      by: ["role"],
      _count: { _all: true },
    }),
  ]);

  const roleCounts: Record<string, number> = {
    USER: 0,
    MODERATOR: 0,
    ADMIN: 0,
  };
  let totalAll = 0;
  for (const row of counts) {
    roleCounts[row.role] = row._count._all;
    totalAll += row._count._all;
  }

  return (
    <div className="container py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold md:text-3xl">
          Kelola Pengguna
        </h1>
        <p className="text-sm text-muted-foreground">
          {totalAll} pengguna terdaftar di Peta Cerita
        </p>
      </div>

      {/* Search */}
      <div className="mb-4">
        <form method="GET" className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            name="q"
            placeholder="Cari username, nama, atau email..."
            defaultValue={searchQuery}
            className="h-10 pl-9"
          />
          {roleFilter && <input type="hidden" name="role" value={roleFilter} />}
        </form>
      </div>

      {/* Role tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-border no-scrollbar">
        {TABS.map((tab) => {
          const isActive = roleFilter === tab.value;
          const count = tab.value === "" ? totalAll : roleCounts[tab.value] || 0;
          const href = tab.value
            ? `/admin/users?role=${tab.value}`
            : "/admin/users";

          return (
            <Link
              key={tab.value}
              href={href}
              className={cn(
                "flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                isActive
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-[10px] font-semibold",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {count}
              </span>
            </Link>
          );
        })}
      </div>

      {/* Content */}
      {users.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Users className="mb-3 size-12 text-muted-foreground/50" />
            <p className="mb-1 font-semibold">Tidak ada pengguna</p>
            <p className="mb-4 max-w-md text-sm text-muted-foreground">
              {searchQuery
                ? `Tidak ada user dengan kata kunci "${searchQuery}"`
                : "Belum ada pengguna dengan kriteria ini."}
            </p>
            <Button asChild variant="outline">
              <Link href="/admin/users">Hapus Filter</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {users.map((user) => {
            const roleConfig =
              ROLE_CONFIG[user.role as keyof typeof ROLE_CONFIG];
            const RoleIcon = user.role === "ADMIN" ? Shield : UserIcon;
            const isSelf = user.id === currentUserId;

            return (
              <Card key={user.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Avatar */}
                    <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-primary">
                      {user.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={user.avatar}
                          alt={user.name ?? user.username}
                          className="size-full object-cover"
                        />
                      ) : (
                        <UserIcon className="size-5" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="font-semibold">
                          {user.name ?? user.username}
                        </span>
                        <Badge className={`${roleConfig.className} border-0`}>
                          <RoleIcon className="size-3 mr-1" />
                          {roleConfig.label}
                        </Badge>
                        {isSelf && (
                          <Badge variant="outline" className="text-[10px]">
                            Anda
                          </Badge>
                        )}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        @{user.username} · {user.email}
                      </p>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                        <span>⭐ {formatNumber(user.points)} poin</span>
                        <span>📖 {user._count.stories} cerita</span>
                        <span>📝 {user._count.contributions} kontribusi</span>
                        <span>💾 {user._count.savedStories} disimpan</span>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
                      <p>Bergabung</p>
                      <p className="font-medium">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>

                    {/* Actions Menu */}
                    <UserActionsMenu
                      userId={user.id}
                      username={user.username}
                      userName={user.name}
                      currentRole={
                        user.role as "USER" | "MODERATOR" | "ADMIN"
                      }
                      isSelf={isSelf}
                    />
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