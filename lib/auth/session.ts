import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

/**
 * Ambil session user saat ini.
 * Return null kalau belum login.
 */
export async function getSession() {
  return auth();
}

/**
 * Ambil user yang sedang login.
 * Return null kalau belum login.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Wajib login. Kalau belum, redirect ke /login.
 * Dipakai di Server Components atau Route Handlers.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

/**
 * Wajib punya role tertentu. Kalau tidak, redirect.
 * Contoh: requireRole(["ADMIN", "MODERATOR"])
 */
export async function requireRole(allowedRoles: Role[]) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!allowedRoles.includes(session.user.role)) {
    redirect("/");
  }

  return session;
}

/**
 * Cek apakah user punya role tertentu.
 * Return boolean, tidak redirect.
 */
export async function hasRole(allowedRoles: Role[]): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  return allowedRoles.includes(session.user.role);
}

/**
 * Cek apakah user sudah login.
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await auth();
  return !!session?.user;
}