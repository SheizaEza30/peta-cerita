import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { ok, badRequest, serverError } from "@/lib/api/response";

/**
 * GET /api/stories/search?q=legenda bandung&limit=8
 *
 * Search ringan untuk autocomplete.
 * Hasil: maksimal 10 item, hanya field penting.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const q = searchParams.get("q")?.trim();
    const limitParam = searchParams.get("limit");
    const limit = Math.min(20, Math.max(1, parseInt(limitParam || "8", 10)));

    // Wajib ada query minimal 2 karakter
    if (!q || q.length < 2) {
      return badRequest("Query pencarian minimal 2 karakter");
    }

    // Batasi panjang query untuk performa
    const query = q.slice(0, 100);

    const where: Prisma.StoryWhereInput = {
      status: "PUBLISHED",
      OR: [
        { title: { contains: query, mode: "insensitive" } },
        { synopsis: { contains: query, mode: "insensitive" } },
        { city: { contains: query, mode: "insensitive" } },
        { province: { contains: query, mode: "insensitive" } },
        { category: { name: { contains: query, mode: "insensitive" } } },
      ],
    };

    const stories = await prisma.story.findMany({
      where,
      take: limit,
      orderBy: [{ viewCount: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        slug: true,
        synopsis: true,
        heroImage: true,
        city: true,
        province: true,
        latitude: true,
        longitude: true,
        category: {
          select: { name: true, slug: true, icon: true, color: true },
        },
      },
    });

    // Format untuk autocomplete
    const results = stories.map((s) => ({
      id: s.id,
      title: s.title,
      slug: s.slug,
      synopsis:
        s.synopsis.length > 120 ? s.synopsis.slice(0, 120) + "…" : s.synopsis,
      heroImage: s.heroImage,
      location: [s.city, s.province].filter(Boolean).join(", ") || null,
      latitude: s.latitude,
      longitude: s.longitude,
      category: s.category,
    }));

    return ok({
      query,
      count: results.length,
      results,
    });
  } catch (err) {
    console.error("[STORIES_SEARCH_ERROR]", err);
    return serverError();
  }
}