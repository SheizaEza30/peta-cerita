import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/roleGuard";
import {
  ok,
  notFound,
  badRequest,
  validationError,
  serverError,
} from "@/lib/api/response";
import { rejectContributionSchema } from "@/lib/validation/contribution.schema";
import { createNotification } from "@/lib/notifications/create";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/admin/contributions/[id]/reject
 * Tolak kontribusi dengan alasan.
 * Status: PENDING → REJECTED
 * User bisa edit & resubmit setelah ditolak.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 1. Guard
    const moderator = await requireRole(["MODERATOR", "ADMIN"]);

    // 2. Cek kontribusi
    const contribution = await prisma.contribution.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        storyId: true,
        submissionData: true,
      },
    });

    if (!contribution) return notFound("Kontribusi tidak ditemukan");

    if (contribution.status !== "PENDING") {
      return badRequest(
        `Kontribusi berstatus ${contribution.status}, hanya PENDING yang bisa ditolak`
      );
    }

    if (contribution.storyId) {
      return badRequest("Kontribusi ini sudah di-approve sebelumnya");
    }

    // 3. Parse & validasi body
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = rejectContributionSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { rejectionReason } = parsed.data;

    // 4. Update Contribution
    const updated = await prisma.contribution.update({
      where: { id },
      data: {
        status: "REJECTED",
        rejectionReason,
        reviewedBy: moderator.id,
        reviewedAt: new Date(),
      },
      select: {
        id: true,
        status: true,
        rejectionReason: true,
        reviewedAt: true,
        updatedAt: true,
      },
    });

    // 5. Notifikasi ke user (di luar transaksi)
    const submissionData = contribution.submissionData as { title?: string };
    const title = submissionData?.title || "Kontribusi Anda";

    await createNotification({
      userId: contribution.userId,
      type: "CONTRIBUTION_REJECTED",
      title: "Kontribusi Perlu Diperbaiki",
      message: `Cerita "${title}" belum bisa dipublikasikan. Alasan: ${rejectionReason}. Silakan perbaiki dan ajukan ulang.`,
      link: `/profile/contributions`,
      metadata: {
        contributionId: contribution.id,
        rejectionReason,
      },
    });

    return ok({ contribution: updated });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_REJECT_ERROR]", err);
    return serverError();
  }
}