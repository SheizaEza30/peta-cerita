import Link from "next/link";
import { Map } from "lucide-react";

import { RegisterForm } from "@/components/auth/RegisterForm";
import { APP_NAME } from "@/lib/constants";

export const metadata = {
  title: "Daftar",
};

export default function RegisterPage() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-card md:p-8">
      {/* Logo */}
      <div className="mb-6 flex flex-col items-center text-center">
        <Link
          href="/"
          className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
        >
          <Map className="size-6" />
        </Link>
        <h1 className="font-serif text-2xl font-bold">
          Bergabung dengan {APP_NAME}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Bagikan cerita daerahmu ke seluruh Indonesia
        </p>
      </div>

      <RegisterForm />
    </div>
  );
}