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
import { contributionBaseSchema } from "@/lib/validation/contribution.schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/contributions/[id]/resubmit
 * Resubmit kontribusi yang ditolak.
 * - Status harus REJECTED
 * - Data baru (opsional) menggantikan submissionData lama
 * - Status berubah jadi PENDING
 * - rejectionReason direset (null)
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // 1. Cek contribution ada & milik user
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

    // 2. Hanya REJECTED yang bisa diresubmit
    if (existing.status !== "REJECTED") {
      return badRequest(
        "Hanya kontribusi yang ditolak (REJECTED) dapat diajukan ulang"
      );
    }

    // 3. Parse body — semua field opsional (kalau tidak dikirim, pakai data lama)
    const body = await req.json().catch(() => ({}));

    // Kalau body kosong, pakai data lama
    const submissionDataToValidate =
      Object.keys(body).length > 0
        ? body
        : (existing.submissionData as Record<string, unknown>);

    const parsed = contributionBaseSchema.safeParse(submissionDataToValidate);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const newSubmissionData = parsed.data;

    // 4. Update: status jadi PENDING, rejectionReason null
    const contribution = await prisma.contribution.update({
      where: { id },
      data: {
        status: "PENDING",
        submissionData: newSubmissionData,
        rejectionReason: null,
        reviewedBy: null,
        reviewedAt: null,
      },
      select: {
        id: true,
        status: true,
        submissionData: true,
        updatedAt: true,
      },
    });

    // 5. Notifikasi ke user (opsional) — nanti buat notifikasi
    // await createNotification({ ... });

    return ok({ contribution });
  } catch (err) {
    console.error("[CONTRIBUTION_RESUBMIT_ERROR]", err);
    return serverError();
  }
}