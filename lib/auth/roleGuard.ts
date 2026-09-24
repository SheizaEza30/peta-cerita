import { auth } from "@/lib/auth/auth";
import type { Role } from "@prisma/client";

/**
 * Guard untuk API Route Handlers.
 * Return user atau throw Response error.
 */

export type AuthUser = {
  id: string;
  email: string;
  username: string;
  name: string | null;
  role: Role;
  avatar: string | null;
};

/**
 * Helper: Response error 401 (Unauthorized).
 */
export function unauthorized(message = "Anda harus login terlebih dahulu") {
  return Response.json(
    { success: false, error: { code: "UNAUTHORIZED", message } },
    { status: 401 }
  );
}

/**
 * Helper: Response error 403 (Forbidden).
 */
export function forbidden(message = "Anda tidak memiliki akses") {
  return Response.json(
    { success: false, error: { code: "FORBIDDEN", message } },
    { status: 403 }
  );
}

/**
 * Ambil user dari session. Kalau null, throw Response 401.
 */
export async function requireUser(): Promise<AuthUser> {
  const session = await auth();

  if (!session?.user) {
    throw unauthorized();
  }

  return session.user as AuthUser;
}

/**
 * Ambil user + validasi role. Kalau null/role salah, throw Response.
 */
export async function requireRole(allowedRoles: Role[]): Promise<AuthUser> {
  const session = await auth();

  if (!session?.user) {
    throw unauthorized();
  }

  if (!allowedRoles.includes(session.user.role)) {
    throw forbidden();
  }

  return session.user as AuthUser;
}

/**
 * Cek role tanpa throw.
 */
export async function checkRole(allowedRoles: Role[]): Promise<boolean> {
  const session = await auth();
  if (!session?.user) return false;
  return allowedRoles.includes(session.user.role);
}