import { PrismaClient } from "@prisma/client";

/**
 * Prisma Client singleton.
 *
 * Di development, Next.js hot reload akan membuat instance baru setiap
 * kali file berubah. Kita simpan instance di `globalThis` supaya hanya
 * ada 1 instance.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.DEBUG_PRISMA === "true"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;