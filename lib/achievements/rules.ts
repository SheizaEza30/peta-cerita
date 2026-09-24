import type { Prisma } from "@prisma/client";

/**
 * Cek & unlock achievement setelah action tertentu.
 * HARUS dipanggil di dalam transaksi Prisma (pakai tx).
 */
export async function checkAndUnlockAchievements(
  tx: Prisma.TransactionClient,
  userId: string
) {
  // 1. Hitung berapa cerita approved user
  const approvedCount = await tx.story.count({
    where: { authorId: userId, status: "PUBLISHED" },
  });

  // 2. Ambil semua achievement yang ada
  const allAchievements = await tx.achievement.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      requirement: true,
      points: true,
      icon: true,
    },
  });

  // 3. Achievement yang sudah dimiliki user
  const owned = await tx.userAchievement.findMany({
    where: { userId },
    select: { achievementId: true },
  });
  const ownedIds = new Set(owned.map((o) => o.achievementId));

  // 4. Cek setiap achievement
  const unlockedNow: { id: string; name: string; points: number }[] = [];

  for (const ach of allAchievements) {
    if (ownedIds.has(ach.id)) continue;

    let shouldUnlock = false;

    try {
      const req = JSON.parse(ach.requirement) as {
        type: string;
        value: number;
      };

      switch (req.type) {
        case "story_count":
          shouldUnlock = approvedCount >= req.value;
          break;
        default:
          shouldUnlock = false;
      }
    } catch {
      continue;
    }

    if (shouldUnlock) {
      await tx.userAchievement.create({
        data: { userId, achievementId: ach.id },
      });

      if (ach.points > 0) {
        await tx.pointTransaction.create({
          data: {
            userId,
            points: ach.points,
            type: "ACHIEVEMENT",
            description: `Achievement unlocked: ${ach.name}`,
            metadata: { achievementId: ach.id },
          },
        });

        await tx.user.update({
          where: { id: userId },
          data: { points: { increment: ach.points } },
        });
      }

      unlockedNow.push({
        id: ach.id,
        name: ach.name,
        points: ach.points,
      });
    }
  }

  return unlockedNow;
}