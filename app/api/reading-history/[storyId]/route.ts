import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  ok,
  noContent,
  unauthorized,
  notFound,
  serverError,
} from "@/lib/api/response";

type RouteContext = {
  params: Promise<{ storyId: string }>;
};

// ============================================
// GET /api/reading-history/[storyId]
// Ambil progress baca user untuk cerita tertentu.
// Kalau belum pernah dibaca → return data default (progress: 0).
// ============================================
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { storyId } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Cek story ada
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true },
    });
    if (!story) return notFound("Cerita tidak ditemukan");

    // Ambil history
    const history = await prisma.readingHistory.findUnique({
      where: {
        userId_storyId: { userId: user.id, storyId },
      },
      select: {
        id: true,
        progress: true,
        completed: true,
        lastReadAt: true,
      },
    });

    // Kalau belum ada, return default (bukan 404)
    if (!history) {
      return ok({
        history: {
          id: null,
          progress: 0,
          completed: false,
          lastReadAt: null,
        },
        isNew: true,
      });
    }

    return ok({ history, isNew: false });
  } catch (err) {
    console.error("[READING_HISTORY_DETAIL_GET_ERROR]", err);
    return serverError();
  }
}

// ============================================
// DELETE /api/reading-history/[storyId]
// Hapus riwayat baca untuk cerita tertentu.
// Idempotent — kalau tidak ada, tetap 204.
// ============================================
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { storyId } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    await prisma.readingHistory.deleteMany({
      where: { userId: user.id, storyId },
    });

    return noContent();
  } catch (err) {
    console.error("[READING_HISTORY_DETAIL_DELETE_ERROR]", err);
    return serverError();
  }
}