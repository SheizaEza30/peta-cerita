import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth/auth";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { TopBar } from "@/components/layout/TopBar";

export default async function AdminLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const session = await auth();

  // Guard: harus login
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }

  // Guard: harus ADMIN atau MODERATOR
  if (
    session.user.role !== "ADMIN" &&
    session.user.role !== "MODERATOR"
  ) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen flex-col">
      <TopBar />
      <div className="flex flex-1">
        {/* Sidebar desktop */}
        <AdminSidebar />

        {/* Content */}
        <main className="flex-1 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}