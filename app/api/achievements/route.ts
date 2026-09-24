import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ok, serverError } from "@/lib/api/response";

/**
 * GET /api/achievements
 * List semua achievement + status unlock user (kalau login).
 */
export async function GET() {
  try {
    const user = await getCurrentUser();

    // Ambil semua achievement
    const achievements = await prisma.achievement.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        description: true,
        icon: true,
        requirement: true,
        points: true,
        createdAt: true,
      },
    });

    // Kalau tidak login, return semua dengan unlocked: false
    if (!user) {
      return ok({
        achievements: achievements.map((a) => ({
          ...a,
          unlocked: false,
          unlockedAt: null,
        })),
        stats: {
          total: achievements.length,
          unlocked: 0,
        },
      });
    }

    // Ambil achievement user sudah unlock
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: user.id },
      select: {
        achievementId: true,
        unlockedAt: true,
      },
    });

    const unlockedMap = new Map(
      userAchievements.map((ua) => [ua.achievementId, ua.unlockedAt])
    );

    // Gabungkan
    const data = achievements.map((a) => ({
      ...a,
      unlocked: unlockedMap.has(a.id),
      unlockedAt: unlockedMap.get(a.id) ?? null,
    }));

    const unlockedCount = data.filter((a) => a.unlocked).length;

    return ok({
      achievements: data,
      stats: {
        total: achievements.length,
        unlocked: unlockedCount,
      },
    });
  } catch (err) {
    console.error("[ACHIEVEMENTS_GET_ERROR]", err);
    return serverError();
  }
}