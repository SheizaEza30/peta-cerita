import { NextRequest } from "next/server";

import { prisma } from "@/lib/db/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/validation/auth.schema";
import {
  ok,
  unauthorized,
  badRequest,
  validationError,
  serverError,
} from "@/lib/api/response";

/**
 * PUT /api/auth/profile
 * Update profile user (nama, bio, avatar).
 */
export async function PUT(req: NextRequest) {
  try {
    const sessionUser = await getCurrentUser();
    if (!sessionUser) return unauthorized();

    const body = await req.json().catch(() => null);
    if (!body) return badRequest("Body request tidak valid");

    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return validationError(parsed.error.flatten().fieldErrors);
    }

    const data = parsed.data;

    const updated = await prisma.user.update({
      where: { id: sessionUser.id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio || null }),
        ...(data.avatar !== undefined && { avatar: data.avatar || null }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        avatar: true,
      },
    });

    return ok({ user: updated });
  } catch (err) {
    console.error("[UPDATE_PROFILE_ERROR]", err);
    return serverError();
  }
}