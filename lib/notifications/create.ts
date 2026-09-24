import { prisma } from "@/lib/db/prisma";
import type { NotificationType, Prisma } from "@prisma/client";

/**
 * Helper untuk buat notifikasi user.
 * Tidak boleh throw error — kalau gagal, cukup log & skip.
 * (Karena notifikasi bukan critical, jangan sampai gagalkan transaksi utama)
 */
export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  try {
    return await prisma.notification.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        message: params.message,
        link: params.link ?? null,
        metadata: params.metadata,
      },
    });
  } catch (err) {
    console.error("[NOTIFICATION_CREATE_ERROR]", err);
    return null;
  }
}