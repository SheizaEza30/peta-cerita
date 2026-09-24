import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  ok,
  unauthorized,
  forbidden,
  notFound,
  badRequest,
  validationError,
  serverError,
} from "@/lib/api/response";
import { updateContributionSchema } from "@/lib/validation/contribution.schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// GET /api/contributions/[id]
// Detail 1 contribution (milik user sendiri).
// ============================================
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const contribution = await prisma.contribution.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        submissionData: true,
        rejectionReason: true,
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
        userId: true,
        story: {
          select: {
            id: true,
            title: true,
            slug: true,
            status: true,
          },
        },
        reviewer: {
          select: { id: true, username: true, name: true },
        },
      },
    });

    if (!contribution) return notFound("Kontribusi tidak ditemukan");

    // User hanya bisa lihat kontribusi miliknya sendiri
    // Kecuali moderator/admin
    const isOwner = contribution.userId === user.id;
    const isModerator = user.role === "MODERATOR" || user.role === "ADMIN";

    if (!isOwner && !isModerator) {
      return forbidden("Anda tidak berhak melihat kontribusi ini");
    }

    return ok({ contribution });
  } catch (err) {
    console.error("[CONTRIBUTION_GET_ERROR]", err);
    return serverError();
  }
}

// ============================================
// PUT /api/contributions/[id]
// Update contribution (hanya author, hanya kalau status DRAFT atau REJECTED).
// ============================================
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Cek contribution ada & milik user
    const existing = await prisma.contribution.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        submissionData: true,
      },
    });

    if (!existing) return notFound("Kontribusi tidak ditemukan");

    if (existing.userId !== user.id) {
      return forbidden("Anda tidak berhak mengubah kontribusi ini");
    }

    // Hanya boleh edit kalau status DRAFT atau REJECTED
    if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
      return badRequest(
        "Kontribusi hanya dapat diubah jika berstatus DRAFT atau REJECTED"
      );
    }

    // Parse & validasi
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = updateContributionSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    // Merge submissionData lama + baru
    const oldData = (existing.submissionData as Record<string, unknown>) || {};
    const mergedData = { ...oldData, ...parsed.data };

    // Update contribution — reset ke PENDING kalau sebelumnya REJECTED (resubmit)
    // tapi kita akan bedakan endpoint resubmit vs edit biasa.
    // Endpoint ini hanya edit saja: status tetap.
    const contribution = await prisma.contribution.update({
      where: { id },
      data: {
        submissionData: mergedData,
      },
      select: {
        id: true,
        status: true,
        submissionData: true,
        updatedAt: true,
      },
    });

    return ok({ contribution });
  } catch (err) {
    console.error("[CONTRIBUTION_PUT_ERROR]", err);
    return serverError();
  }
}

// ============================================
// DELETE /api/contributions/[id]
// Hapus contribution (hanya author, hanya kalau DRAFT atau REJECTED).
// ============================================
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const existing = await prisma.contribution.findUnique({
      where: { id },
      select: { id: true, userId: true, status: true },
    });

    if (!existing) return notFound("Kontribusi tidak ditemukan");
    if (existing.userId !== user.id) return forbidden();

    if (existing.status !== "DRAFT" && existing.status !== "REJECTED") {
      return badRequest(
        "Kontribusi hanya dapat dihapus jika berstatus DRAFT atau REJECTED"
      );
    }

    await prisma.contribution.delete({ where: { id } });

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[CONTRIBUTION_DELETE_ERROR]", err);
    return serverError();
  }
}