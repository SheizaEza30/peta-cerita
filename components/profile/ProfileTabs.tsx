"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  Bookmark,
  History,
  Trophy,
} from "lucide-react";

import { cn } from "@/lib/utils";

const tabs = [
  { href: "/profile", label: "Ringkasan", icon: LayoutGrid, exact: true },
  { href: "/profile/contributions", label: "Kontribusi", icon: BookOpen },
  { href: "/profile/saved", label: "Disimpan", icon: Bookmark },
  { href: "/profile/history", label: "Riwayat", icon: History },
  { href: "/profile/achievements", label: "Achievement", icon: Trophy },
];

export function ProfileTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-border no-scrollbar"
      aria-label="Menu profil"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.exact
          ? pathname === tab.href
          : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-3 text-sm font-medium transition-colors md:px-4",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:border-border hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon className="size-4" />
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}