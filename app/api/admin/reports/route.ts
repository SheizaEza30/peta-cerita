import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/roleGuard";
import { validationError, serverError } from "@/lib/api/response";
import { PAGINATION } from "@/lib/constants";

/**
 * GET /api/admin/reports?status=OPEN&page=1&limit=20
 * List semua reports (untuk moderasi).
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
    const sortBy = searchParams.get("sortBy") || "oldest";

    if (isNaN(page) || isNaN(limit)) {
      return validationError({ _form: ["Parameter page/limit tidak valid"] });
    }

    // Build where
    const where: Prisma.ReportWhereInput = {};
    if (status) {
      const validStatuses = ["OPEN", "REVIEWING", "RESOLVED", "DISMISSED"];
      if (validStatuses.includes(status)) {
        where.status = status as Prisma.EnumReportStatusFilter["equals"];
      }
    }

    // Sort
    const orderBy: Prisma.ReportOrderByWithRelationInput =
      sortBy === "newest" ? { createdAt: "desc" } : { createdAt: "asc" };

    // Query paralel
    const [reports, total, counts] = await Promise.all([
      prisma.report.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          reason: true,
          description: true,
          status: true,
          reviewNote: true,
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
          story: {
            select: {
              id: true,
              title: true,
              slug: true,
              status: true,
              heroImage: true,
              author: {
                select: { id: true, username: true, name: true, avatar: true },
              },
            },
          },
          reviewer: {
            select: { id: true, username: true, name: true },
          },
        },
      }),
      prisma.report.count({ where }),
      prisma.report.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    // Format counts
    const statusCounts: Record<string, number> = {
      OPEN: 0,
      REVIEWING: 0,
      RESOLVED: 0,
      DISMISSED: 0,
    };
    for (const row of counts) {
      statusCounts[row.status] = row._count._all;
    }

    return Response.json(
      {
        success: true,
        data: reports,
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
    console.error("[ADMIN_REPORTS_GET_ERROR]", err);
    return serverError();
  }
}