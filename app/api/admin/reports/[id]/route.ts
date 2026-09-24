import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/roleGuard";
import {
  ok,
  notFound,
  validationError,
  serverError,
} from "@/lib/api/response";
import { updateReportSchema } from "@/lib/validation/report.schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// GET /api/admin/reports/[id]
// Detail 1 report.
// ============================================
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await requireRole(["MODERATOR", "ADMIN"]);

    const report = await prisma.report.findUnique({
      where: { id },
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
            synopsis: true,
            content: true,
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                email: true,
                avatar: true,
              },
            },
          },
        },
        reviewer: {
          select: { id: true, username: true, name: true },
        },
      },
    });

    if (!report) return notFound("Laporan tidak ditemukan");

    return ok({ report });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_REPORT_DETAIL_GET_ERROR]", err);
    return serverError();
  }
}

// ============================================
// PUT /api/admin/reports/[id]
// Update status & catatan review report.
// ============================================
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const moderator = await requireRole(["MODERATOR", "ADMIN"]);

    // Cek report ada
    const existing = await prisma.report.findUnique({
      where: { id },
      select: { id: true, status: true },
    });
    if (!existing) return notFound("Laporan tidak ditemukan");

    // Parse & validasi
    const body = await req.json().catch(() => null);
    if (!body) return notFound("Body request tidak valid");

    const parsed = updateReportSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { status, reviewNote } = parsed.data;

    // Update
    const updated = await prisma.report.update({
      where: { id },
      data: {
        status,
        reviewNote: reviewNote || null,
        reviewedBy: moderator.id,
        reviewedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        reviewNote: true,
        reviewedAt: true,
        updatedAt: true,
      },
    });

    return ok({ report: updated });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_REPORT_DETAIL_PUT_ERROR]", err);
    return serverError();
  }
}