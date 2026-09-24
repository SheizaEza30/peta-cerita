import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import {
  paginated,
  unauthorized,
  validationError,
  serverError,
} from "@/lib/api/response";
import { PAGINATION } from "@/lib/constants";

/**
 * GET /api/points/history?page=1&limit=20&type=SUBMIT
 * Riwayat transaksi poin user.
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Parse query
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
    const type = searchParams.get("type");

    if (isNaN(page) || isNaN(limit)) {
      return validationError({ _form: ["Parameter page/limit tidak valid"] });
    }

    // Build where
    const where: Prisma.PointTransactionWhereInput = { userId: user.id };

    if (type) {
      const validTypes = ["SUBMIT", "APPROVED", "ACHIEVEMENT", "BONUS", "ADJUSTMENT"];
      if (!validTypes.includes(type)) {
        return validationError({ type: ["Tipe tidak valid"] });
      }
      where.type = type as Prisma.EnumPointTypeFilter["equals"];
    }

    // Query paralel
    const [transactions, total] = await Promise.all([
      prisma.pointTransaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          points: true,
          type: true,
          description: true,
          metadata: true,
          createdAt: true,
        },
      }),
      prisma.pointTransaction.count({ where }),
    ]);

    return paginated(transactions, { page, limit, total });
  } catch (err) {
    console.error("[POINTS_HISTORY_GET_ERROR]", err);
    return serverError();
  }
}