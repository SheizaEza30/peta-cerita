import { NextRequest } from "next/server";


import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/roleGuard";
import {
  ok,
  notFound,
  badRequest,
  serverError,
} from "@/lib/api/response";
import { POINTS } from "@/lib/constants";
import { slugify } from "@/lib/utils";
import { checkAndUnlockAchievements } from "@/lib/achievements/rules";
import { createNotification } from "@/lib/notifications/create";

type RouteContext = {
  params: Promise<{ id: string }>;
};

/**
 * POST /api/admin/contributions/[id]/approve
 *
 * ALUR:
 * 1. Validasi kontribusi ada & status PENDING
 * 2. Cek kategori
 * 3. Buat Story baru dari submissionData
 * 4. Update Contribution: status=APPROVED, link ke Story
 * 5. Award poin +50 ke user
 * 6. Cek & unlock achievement
 * 7. Kirim notifikasi
 *
 * Semua dalam SATU transaksi database.
 */
export async function POST(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    // 1. Guard moderator/admin
    const moderator = await requireRole(["MODERATOR", "ADMIN"]);

    // 2. Ambil contribution
    const contribution = await prisma.contribution.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        status: true,
        submissionData: true,
        storyId: true,
      },
    });

    if (!contribution) return notFound("Kontribusi tidak ditemukan");

    if (contribution.status !== "PENDING") {
      return badRequest(
        `Kontribusi berstatus ${contribution.status}, hanya PENDING yang bisa disetujui`
      );
    }

    if (contribution.storyId) {
      return badRequest("Kontribusi ini sudah di-approve sebelumnya");
    }

    // 3. Parse submissionData
    const data = contribution.submissionData as {
      title: string;
      synopsis: string;
      content: string;
      categoryId: string;
      latitude: number;
      longitude: number;
      address?: string;
      city?: string;
      province?: string;
      country?: string;
      period?: string;
      source?: string;
      heroImage?: string;
      confirmAccurate?: boolean;
    };

    if (!data.title || !data.categoryId) {
      return badRequest("Data kontribusi tidak lengkap");
    }

    // 4. Cek kategori ada
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true, name: true },
    });
    if (!category) return badRequest("Kategori tidak ditemukan");

    // 5. Generate slug unik
    let slug = slugify(data.title);
    const existingSlug = await prisma.story.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // 6. TRANSACTION
    const result = await prisma.$transaction(async (tx) => {
      // 6a. Buat Story
      const story = await tx.story.create({
        data: {
          title: data.title,
          slug,
          synopsis: data.synopsis,
          content: data.content,
          categoryId: data.categoryId,
          latitude: data.latitude,
          longitude: data.longitude,
          address: data.address || null,
          city: data.city || null,
          province: data.province || null,
          country: data.country || "Indonesia",
          period: data.period || null,
          source: data.source || null,
          heroImage: data.heroImage || null,
          status: "PUBLISHED",
          authorId: contribution.userId,
          approvedBy: moderator.id,
          approvedAt: new Date(),
        },
        select: {
          id: true,
          slug: true,
          title: true,
        },
      });

      // 6b. Update Contribution
      await tx.contribution.update({
        where: { id: contribution.id },
        data: {
          status: "APPROVED",
          storyId: story.id,
          reviewedBy: moderator.id,
          reviewedAt: new Date(),
          rejectionReason: null,
        },
      });

      // 6c. Award poin APPROVED ke author
      await tx.pointTransaction.create({
        data: {
          userId: contribution.userId,
          points: POINTS.APPROVED,
          type: "APPROVED",
          description: `Kontribusi disetujui: ${data.title}`,
          metadata: {
            storyId: story.id,
            contributionId: contribution.id,
          },
        },
      });

      await tx.user.update({
        where: { id: contribution.userId },
        data: { points: { increment: POINTS.APPROVED } },
      });

      // 6d. Cek & unlock achievement
      const unlockedAchievements = await checkAndUnlockAchievements(
        tx,
        contribution.userId
      );

      return { story, unlockedAchievements };
    });

    // 7. Notifikasi (di luar transaksi — tidak critical)
    await createNotification({
      userId: contribution.userId,
      type: "CONTRIBUTION_APPROVED",
      title: "Kontribusi Disetujui! 🎉",
      message: `Cerita "${data.title}" telah disetujui dan dipublikasikan. Anda mendapat +${POINTS.APPROVED} poin.`,
      link: `/story/${result.story.slug}`,
      metadata: {
        storyId: result.story.id,
        points: POINTS.APPROVED,
      },
    });

    // Notifikasi untuk achievement yang baru terbuka
    for (const ach of result.unlockedAchievements) {
      await createNotification({
        userId: contribution.userId,
        type: "ACHIEVEMENT_UNLOCKED",
        title: "Achievement Terbuka! 🏆",
        message: `Anda membuka achievement "${ach.name}" dan mendapat +${ach.points} poin.`,
        link: "/profile/achievements",
        metadata: { achievementId: ach.id, points: ach.points },
      });
    }

    return ok({
      story: result.story,
      contributionId: contribution.id,
      pointsAwarded: POINTS.APPROVED,
      unlockedAchievements: result.unlockedAchievements,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_APPROVE_ERROR]", err);
    return serverError();
  }
}