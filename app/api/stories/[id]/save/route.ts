import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  ok,
  created,
  noContent,
  unauthorized,
  notFound,
  serverError,
} from "@/lib/api/response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// POST /api/stories/[id]/save
// Simpan cerita ke daftar "Saved".
// Idempotent — kalau sudah tersimpan, tetap 200 OK.
// ============================================
export async function POST(_req: NextRequest, context: RouteContext) {
  try {
    const { id: storyId } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Cek story ada
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true },
    });
    if (!story) return notFound("Cerita tidak ditemukan");

    // Cek sudah tersimpan atau belum
    const existing = await prisma.savedStory.findUnique({
      where: {
        userId_storyId: { userId: user.id, storyId },
      },
      select: { id: true, createdAt: true },
    });

    if (existing) {
      // Sudah tersimpan, return 200 (idempotent)
      return ok({ saved: true, savedAt: existing.createdAt });
    }

    // Simpan
    const saved = await prisma.savedStory.create({
      data: { userId: user.id, storyId },
      select: { id: true, createdAt: true },
    });

    return created({ saved: true, savedAt: saved.createdAt });
  } catch (err) {
    console.error("[STORY_SAVE_POST_ERROR]", err);
    return serverError();
  }
}

// ============================================
// DELETE /api/stories/[id]/save
// Hapus dari daftar "Saved".
// Idempotent — kalau tidak ada, tetap 204.
// ============================================
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id: storyId } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Cek story ada (optional — kalau sudah dihapus, tetap OK)
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true },
    });
    if (!story) return notFound("Cerita tidak ditemukan");

    // Hapus (kalau ada)
    await prisma.savedStory.deleteMany({
      where: { userId: user.id, storyId },
    });

    return noContent();
  } catch (err) {
    console.error("[STORY_SAVE_DELETE_ERROR]", err);
    return serverError();
  }
}