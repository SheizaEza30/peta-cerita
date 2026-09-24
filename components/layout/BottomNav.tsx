"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Map, Compass, Bookmark, PlusCircle, User } from "lucide-react";

import { cn } from "@/lib/utils";
import { ROUTES } from "@/lib/constants";

/**
 * BottomNav — navigasi bawah untuk mobile.
 * Hanya tampil di layar kecil.
 */
const items = [
  { href: ROUTES.HOME, label: "Peta", icon: Map },
  { href: ROUTES.EXPLORE, label: "Jelajah", icon: Compass },
  { href: "/profile/saved", label: "Disimpan", icon: Bookmark },
  { href: ROUTES.CONTRIBUTE, label: "Kontribusi", icon: PlusCircle },
  { href: ROUTES.PROFILE, label: "Profil", icon: User },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 safe-bottom md:hidden"
      aria-label="Navigasi utama"
    >
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === ROUTES.HOME
              ? pathname === ROUTES.HOME
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn(
                  "size-5 transition-transform",
                  isActive && "scale-110"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}