import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  ok,
  noContent,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  validationError,
  serverError,
} from "@/lib/api/response";
import { updateStorySchema } from "@/lib/validation/story.schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// GET /api/stories/[id]
// ============================================
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const story = await prisma.story.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        synopsis: true,
        content: true,
        heroImage: true,
        latitude: true,
        longitude: true,
        address: true,
        city: true,
        province: true,
        country: true,
        period: true,
        source: true,
        status: true,
        viewCount: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: { id: true, name: true, slug: true, icon: true, color: true },
        },
        author: {
          select: { id: true, username: true, name: true, avatar: true, points: true },
        },
        images: {
          orderBy: { order: "asc" },
          select: { id: true, url: true, caption: true, order: true },
        },
        _count: {
          select: { images: true, savedBy: true, reports: true },
        },
      },
    });

    if (!story) {
      return notFound("Cerita tidak ditemukan");
    }

    // Hanya tampilkan PUBLISHED untuk publik. Status lain hanya untuk author/admin.
    if (story.status !== "PUBLISHED") {
      const user = await getCurrentUser();
      const isOwner = user?.id === story.author.id;
      const isAdminOrMod = user?.role === "ADMIN" || user?.role === "MODERATOR";

      if (!isOwner && !isAdminOrMod) {
        return notFound("Cerita tidak ditemukan");
      }
    }

    return ok({ story });
  } catch (err) {
    console.error("[STORY_GET_ERROR]", err);
    return serverError();
  }
}

// ============================================
// PUT /api/stories/[id]
// Update cerita (hanya author / admin / moderator)
// ============================================
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Cek story ada
    const existing = await prisma.story.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!existing) return notFound("Cerita tidak ditemukan");

    const isOwner = existing.authorId === user.id;
    const isAdminOrMod = user.role === "ADMIN" || user.role === "MODERATOR";

    if (!isOwner && !isAdminOrMod) {
      return forbidden("Anda tidak berhak mengubah cerita ini");
    }

    // Parse & validasi
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = updateStorySchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;

    // Update
    const story = await prisma.story.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.synopsis !== undefined && { synopsis: data.synopsis }),
        ...(data.content !== undefined && { content: data.content }),
        ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
        ...(data.latitude !== undefined && { latitude: data.latitude }),
        ...(data.longitude !== undefined && { longitude: data.longitude }),
        ...(data.address !== undefined && { address: data.address || null }),
        ...(data.city !== undefined && { city: data.city || null }),
        ...(data.province !== undefined && { province: data.province || null }),
        ...(data.country !== undefined && { country: data.country }),
        ...(data.period !== undefined && { period: data.period || null }),
        ...(data.source !== undefined && { source: data.source || null }),
        ...(data.heroImage !== undefined && { heroImage: data.heroImage || null }),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
      },
    });

    return ok({ story });
  } catch (err) {
    console.error("[STORY_PUT_ERROR]", err);
    return serverError();
  }
}

// ============================================
// DELETE /api/stories/[id]
// Hapus cerita (author sendiri, atau admin)
// ============================================
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const existing = await prisma.story.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });

    if (!existing) return notFound("Cerita tidak ditemukan");

    const isOwner = existing.authorId === user.id;
    const isAdmin = user.role === "ADMIN";

    // Hanya author sendiri atau ADMIN (moderator tidak boleh hapus)
    if (!isOwner && !isAdmin) {
      return forbidden("Anda tidak berhak menghapus cerita ini");
    }

    await prisma.story.delete({ where: { id } });

    return noContent();
  } catch (err) {
    console.error("[STORY_DELETE_ERROR]", err);
    return serverError();
  }
}