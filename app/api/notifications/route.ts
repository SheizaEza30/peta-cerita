import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  unauthorized,
  validationError,
  serverError,
} from "@/lib/api/response";
import { PAGINATION } from "@/lib/constants";

/**
 * GET /api/notifications?page=1&limit=20&unread=true
 * List notifikasi user.
 */
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
    const unreadOnly = searchParams.get("unread") === "true";

    if (isNaN(page) || isNaN(limit)) {
      return validationError({ _form: ["Parameter page/limit tidak valid"] });
    }

    const where = {
      userId: user.id,
      ...(unreadOnly ? { read: false } : {}),
    };

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          type: true,
          title: true,
          message: true,
          link: true,
          read: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId: user.id, read: false },
      }),
    ]);

    return Response.json(
      {
        success: true,
        data: notifications,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          unreadCount,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[NOTIFICATIONS_GET_ERROR]", err);
    return serverError();
  }
}