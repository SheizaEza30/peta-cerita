import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/roleGuard";
import { ok, serverError } from "@/lib/api/response";

/**
 * GET /api/admin/dashboard
 * Statistik untuk dashboard admin.
 * Akses: ADMIN, MODERATOR
 */
export async function GET() {
  try {
    await requireRole(["ADMIN", "MODERATOR"]);

    const [
      totalUsers,
      totalModerators,
      totalStories,
      publishedStories,
      totalContributions,
      pendingContributions,
      approvedContributions,
      rejectedContributions,
      totalReports,
      openReports,
      totalCategories,
      totalAchievements,
      recentContributions,
      topContributors,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { role: { in: ["MODERATOR", "ADMIN"] } } }),
      prisma.story.count(),
      prisma.story.count({ where: { status: "PUBLISHED" } }),
      prisma.contribution.count(),
      prisma.contribution.count({ where: { status: "PENDING" } }),
      prisma.contribution.count({ where: { status: "APPROVED" } }),
      prisma.contribution.count({ where: { status: "REJECTED" } }),
      prisma.report.count(),
      prisma.report.count({ where: { status: "OPEN" } }),
      prisma.category.count(),
      prisma.achievement.count(),
      prisma.contribution.findMany({
        where: { status: "PENDING" },
        orderBy: { createdAt: "asc" },
        take: 5,
        select: {
          id: true,
          status: true,
          createdAt: true,
          user: {
            select: { id: true, username: true, name: true, avatar: true },
          },
        },
      }),
      prisma.user.findMany({
        where: { points: { gt: 0 } },
        orderBy: { points: "desc" },
        take: 5,
        select: {
          id: true,
          username: true,
          name: true,
          avatar: true,
          points: true,
          _count: {
            select: { stories: true, contributions: true },
          },
        },
      }),
    ]);

    return ok({
      stats: {
        users: {
          total: totalUsers,
          moderators: totalModerators,
        },
        stories: {
          total: totalStories,
          published: publishedStories,
        },
        contributions: {
          total: totalContributions,
          pending: pendingContributions,
          approved: approvedContributions,
          rejected: rejectedContributions,
        },
        reports: {
          total: totalReports,
          open: openReports,
        },
        categories: totalCategories,
        achievements: totalAchievements,
      },
      recentContributions,
      topContributors,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_DASHBOARD_ERROR]", err);
    return serverError();
  }
}