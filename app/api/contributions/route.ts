import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  created,
  paginated,
  unauthorized,
  badRequest,
  validationError,
  serverError,
} from "@/lib/api/response";
import { submitContributionSchema } from "@/lib/validation/contribution.schema";
import { PAGINATION, POINTS } from "@/lib/constants";

/**
 * GET /api/contributions
 * List contributions milik user sendiri (butuh login).
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
    const status = searchParams.get("status");

    const where: Prisma.ContributionWhereInput = { userId: user.id };
    if (status) {
      const validStatuses = ["DRAFT", "PENDING", "APPROVED", "REJECTED"];
      if (validStatuses.includes(status)) {
        where.status = status as Prisma.EnumContributionStatusFilter["equals"];
      }
    }

    const [contributions, total] = await Promise.all([
      prisma.contribution.findMany({
        where,
        orderBy: { createdAt: "desc" },
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
          story: {
            select: { id: true, title: true, slug: true, status: true },
          },
          reviewer: {
            select: { id: true, username: true, name: true },
          },
        },
      }),
      prisma.contribution.count({ where }),
    ]);

    return paginated(contributions, { page, limit, total });
  } catch (err) {
    console.error("[CONTRIBUTIONS_GET_ERROR]", err);
    return serverError();
  }
}

/**
 * POST /api/contributions
 * Submit kontribusi baru (status PENDING).
 * User langsung dapat poin SUBMIT.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = submitContributionSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;

    // Cek kategori ada
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
      select: { id: true },
    });
    if (!category) return badRequest("Kategori tidak valid");

    // Transaksi: buat contribution + tambah poin + catat transaksi poin
    const result = await prisma.$transaction(async (tx) => {
      const contribution = await tx.contribution.create({
        data: {
          userId: user.id,
          status: "PENDING",
          submissionData: data as unknown as Prisma.InputJsonValue,
        },
        select: {
          id: true,
          status: true,
          createdAt: true,
        },
      });

      // Award poin SUBMIT
      await tx.pointTransaction.create({
        data: {
          userId: user.id,
          points: POINTS.SUBMIT,
          type: "SUBMIT",
          description: `Kontribusi dikirim: ${data.title}`,
          metadata: { contributionId: contribution.id },
        },
      });

      await tx.user.update({
        where: { id: user.id },
        data: { points: { increment: POINTS.SUBMIT } },
      });

      return contribution;
    });

    return created({ contribution: result });
  } catch (err) {
    console.error("[CONTRIBUTIONS_POST_ERROR]", err);
    return serverError();
  }
}