import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  paginated,
  unauthorized,
  validationError,
  serverError,
} from "@/lib/api/response";
import { PAGINATION } from "@/lib/constants";

/**
 * GET /api/saved-stories?page=1&limit=20&storyId=xxx
 * Daftar cerita yang disimpan user (butuh login).
 *
 * Query params:
 *   - page (default 1)
 *   - limit (default 20, max 100)
 *   - storyId (optional) — filter untuk cek apakah 1 story sudah disimpan
 */
export async function GET(req: NextRequest) {
  try {
    // 1. Auth
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // 2. Parse pagination + storyId
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
    const storyIdFilter = searchParams.get("storyId");

    if (isNaN(page) || isNaN(limit)) {
      return validationError({ _form: ["Parameter page/limit tidak valid"] });
    }

    // 3. Build where clause
    const where = {
      userId: user.id,
      ...(storyIdFilter ? { storyId: storyIdFilter } : {}),
    };

    // 4. Query paralel
    const [savedItems, total] = await Promise.all([
      prisma.savedStory.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          createdAt: true,
          story: {
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
              status: true,
              createdAt: true,
              category: {
                select: { id: true, name: true, slug: true, icon: true, color: true },
              },
              author: {
                select: { id: true, username: true, name: true, avatar: true },
              },
            },
          },
        },
      }),
      prisma.savedStory.count({ where }),
    ]);

    // 5. Flatten hasil
    const items = savedItems.map((item) => ({
      savedId: item.id,
      savedAt: item.createdAt,
      ...item.story,
    }));

    return paginated(items, { page, limit, total });
  } catch (err) {
    console.error("[SAVED_STORIES_GET_ERROR]", err);
    return serverError();
  }
}