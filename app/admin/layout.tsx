import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminMobileNav } from "@/components/admin/AdminMobileNav";
import { TopBar } from "@/components/layout/TopBar";

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "MODERATOR"
  ) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <TopBar />

      {/* Mobile admin nav — sticky bar di bawah TopBar */}
      <div className="sticky top-14 z-20 flex items-center gap-2 border-b border-border bg-background px-4 py-2 md:hidden">
        <AdminMobileNav />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Admin Panel
        </span>
      </div>

      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}