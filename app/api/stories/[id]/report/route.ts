import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  created,
  unauthorized,
  notFound,
  badRequest,
  validationError,
  conflict,
  serverError,
} from "@/lib/api/response";
import { createReportSchema } from "@/lib/validation/report.schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/stories/[id]/report
 * Laporkan cerita bermasalah.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { id: storyId } = await context.params;

    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Cek story ada
    const story = await prisma.story.findUnique({
      where: { id: storyId },
      select: { id: true },
    });
    if (!story) return notFound("Cerita tidak ditemukan");

    // Parse & validasi
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = createReportSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { reason, description } = parsed.data;

    // Cek: user sudah pernah report cerita ini?
    const existingReport = await prisma.report.findFirst({
      where: {
        userId: user.id,
        storyId,
        status: { in: ["OPEN", "REVIEWING"] },
      },
      select: { id: true, createdAt: true },
    });

    if (existingReport) {
      return conflict(
        "Anda sudah melaporkan cerita ini. Laporan sedang dalam penanganan."
      );
    }

    // Buat report
    const report = await prisma.report.create({
      data: {
        userId: user.id,
        storyId,
        reason,
        description: description || null,
        status: "OPEN",
      },
      select: {
        id: true,
        reason: true,
        status: true,
        createdAt: true,
      },
    });

    return created({ report });
  } catch (err) {
    console.error("[STORY_REPORT_POST_ERROR]", err);
    return serverError();
  }
}