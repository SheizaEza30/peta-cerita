import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  ok,
  noContent,
  unauthorized,
  forbidden,
  notFound,
  serverError,
} from "@/lib/api/response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// POST /api/notifications/[id]/read
// Tandai 1 notifikasi sudah dibaca.
// ============================================
export async function POST(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Cek notifikasi ada & milik user
    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { id: true, userId: true, read: true },
    });

    if (!notification) return notFound("Notifikasi tidak ditemukan");

    // Pastikan notifikasi milik user yang login
    if (notification.userId !== user.id) {
      return forbidden("Anda tidak berhak mengakses notifikasi ini");
    }

    // Kalau sudah dibaca, return 200 (idempotent)
    if (notification.read) {
      return ok({ read: true, alreadyRead: true });
    }

    // Update
    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return ok({ read: true });
  } catch (err) {
    console.error("[NOTIFICATION_READ_POST_ERROR]", err);
    return serverError();
  }
}

// ============================================
// DELETE /api/notifications/[id]/read
// Reset notifikasi ke belum dibaca (opsional).
// ============================================
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const notification = await prisma.notification.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!notification) return notFound("Notifikasi tidak ditemukan");
    if (notification.userId !== user.id) return forbidden();

    await prisma.notification.update({
      where: { id },
      data: { read: false },
    });

    return noContent();
  } catch (err) {
    console.error("[NOTIFICATION_READ_DELETE_ERROR]", err);
    return serverError();
  }
}