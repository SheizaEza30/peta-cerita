"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Map,
  User,
  LogOut,
  Settings,
  Bookmark,
  BookOpen,
  Trophy,
  LayoutDashboard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { APP_NAME, ROUTES } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function TopBar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const isMapPage = pathname === ROUTES.HOME;
  const user = session?.user;

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center justify-between gap-3 px-4 transition-colors",
        isMapPage
          ? "glass bg-transparent"
          : "border-b border-border bg-background"
      )}
    >
      <Link
        href={ROUTES.HOME}
        className="flex items-center gap-2 font-semibold tracking-tight"
      >
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
          <Map className="size-4" />
        </div>
        <span className="hidden sm:inline">{APP_NAME}</span>
      </Link>

      <nav className="hidden md:flex items-center gap-1">
        <NavLink href={ROUTES.HOME} active={pathname === ROUTES.HOME}>
          Peta
        </NavLink>
        <NavLink
          href={ROUTES.EXPLORE}
          active={pathname.startsWith(ROUTES.EXPLORE)}
        >
          Jelajah
        </NavLink>
        <NavLink
          href={ROUTES.CONTRIBUTE}
          active={pathname.startsWith(ROUTES.CONTRIBUTE)}
        >
          Kontribusi
        </NavLink>
      </nav>

      <div className="flex items-center gap-2">
        {status === "loading" ? (
          <div className="size-9 animate-pulse rounded-full bg-muted" />
        ) : user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-full p-0"
                aria-label="Menu profil"
              >
                {user.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={user.avatar}
                    alt={user.name ?? "User"}
                    className="size-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <User className="size-4" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold">
                    {user.name ?? user.username}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    @{user.username}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href={ROUTES.PROFILE} className="cursor-pointer">
                  <User className="size-4 mr-2" />
                  Profil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/contributions" className="cursor-pointer">
                  <BookOpen className="size-4 mr-2" />
                  Kontribusi
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/saved" className="cursor-pointer">
                  <Bookmark className="size-4 mr-2" />
                  Disimpan
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/profile/achievements" className="cursor-pointer">
                  <Trophy className="size-4 mr-2" />
                  Achievement
                </Link>
              </DropdownMenuItem>

              {(user.role === "ADMIN" || user.role === "MODERATOR") && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="cursor-pointer">
                      <LayoutDashboard className="size-4 mr-2" />
                      Dashboard Admin
                    </Link>
                  </DropdownMenuItem>
                </>
              )}

              <DropdownMenuSeparator />

              <DropdownMenuItem asChild>
                <Link href={ROUTES.SETTINGS} className="cursor-pointer">
                  <Settings className="size-4 mr-2" />
                  Pengaturan
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => signOut({ callbackUrl: "/" })}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="size-4 mr-2" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="hidden md:inline-flex"
            >
              <Link href={ROUTES.LOGIN}>Masuk</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={ROUTES.REGISTER}>Daftar</Link>
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-secondary text-foreground"
          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      )}
    >
      {children}
    </Link>
  );
}