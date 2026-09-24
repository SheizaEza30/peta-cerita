import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/roleGuard";
import {
  created,
  ok,
  conflict,
  badRequest,
  validationError,
  serverError,
} from "@/lib/api/response";
import { createCategorySchema } from "@/lib/validation/admin.schema";

/**
 * GET /api/admin/categories
 * List semua kategori (ADMIN only).
 */
export async function GET() {
  try {
    await requireRole(["ADMIN"]);

    const categories = await prisma.category.findMany({
      orderBy: { name: "asc" },
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

    return ok({ categories });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_CATEGORIES_GET_ERROR]", err);
    return serverError();
  }
}

/**
 * POST /api/admin/categories
 * Buat kategori baru (ADMIN only).
 */
export async function POST(req: NextRequest) {
  try {
    await requireRole(["ADMIN"]);

    // Parse & validasi
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = createCategorySchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { name, slug, icon, color, description } = parsed.data;

    // Cek duplikat name
    const existingName = await prisma.category.findUnique({
      where: { name },
      select: { id: true },
    });
    if (existingName) return conflict("Nama kategori sudah ada");

    // Cek duplikat slug
    const existingSlug = await prisma.category.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existingSlug) return conflict("Slug kategori sudah ada");

    // Buat
    const category = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || null,
        color: color || null,
        description: description || null,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        color: true,
        description: true,
        createdAt: true,
      },
    });

    return created({ category });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_CATEGORIES_POST_ERROR]", err);
    return serverError();
  }
}