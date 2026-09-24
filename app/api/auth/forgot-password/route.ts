import { NextRequest } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";

import { prisma } from "@/lib/db/prisma";
import { sendPasswordResetEmail } from "@/lib/email/send";
import {
  ok,
  badRequest,
  validationError,
  serverError,
} from "@/lib/api/response";

const schema = z.object({
  email: z.string().email("Email tidak valid").toLowerCase().trim(),
});

const TOKEN_EXPIRY_HOURS = 1;

/**
 * POST /api/auth/forgot-password
 * Kirim email reset password.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { email } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, username: true },
    });

    // Selalu return success (security: jangan kasih tahu apakah email terdaftar)
    if (!user) {
      return ok({
        message:
          "Kalau email terdaftar, kami sudah kirim link reset password.",
      });
    }

    // Hapus token lama yang belum dipakai
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
    });

    // Generate token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);

    await prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    // Build reset URL
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${appUrl}/reset-password?token=${token}`;

    // Kirim email
    await sendPasswordResetEmail({
      to: user.email,
      userName: user.name ?? user.username,
      resetUrl,
    });

    return ok({
      message:
        "Kalau email terdaftar, kami sudah kirim link reset password.",
    });
  } catch (err) {
    console.error("[FORGOT_PASSWORD_ERROR]", err);
    return serverError();
  }
}