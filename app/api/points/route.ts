import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ok, unauthorized, serverError } from "@/lib/api/response";
import { POINTS } from "@/lib/constants";

/**
 * GET /api/points
 * Ambil total poin user + ringkasan per tipe.
 */
export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Ambil total poin user dari DB (fresh, bukan dari session)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { points: true },
    });

    if (!dbUser) return unauthorized();

    // Agregasi poin per tipe
    const grouped = await prisma.pointTransaction.groupBy({
      by: ["type"],
      where: { userId: user.id },
      _sum: { points: true },
      _count: { _all: true },
    });

    // Format: { SUBMIT: { total: 25, count: 5 }, APPROVED: { total: 300, count: 6 }, ... }
    const summary: Record<string, { total: number; count: number }> = {
      SUBMIT: { total: 0, count: 0 },
      APPROVED: { total: 0, count: 0 },
      ACHIEVEMENT: { total: 0, count: 0 },
      BONUS: { total: 0, count: 0 },
      ADJUSTMENT: { total: 0, count: 0 },
    };

    for (const row of grouped) {
      summary[row.type] = {
        total: row._sum.points ?? 0,
        count: row._count._all,
      };
    }

    return ok({
      totalPoints: dbUser.points,
      summary,
      config: {
        SUBMIT: POINTS.SUBMIT,
        APPROVED: POINTS.APPROVED,
        ACHIEVEMENT: POINTS.ACHIEVEMENT,
      },
    });
  } catch (err) {
    console.error("[POINTS_GET_ERROR]", err);
    return serverError();
  }
}