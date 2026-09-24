import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";
import {
  ok,
  badRequest,
  validationError,
  serverError,
} from "@/lib/api/response";

const schema = z
  .object({
    token: z.string().min(1, "Token wajib diisi"),
    newPassword: z
      .string()
      .min(8, "Password minimal 8 karakter")
      .max(100, "Password maksimal 100 karakter")
      .regex(/[A-Z]/, "Password harus mengandung minimal 1 huruf besar")
      .regex(/[a-z]/, "Password harus mengandung minimal 1 huruf kecil")
      .regex(/[0-9]/, "Password harus mengandung minimal 1 angka"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

/**
 * POST /api/auth/reset-password
 * Validasi token + set password baru.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { token, newPassword } = parsed.data;

    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: {
        id: true,
        userId: true,
        expiresAt: true,
        usedAt: true,
      },
    });

    if (!resetRecord) {
      return validationError({
        token: ["Token tidak valid atau sudah kedaluwarsa"],
      });
    }

    if (resetRecord.usedAt) {
      return validationError({
        token: ["Token sudah pernah dipakai"],
      });
    }

    if (resetRecord.expiresAt < new Date()) {
      return validationError({
        token: ["Token sudah kedaluwarsa. Minta ulang link reset."],
      });
    }

    const passwordHash = await hashPassword(newPassword);

    // Update password + mark token as used (transaksi)
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetRecord.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return ok({ message: "Password berhasil direset. Silakan login." });
  } catch (err) {
    console.error("[RESET_PASSWORD_ERROR]", err);
    return serverError();
  }
}