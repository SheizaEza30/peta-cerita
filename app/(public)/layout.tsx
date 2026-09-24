import type { ReactNode } from "react";

import { TopBar } from "@/components/layout/TopBar";
import { BottomNav } from "@/components/layout/BottomNav";

export default function PublicLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Top bar — fixed di atas */}
      <TopBar />

      {/* Content — full height minus top bar & bottom nav */}
      <main className="flex-1">{children}</main>

      {/* Bottom nav — hanya tampil di mobile */}
      <BottomNav />
    </div>
  );
}