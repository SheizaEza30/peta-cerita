import { NextRequest } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  created,
  paginated,
  unauthorized,
  notFound,
  validationError,
  serverError,
} from "@/lib/api/response";
import { PAGINATION } from "@/lib/constants";

// ============================================
// SCHEMA
// ============================================
const createOrUpdateSchema = z.object({
  storyId: z.string().min(1, "storyId wajib diisi"),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  completed: z.boolean().optional(),
});

// ============================================
// GET /api/reading-history
// List riwayat baca user
// ============================================
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const { searchParams } = req.nextUrl;
    const page = Math.max(
      1,
      parseInt(searchParams.get("page") || String(PAGINATION.DEFAULT_PAGE), 10)
    );
    const limit = Math.min(
      PAGINATION.MAX_LIMIT,
      Math.max(
        1,
        parseInt(searchParams.get("limit") || String(PAGINATION.DEFAULT_LIMIT), 10)
      )
    );

    const [items, total] = await Promise.all([
      prisma.readingHistory.findMany({
        where: { userId: user.id },
        orderBy: { lastReadAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          progress: true,
          completed: true,
          lastReadAt: true,
          story: {
            select: {
              id: true,
              title: true,
              slug: true,
              synopsis: true,
              heroImage: true,
              city: true,
              province: true,
              status: true,
              category: {
                select: { name: true, slug: true, icon: true, color: true },
              },
            },
          },
        },
      }),
      prisma.readingHistory.count({ where: { userId: user.id } }),
    ]);

    const data = items.map((item) => ({
      historyId: item.id,
      progress: item.progress,
      completed: item.completed,
      lastReadAt: item.lastReadAt,
      ...item.story,
    }));

    return paginated(data, { page, limit, total });
  } catch (err) {
    console.error("[READING_HISTORY_GET_ERROR]", err);
    return serverError();
  }
}

// ============================================
// POST /api/reading-history
// Buat atau update progress baca
// ============================================
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await req.json().catch(() => null);
    if (!body) return validationError({ _form: ["Body tidak valid"] });

    const parsed = createOrUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { storyId, progress, completed } = parsed.data;

    // Cek story ada & published
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true, status: true },
    });
    if (!story) return notFound("Cerita tidak ditemukan");
    if (story.status !== "PUBLISHED") {
      return notFound("Cerita tidak tersedia");
    }

    // Upsert (create kalau belum ada, update kalau sudah)
    const isCompleted = completed ?? progress >= 100;

    const history = await prisma.readingHistory.upsert({
      where: {
        userId_storyId: { userId: user.id, storyId },
      },
      create: {
        userId: user.id,
        storyId,
        progress,
        completed: isCompleted,
        lastReadAt: new Date(),
      },
      update: {
        progress,
        completed: isCompleted,
        lastReadAt: new Date(),
      },
      select: {
        id: true,
        progress: true,
        completed: true,
        lastReadAt: true,
      },
    });

    return created({ history });
  } catch (err) {
    console.error("[READING_HISTORY_POST_ERROR]", err);
    return serverError();
  }
}