import { NextRequest } from "next/server";
import type { Prisma, Role } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/roleGuard";
import { validationError, serverError } from "@/lib/api/response";
import { PAGINATION } from "@/lib/constants";

/**
 * GET /api/admin/users?search=&role=&page=1&limit=20
 * List users (hanya ADMIN).
 * Akses: ADMIN only
 */
export async function GET(req: NextRequest) {
  try {
    // Guard: ADMIN ONLY
    await requireRole(["ADMIN"]);

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
    const search = searchParams.get("search")?.trim();
    const role = searchParams.get("role");

    if (isNaN(page) || isNaN(limit)) {
      return validationError({ _form: ["Parameter page/limit tidak valid"] });
    }

    // Build where
    const where: Prisma.UserWhereInput = {};

    if (role) {
      const validRoles = ["USER", "MODERATOR", "ADMIN"];
      if (validRoles.includes(role)) {
        where.role = role as Role;
      }
    }

    if (search) {
      where.OR = [
        { username: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Query paralel
    const [users, total, counts] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          username: true,
          name: true,
          email: true,
          avatar: true,
          bio: true,
          role: true,
          points: true,
          emailVerified: true,
          createdAt: true,
          _count: {
            select: {
              stories: true,
              contributions: true,
              savedStories: true,
              reports: true,
            },
          },
        },
      }),
      prisma.user.count({ where }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
    ]);

    // Format counts
    const roleCounts: Record<string, number> = {
      USER: 0,
      MODERATOR: 0,
      ADMIN: 0,
    };
    for (const row of counts) {
      roleCounts[row.role] = row._count._all;
    }

    return Response.json(
      {
        success: true,
        data: users,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          roleCounts,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_USERS_GET_ERROR]", err);
    return serverError();
  }
}