import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/roleGuard";
import {
  ok,
  noContent,
  notFound,
  badRequest,
  conflict,
  validationError,
  serverError,
} from "@/lib/api/response";
import { updateCategorySchema } from "@/lib/validation/admin.schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// GET /api/admin/categories/[id]
// Detail 1 kategori (ADMIN only).
// ============================================
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await requireRole(["ADMIN"]);

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: { stories: true },
        },
      },
    });

    if (!category) return notFound("Kategori tidak ditemukan");

    return ok({ category });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_CATEGORY_DETAIL_GET_ERROR]", err);
    return serverError();
  }
}

// ============================================
// PUT /api/admin/categories/[id]
// Update kategori (ADMIN only).
// ============================================
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await requireRole(["ADMIN"]);

    // Cek kategori ada
    const existing = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true, slug: true },
    });
    if (!existing) return notFound("Kategori tidak ditemukan");

    // Parse & validasi
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = updateCategorySchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;

    // Cek duplikat name (kalau nama berubah)
    if (data.name && data.name !== existing.name) {
      const duplicateName = await prisma.category.findUnique({
        where: { name: data.name },
        select: { id: true },
      });
      if (duplicateName && duplicateName.id !== id) {
        return conflict("Nama kategori sudah dipakai kategori lain");
      }
    }

    // Cek duplikat slug (kalau slug berubah)
    if (data.slug && data.slug !== existing.slug) {
      const duplicateSlug = await prisma.category.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });
      if (duplicateSlug && duplicateSlug.id !== id) {
        return conflict("Slug kategori sudah dipakai kategori lain");
      }
    }

    // Update
    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.slug !== undefined && { slug: data.slug }),
        ...(data.icon !== undefined && { icon: data.icon || null }),
        ...(data.color !== undefined && { color: data.color || null }),
        ...(data.description !== undefined && {
          description: data.description || null,
        }),
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        description: true,
        updatedAt: true,
      },
    });

    return ok({ category });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_CATEGORY_PUT_ERROR]", err);
    return serverError();
  }
}

// ============================================
// DELETE /api/admin/categories/[id]
// Hapus kategori (ADMIN only).
// Cegah hapus kalau masih ada cerita di kategori ini.
// ============================================
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await requireRole(["ADMIN"]);

    // Cek kategori ada
    const existing = await prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!existing) return notFound("Kategori tidak ditemukan");

    // Cek apakah masih ada story di kategori ini
    const storyCount = await prisma.story.count({
      where: { categoryId: id },
    });

    if (storyCount > 0) {
      return conflict(
        `Tidak dapat menghapus kategori "${existing.name}" karena masih memiliki ${storyCount} cerita. Pindahkan atau hapus cerita terlebih dahulu.`
      );
    }

    // Hapus
    await prisma.category.delete({ where: { id } });

    return noContent();
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_CATEGORY_DELETE_ERROR]", err);
    return serverError();
  }
}