import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { requireRole } from "@/lib/auth/roleGuard";
import {
  ok,
  noContent,
  notFound,
  badRequest,
  forbidden,
  validationError,
  serverError,
} from "@/lib/api/response";
import { updateUserRoleSchema } from "@/lib/validation/admin.schema";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// ============================================
// GET /api/admin/users/[id]
// Detail 1 user (ADMIN only).
// ============================================
export async function GET(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await requireRole(["ADMIN"]);

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        emailVerified: true,
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
            pointTransactions: true,
            reports: true,
          },
        },
      },
    });

    if (!user) return notFound("User tidak ditemukan");

    return ok({ user });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_USER_DETAIL_GET_ERROR]", err);
    return serverError();
  }
}

// ============================================
// PUT /api/admin/users/[id]
// Update role user (ADMIN only).
// ============================================
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const currentAdmin = await requireRole(["ADMIN"]);

    // Cek user ada
    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true },
    });
    if (!existing) return notFound("User tidak ditemukan");

    // Cegah admin ubah role sendiri
    if (existing.id === currentAdmin.id) {
      return badRequest(
        "Anda tidak dapat mengubah role Anda sendiri. Minta admin lain untuk melakukannya."
      );
    }

    // Parse & validasi
    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = updateUserRoleSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const { role } = parsed.data;

    // Cegah demote ADMIN terakhir
    if (existing.role === "ADMIN" && role !== "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return badRequest(
          "Tidak dapat mengubah role admin terakhir. Tambahkan admin lain terlebih dahulu."
        );
      }
    }

    // Update
    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        updatedAt: true,
      },
    });

    return ok({ user });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_USER_PUT_ERROR]", err);
    return serverError();
  }
}

// ============================================
// DELETE /api/admin/users/[id]
// Hapus user (ADMIN only).
// ============================================
export async function DELETE(_req: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const currentAdmin = await requireRole(["ADMIN"]);

    const existing = await prisma.user.findUnique({
      where: { id },
      select: { id: true, role: true, username: true },
    });
    if (!existing) return notFound("User tidak ditemukan");

    // Cegah hapus diri sendiri
    if (existing.id === currentAdmin.id) {
      return forbidden("Anda tidak dapat menghapus akun Anda sendiri");
    }

    // Cegah hapus admin terakhir
    if (existing.role === "ADMIN") {
      const adminCount = await prisma.user.count({
        where: { role: "ADMIN" },
      });
      if (adminCount <= 1) {
        return forbidden("Tidak dapat menghapus admin terakhir");
      }
    }

    // Hapus (cascade akan hapus stories, contributions, dll)
    await prisma.user.delete({ where: { id } });

    return noContent();
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("[ADMIN_USER_DELETE_ERROR]", err);
    return serverError();
  }
}