import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { ok, unauthorized, notFound, serverError } from "@/lib/api/response";

/**
 * GET /api/auth/me
 * Ambil data user yang sedang login.
 */
export async function GET() {
  try {
    // 1. Cek session
    const sessionUser = await getCurrentUser();

    if (!sessionUser) {
      return unauthorized();
    }

    // 2. Ambil data user lengkap dari database
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        avatar: true,
        bio: true,
        role: true,
        points: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            stories: true,
            contributions: true,
            savedStories: true,
            readingHistories: true,
            userAchievements: true,
          },
        },
      },
    });

    if (!user) {
      // Sesi valid tapi user sudah dihapus dari DB
      return notFound("User tidak ditemukan");
    }

    // 3. Return
    return ok({ user });
  } catch (err) {
    console.error("[ME_ERROR]", err);
    return serverError();
  }
}