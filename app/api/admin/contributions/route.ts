import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/roleGuard";
import {
  validationError,
  serverError,
} from "@/lib/api/response";
import { PAGINATION } from "@/lib/constants";

/**
 * GET /api/admin/contributions?status=PENDING&page=1&limit=20
 * List SEMUA kontribusi (untuk moderasi).
 * Akses: MODERATOR, ADMIN
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole(["MODERATOR", "ADMIN"]);

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
    const status = searchParams.get("status");
    const search = searchParams.get("search")?.trim();
    const sortBy = searchParams.get("sortBy") || "oldest"; // oldest first untuk moderasi

    if (isNaN(page) || isNaN(limit)) {
      return validationError({ _form: ["Parameter page/limit tidak valid"] });
    }

    // Build where
    const where: Prisma.ContributionWhereInput = {};

    if (status) {
      const validStatuses = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];
      if (validStatuses.includes(status)) {
        where.status = status as Prisma.EnumContributionStatusFilter["equals"];
      }
    }

    if (search) {
      // Search di title dalam submissionData (JSON)
      where.submissionData = {
        path: ["title"],
        string_contains: search,
        mode: "insensitive",
      };
    }

    // Sort
    const orderBy: Prisma.ContributionOrderByWithRelationInput =
      sortBy === "newest" ? { createdAt: "desc" } : { createdAt: "asc" };

    // Query paralel
    const [contributions, total, counts] = await Promise.all([
      prisma.contribution.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          status: true,
          submissionData: true,
          rejectionReason: true,
          reviewedAt: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              username: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          reviewer: {
            select: { id: true, username: true, name: true },
          },
          story: {
            select: { id: true, slug: true, status: true },
          },
        },
      }),
      prisma.contribution.count({ where }),
      // Statistik per status untuk tab counter
      prisma.contribution.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    // Format counts
    const statusCounts: Record<string, number> = {
      DRAFT: 0,
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
    };
    for (const row of counts) {
      statusCounts[row.status] = row._count._all;
    }

    // Return dengan extra meta statusCounts
    return Response.json(
      {
        success: true,
        data: contributions,
        meta: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          statusCounts,
        },
      },
      { status: 200 }
    );
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_CONTRIBUTIONS_GET_ERROR]", err);
    return serverError();
  }
}