import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Settings as SettingsIcon } from "lucide-react";

import { auth } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { ChangePasswordForm } from "@/components/settings/ChangePasswordForm";

export const metadata = {
  title: "Pengaturan",
};

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/settings");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      avatar: true,
      role: true,
      points: true,
    },
  });

  if (!user) redirect("/login");

  return (
    <div className="container max-w-2xl py-6">
      <Link
        href="/profile"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Kembali ke profil
      </Link>

      <div className="mb-6 flex items-center gap-2">
        <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          <SettingsIcon className="size-5" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold md:text-3xl">
            Pengaturan
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola profil dan keamanan akun Anda
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <ProfileForm
          initialName={user.name ?? ""}
          initialUsername={user.username}
          initialBio={user.bio ?? ""}
          initialAvatar={user.avatar ?? ""}
          email={user.email}
        />

        <ChangePasswordForm />
      </div>
    </div>
  );
}