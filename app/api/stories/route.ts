import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  created,
  paginated,
  badRequest,
  unauthorized,
  validationError,
  serverError,
} from "@/lib/api/response";
import {
  createStorySchema,
  storyQuerySchema,
  parseBounds,
} from "@/lib/validation/story.schema";
import { slugify } from "@/lib/utils";

/**
 * GET /api/stories
 * List cerita dengan filter, pagination, dan bounding box (untuk map).
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;

    // 1. Parse & validasi query
    const parsed = storyQuerySchema.safeParse(
      Object.fromEntries(searchParams.entries())
    );

    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const {
      page,
      limit,
      categoryId,
      categorySlug,
      authorId,
      city,
      province,
      search,
      status,
      bounds,
      sortBy,
    } = parsed.data;

    // 2. Build where clause
    const where: Prisma.StoryWhereInput = {};

    // Default: hanya tampilkan cerita yang sudah published
    // (kecuali ada filter status eksplisit — untuk admin)
    if (status) {
      where.status = status;
    } else {
      where.status = "PUBLISHED";
    }

    if (categoryId) where.categoryId = categoryId;
    if (categorySlug) where.category = { slug: categorySlug };
    if (authorId) where.authorId = authorId;
    if (city) where.city = { contains: city, mode: "insensitive" };
    if (province) where.province = { contains: province, mode: "insensitive" };

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { synopsis: { contains: search, mode: "insensitive" } },
        { city: { contains: search, mode: "insensitive" } },
        { province: { contains: search, mode: "insensitive" } },
      ];
    }

    // Bounding box untuk map
    const bbox = parseBounds(bounds);
    if (bbox) {
      where.latitude = { gte: bbox.minLat, lte: bbox.maxLat };
      where.longitude = { gte: bbox.minLng, lte: bbox.maxLng };
    }

    // 3. Sort
    let orderBy: Prisma.StoryOrderByWithRelationInput = { createdAt: "desc" };
    if (sortBy === "popular") orderBy = { viewCount: "desc" };
    if (sortBy === "recent") orderBy = { createdAt: "desc" };

    // 4. Query paralel
    const [stories, total] = await Promise.all([
      prisma.story.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          synopsis: true,
          heroImage: true,
          latitude: true,
          longitude: true,
          city: true,
          province: true,
          country: true,
          period: true,
          status: true,
          viewCount: true,
          createdAt: true,
          category: {
            select: { id: true, name: true, slug: true, icon: true, color: true },
          },
          author: {
            select: { id: true, username: true, name: true, avatar: true },
          },
          _count: {
            select: { images: true, savedBy: true, reports: true },
          },
        },
      }),
      prisma.story.count({ where }),
    ]);

    // 5. Return paginated
    return paginated(stories, { page, limit, total });
  } catch (err) {
    console.error("[STORIES_GET_ERROR]", err);
    return serverError();
  }
}

/**
 * POST /api/stories
 * Buat cerita baru (langsung publish, khusus ADMIN/MODERATOR).
 * Untuk user biasa, gunakan /api/contributions.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Auth
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Hanya ADMIN/MODERATOR yang bisa langsung buat Story
    if (user.role !== "ADMIN" && user.role !== "MODERATOR") {
      return badRequest(
        "Gunakan /api/contributions untuk mengirim cerita sebagai kontribusi"
      );
    }

    // 2. Parse & validasi
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = createStorySchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;

    // 3. Cek kategori
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true, slug: true },
    });
    if (!category) return badRequest("Kategori tidak valid");

    // 4. Generate slug unik
    let slug = slugify(data.title);
    const existingSlug = await prisma.story.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // 5. Create Story
    const story = await prisma.story.create({
      data: {
        title: data.title,
        slug,
        synopsis: data.synopsis,
        content: data.content,
        categoryId: data.categoryId,
        latitude: data.latitude,
        longitude: data.longitude,
        address: data.address || null,
        city: data.city || null,
        province: data.province || null,
        country: data.country || "Indonesia",
        period: data.period || null,
        source: data.source || null,
        heroImage: data.heroImage || null,
        status: "PUBLISHED",
        authorId: user.id,
        approvedBy: user.id,
        approvedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        slug: true,
        synopsis: true,
        heroImage: true,
        latitude: true,
        longitude: true,
        status: true,
        createdAt: true,
      },
    });

    return created({ story });
  } catch (err) {
    console.error("[STORIES_POST_ERROR]", err);
    return serverError();
  }
}