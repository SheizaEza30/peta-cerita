import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { changePasswordSchema } from "@/lib/validation/auth.schema";
import {
  ok,
  unauthorized,
  badRequest,
  validationError,
  serverError,
} from "@/lib/api/response";

/**
 * POST /api/auth/change-password
 * Ubah password user yang sedang login.
 */
export async function POST(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) return unauthorized();

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: { passwordHash: true },
    });

    if (!user) return unauthorized();

    // Verify password lama
    const isValid = await verifyPassword(currentPassword, user.passwordHash);
    if (!isValid) {
      return validationError({
        currentPassword: ["Password saat ini salah"],
      });
    }

    // Hash password baru
    const newPasswordHash = await hashPassword(newPassword);

    // Update
    await prisma.user.update({
      where: { id: sessionUser.id },
      data: { passwordHash: newPasswordHash },
    });

    return ok({ message: "Password berhasil diubah" });
  } catch (err) {
    console.error("[CHANGE_PASSWORD_ERROR]", err);
    return serverError();
  }
}