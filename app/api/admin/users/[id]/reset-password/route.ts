import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/roleGuard";
import { hashPassword } from "@/lib/auth/password";
import {
  ok,
  notFound,
  badRequest,
  validationError,
  serverError,
} from "@/lib/api/response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

const resetPasswordSchema = z.object({
  newPassword: z
    .string()
    .min(8, "Password minimal 8 karakter")
    .max(100, "Password maksimal 100 karakter")
    .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
    .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
    .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
});

/**
 * POST /api/admin/users/[id]/reset-password
 * Reset password user (khusus admin).
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await requireRole(["ADMIN"]);

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, username: true },
    });

    if (!existing) return notFound("User tidak ditemukan");

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = resetPasswordSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { newPassword } = parsed.data;
    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id },
      data: { passwordHash },
    });

    return ok({
      message: `Password @${existing.username} berhasil direset`,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_RESET_PASSWORD_ERROR]", err);
    return serverError();
  }
}